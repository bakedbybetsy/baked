// ─────────────────────────────────────────────────────────────────────────
//  The Store — the single source of truth for the whole site.
//
//  Four nouns and nothing more:
//    products  — what Betsy bakes
//    bakeDays  — the oven racks (a date + a capacity + open/closed)
//    orders    — a claim on bread (a shelf grab, or a reservation)
//    customers — a name + phone, with a gentle "flaked last time" flag
//
//  Two kinds of bread, obeying different physics:
//    PRESENT (the shelf)  — loaves that exist right now; grab and go.
//    PROMISED (the oven)  — capacity for a future bake; reserve ahead.
//                           Betsy bakes only what gets promised.
//
//  For this prototype the state lives in the browser (localStorage) so it can
//  be opened with no server. Every read/write goes through this module, so
//  swapping to a real backend later means changing only the functions below.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  const KEY = "bbb_state_v1";
  const DAY = 86400000;

  // ── date helpers ────────────────────────────────────────────────────────
  const iso = (d) => d.toISOString().slice(0, 10);
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const parse = (s) => { const d = new Date(s + "T00:00:00"); d.setHours(0, 0, 0, 0); return d; };
  const fmtDay = (s) => parse(s).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  const weekdayName = (i) => ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][i];

  // ── seeding the autopilot ────────────────────────────────────────────────
  // Roll the recurring default forward to populate the next few weeks of racks.
  function seedBakeDays() {
    const days = [];
    const start = today();
    for (let i = 1; i <= 24; i++) {           // look ~3.5 weeks ahead
      const d = new Date(+start + i * DAY);
      const tmpl = CONFIG.defaultBakeDays.find((t) => t.weekday === d.getDay());
      if (tmpl) {
        days.push({
          id: "bd_" + iso(d),
          date: iso(d),
          capacity: tmpl.capacity,
          open: true,            // autopilot opens it; Betsy can override
          fromDefault: true,
        });
      }
    }
    return days;
  }

  function freshState() {
    return {
      storeOpen: true,                      // the master "is the oven on" switch
      brandName: CONFIG.brandName,
      products: CONFIG.products.map((p) => ({ ...p })),
      shelf: Object.fromEntries(CONFIG.products.map((p) => [p.id, p.shelf || 0])),
      bakeDays: seedBakeDays(),
      orders: [],
      customers: {},                        // keyed by phone
      defaults: CONFIG.defaultBakeDays.map((d) => ({ ...d })),
    };
  }

  // ── load / save ──────────────────────────────────────────────────────────
  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : freshState();
    } catch { state = freshState(); }
    // Always keep the oven horizon topped up as days pass.
    refreshHorizon();
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
    // Wake up any other open tab (storefront <-> admin live sync).
    window.dispatchEvent(new CustomEvent("store:changed"));
  }

  // Drop past days; extend future ones from the autopilot template.
  function refreshHorizon() {
    const start = today();
    state.bakeDays = state.bakeDays.filter((b) => parse(b.date) >= start);
    for (let i = 1; i <= 24; i++) {
      const d = new Date(+start + i * DAY);
      const tmpl = state.defaults.find((t) => t.weekday === d.getDay());
      if (tmpl && !state.bakeDays.some((b) => b.date === iso(d))) {
        state.bakeDays.push({ id: "bd_" + iso(d), date: iso(d), capacity: tmpl.capacity, open: true, fromDefault: true });
      }
    }
    state.bakeDays.sort((a, b) => a.date.localeCompare(b.date));
  }

  // ── derived reads ─────────────────────────────────────────────────────────
  const reservationsFor = (bakeDayId) =>
    state.orders.filter((o) => o.type === "reserve" && o.bakeDayId === bakeDayId && o.status !== "cancelled");

  const slotsLeft = (bd) => Math.max(0, bd.capacity - reservationsFor(bd.id).length);

  // The cutoff moment for a bake day — promising closes cutoffDays before it,
  // giving Betsy time to feed the starter and let it rest in the fridge.
  function cutoffFor(bd) {
    const c = new Date(+parse(bd.date) - CONFIG.cutoffDays * DAY);
    c.setHours(CONFIG.cutoffHour, 0, 0, 0);
    return c;
  }

  // A bake day is "claimable" when the store is on, the day is open, it isn't
  // full, and we're inside its promising window (opens early, closes before prep).
  function windowState(bd) {
    const now = new Date();
    const opensAt = new Date(+parse(bd.date) - CONFIG.openLeadDays * DAY);
    if (now < opensAt) return "soon";        // not open for promising yet
    if (now > cutoffFor(bd)) return "closed"; // past the prep-time cutoff
    return "open";
  }

  function visibleBakeDays() {
    return state.bakeDays
      .filter((bd) => bd.open && state.storeOpen)
      .map((bd) => ({
        ...bd,
        left: slotsLeft(bd),
        filled: reservationsFor(bd.id).length,
        phase: windowState(bd),
        cutoff: iso(cutoffFor(bd)),
      }))
      .filter((bd) => bd.phase !== "soon");  // only show what people can act on
  }

  const productById = (id) => state.products.find((p) => p.id === id);
  const activeProducts = () => state.products.filter((p) => p.active);
  const shelfCount = (pid) => state.shelf[pid] || 0;

  // ── writes (the verbs) ─────────────────────────────────────────────────────

  // A walk-up grab from the shelf. Returns the order, or null if sold out.
  function grabFromShelf(productId, customer) {
    if (shelfCount(productId) <= 0) return null;
    state.shelf[productId] -= 1;
    const order = pushOrder({ type: "shelf", productId, customer });
    save();
    return order;
  }

  // Reserve a slot in the oven for a future bake day. Returns order or null.
  function reserve(bakeDayId, productId, customer) {
    const bd = state.bakeDays.find((b) => b.id === bakeDayId);
    if (!bd || !bd.open || !state.storeOpen) return null;
    if (windowState(bd) !== "open") return null;
    if (slotsLeft(bd) <= 0) return null;
    const order = pushOrder({ type: "reserve", productId, bakeDayId, bakeDate: bd.date, customer });
    save();
    return order;
  }

  function pushOrder({ type, productId, bakeDayId, bakeDate, customer }) {
    const cust = rememberCustomer(customer);
    const order = {
      id: "ord_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      type, productId, bakeDayId, bakeDate,
      customer: { name: cust.name, phone: cust.phone },
      status: type === "shelf" ? "awaiting-pickup" : "reserved",
      paid: false,
      createdAt: new Date().toISOString(),
    };
    state.orders.unshift(order);
    return order;
  }

  function rememberCustomer({ name, phone }) {
    const key = (phone || "").replace(/\D/g, "");
    if (!state.customers[key]) state.customers[key] = { name, phone, flaked: false, orders: 0 };
    state.customers[key].name = name;
    state.customers[key].orders += 1;
    return state.customers[key];
  }
  const customerFor = (phone) => state.customers[(phone || "").replace(/\D/g, "")] || null;

  // ── Betsy's admin verbs ────────────────────────────────────────────────────
  function setStoreOpen(on) { state.storeOpen = !!on; save(); }
  function setBrandName(name) { state.brandName = name; save(); }

  function setDayCapacity(bakeDayId, capacity) {
    const bd = state.bakeDays.find((b) => b.id === bakeDayId);
    if (bd) { bd.capacity = Math.max(0, capacity | 0); bd.fromDefault = false; save(); }
  }
  function setDayOpen(bakeDayId, open) {
    const bd = state.bakeDays.find((b) => b.id === bakeDayId);
    if (bd) { bd.open = !!open; bd.fromDefault = false; save(); }
  }

  function setShelf(productId, count) { state.shelf[productId] = Math.max(0, count | 0); save(); }

  function saveProduct(p) {
    const existing = productById(p.id);
    if (existing) Object.assign(existing, p);
    else state.products.push({ active: true, shelf: 0, ...p });
    if (!(p.id in state.shelf)) state.shelf[p.id] = 0;
    save();
  }
  function deleteProduct(id) {
    state.products = state.products.filter((p) => p.id !== id);
    delete state.shelf[id];
    save();
  }

  // Order lifecycle. A no-show loaf was baked (it was promised) — so it falls
  // out of the oven and lands on the shelf, exactly like real bread.
  function markPaid(orderId, paid) {
    const o = state.orders.find((x) => x.id === orderId);
    if (o) { o.paid = !!paid; if (paid && o.status === "reserved") o.status = "ready"; save(); }
  }
  function markPicked(orderId) {
    const o = state.orders.find((x) => x.id === orderId);
    if (o) { o.status = "picked-up"; save(); }
  }
  function markNoShow(orderId) {
    const o = state.orders.find((x) => x.id === orderId);
    if (!o) return;
    o.status = "no-show";
    if (o.phone || o.customer?.phone) { const c = customerFor(o.customer.phone); if (c) c.flaked = true; }
    // The baked-but-unclaimed loaf moves to today's shelf.
    state.shelf[o.productId] = (state.shelf[o.productId] || 0) + 1;
    save();
  }

  function resetDemo() { state = freshState(); save(); }

  // ── public surface ─────────────────────────────────────────────────────────
  window.Store = {
    load, save,
    get state() { return state; },
    // reads
    activeProducts, productById, shelfCount, visibleBakeDays, customerFor,
    reservationsFor, slotsLeft, windowState,
    // customer verbs
    grabFromShelf, reserve,
    // admin verbs
    setStoreOpen, setBrandName, setDayCapacity, setDayOpen, setShelf,
    saveProduct, deleteProduct, markPaid, markPicked, markNoShow, resetDemo,
    // helpers
    fmtDay, weekdayName,
  };

  load();
})();
