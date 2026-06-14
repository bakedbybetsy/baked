// ─────────────────────────────────────────────────────────────────────────
//  Betsy's kitchen. Three verbs, really: set the oven, tend the shelf,
//  see who's coming. Built to run from a phone while the kettle boils.
// ─────────────────────────────────────────────────────────────────────────

const root = document.getElementById("admin");
const UNLOCK = "bbb_unlocked";
let orderTab = "new";

function isUnlocked() { return sessionStorage.getItem(UNLOCK) === "1"; }

function render() {
  if (!isUnlocked()) return renderGate();
  const s = Store.state;
  root.innerHTML = `
    ${glance(s)}
    ${master(s)}
    ${ordersPanel(s)}
    ${ovenPanel(s)}
    ${shelfPanel(s)}
    ${menuPanel(s)}
    <div style="text-align:center;padding:20px 0 50px">
      <button class="danger-link" onclick="resetDemo()">reset the demo data</button>
    </div>
  `;
}

// ── password gate ──────────────────────────────────────────────────────────
function renderGate() {
  root.innerHTML = `
    <div class="gate">
      ${UI.seal(120)}
      <h2 style="margin-top:18px">Betsy's Kitchen</h2>
      <div class="muted" style="font-size:.85rem">Just for you. Pop in your word.</div>
      <input id="pw" type="password" placeholder="password" autofocus />
      <button class="btn accent" style="width:100%" onclick="tryUnlock()">Open the kitchen</button>
    </div>`;
  const i = document.getElementById("pw");
  i.addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
  i.focus();
}
function tryUnlock() {
  const v = document.getElementById("pw").value;
  if (v === CONFIG.adminPassword) {
    sessionStorage.setItem(UNLOCK, "1");
    render();
  } else {
    UI.toast("Hmm, not quite. Try again.");
  }
}

// ── the big glance ─────────────────────────────────────────────────────────
function nextBake() {
  const open = Store.state.bakeDays.filter((b) => b.open && Store.windowState(b) !== "soon");
  return open.sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}
function glance(s) {
  if (!s.storeOpen) {
    return `<div class="glance"><div class="big"><div class="num">—</div><div class="lbl">the oven is off</div></div>
      <div class="side">Flip it back on below<br/>when you're ready to bake.</div></div>`;
  }
  const bd = nextBake();
  const toBake = bd ? Store.reservationsFor(bd.id).length : 0;
  const newCount = s.orders.filter((o) => o.status === "reserved" && !o._seen).length
                 + s.orders.filter((o) => o.status === "awaiting-pickup").length;
  const owed = s.orders.filter((o) => !o.paid && o.status !== "no-show" && o.status !== "picked-up")
                 .reduce((sum, o) => sum + (Store.productById(o.productId)?.price || 0), 0);
  return `
  <div class="glance">
    <div class="big">
      <div class="num">${toBake}</div>
      <div class="lbl">${toBake === 1 ? "loaf" : "loaves"} to bake${bd ? " · " + Store.weekdayName(new Date(bd.date+"T00:00:00").getDay()) : ""}</div>
    </div>
    <div class="side">
      <div><b>${newCount}</b> order${newCount===1?"":"s"} to see</div>
      <div><b>${UI.money(owed)}</b> still owed</div>
    </div>
  </div>`;
}

// ── master switch ──────────────────────────────────────────────────────────
function master(s) {
  return `
  <div class="master">
    <div class="lbl"><b>Accepting orders</b><div>Turn this off for a vacation or a busy week — the shop shows a friendly "resting" note.</div></div>
    <label class="switch"><input type="checkbox" ${s.storeOpen ? "checked" : ""} onchange="Store.setStoreOpen(this.checked)"><span class="track"></span></label>
  </div>`;
}

// ── orders inbox ───────────────────────────────────────────────────────────
function ordersPanel(s) {
  const all = s.orders;
  const filtered = all.filter((o) => {
    if (orderTab === "new") return o.status === "reserved" || o.status === "awaiting-pickup";
    if (orderTab === "owed") return !o.paid && o.status !== "no-show" && o.status !== "picked-up";
    return true;
  });
  return `
  <div class="panel">
    <h2>Orders</h2>
    <div class="hint">New reservations and grabs land here. Mark them paid and picked up as they go.</div>
    <div class="tabbar">
      ${["new","owed","all"].map((t) => `<button class="${orderTab===t?"on":""}" onclick="setTab('${t}')">${{new:"To handle",owed:"Owed",all:"Everything"}[t]}</button>`).join("")}
    </div>
    ${filtered.length ? filtered.map(orderRow).join("") : `<div class="empty">Nothing here yet. When someone orders, you'll see them.</div>`}
  </div>`;
}
function orderRow(o) {
  const p = Store.productById(o.productId);
  const cust = Store.customerFor(o.customer.phone);
  const when = o.type === "reserve" ? "reserve · " + Store.fmtDay(o.bakeDate) : "shelf · today";
  const statusPill = o.status === "picked-up" ? `<span class="pill done">picked up</span>`
    : o.status === "no-show" ? `<span class="pill done">no-show → shelf</span>`
    : o.paid ? `<span class="pill paid">paid</span>`
    : o.type === "shelf" ? `<span class="pill shelf">grab</span>`
    : `<span class="pill reserved">reserved</span>`;
  const done = o.status === "picked-up" || o.status === "no-show";
  return `
  <div class="order">
    <div class="oinfo">
      <div class="who">${o.customer.name} ${statusPill}</div>
      <div class="what">${p ? p.name : "—"} · ${when} · ${UI.money(p?.price||0)}</div>
      ${cust && cust.flaked && o.status!=="no-show" ? `<div class="flake">⚠ flagged: unpaid loaf before</div>` : ""}
    </div>
    <div class="acts">
      ${done ? "" : `
        ${o.paid ? "" : `<button class="btn ghost sm" onclick="pay('${o.id}')">Mark paid</button>`}
        <button class="btn sm" onclick="picked('${o.id}')">Picked up</button>
        ${o.type==="reserve" ? `<button class="btn ghost sm" title="Didn't show — loaf goes to the shelf" onclick="noshow('${o.id}')">No-show</button>` : ""}
      `}
    </div>
  </div>`;
}

// ── the oven (capacity + open/close per day) ───────────────────────────────
function ovenPanel(s) {
  const days = s.bakeDays.slice(0, 10);
  return `
  <div class="panel">
    <h2>The Oven</h2>
    <div class="hint">Each day fills up as people reserve. Slide to change how many you'll bake, or switch a day off entirely. Your usual days open on their own.</div>
    ${days.map(admDay).join("")}
  </div>`;
}
function admDay(bd) {
  const filled = Store.reservationsFor(bd.id).length;
  const wd = Store.weekdayName(new Date(bd.date+"T00:00:00").getDay());
  return `
  <div class="adm-day ${bd.open ? "" : "off"}">
    <div class="d-when"><b>${wd}</b><span>${Store.fmtDay(bd.date)}${filled?` · ${filled} promised`:""}</span></div>
    <div class="cap">
      <input type="range" min="${filled}" max="20" value="${bd.capacity}" ${bd.open?"":"disabled"}
        oninput="this.nextElementSibling.textContent=this.value"
        onchange="Store.setDayCapacity('${bd.id}', +this.value)">
      <span class="capnum">${bd.capacity}</span>
    </div>
    <label class="switch d-toggle"><input type="checkbox" ${bd.open?"checked":""} onchange="Store.setDayOpen('${bd.id}', this.checked)"><span class="track"></span></label>
  </div>`;
}

// ── the shelf (how many of each, on hand now) ──────────────────────────────
function shelfPanel(s) {
  return `
  <div class="panel">
    <h2>The Shelf</h2>
    <div class="hint">Loaves you've got on hand right now for walk-ups. Set the count after a bake; it ticks down as people grab them.</div>
    ${Store.activeProducts().map((p) => `
      <div class="shelf-row">
        <div class="pinfo"><span class="mini">${artFor(p.icon)}</span><span>${p.name}</span></div>
        <div class="stepper">
          <button onclick="bumpShelf('${p.id}',-1)">−</button>
          <span class="v">${Store.shelfCount(p.id)}</span>
          <button onclick="bumpShelf('${p.id}',1)">+</button>
        </div>
      </div>`).join("")}
  </div>`;
}

// ── the menu (products) ────────────────────────────────────────────────────
function menuPanel(s) {
  return `
  <div class="panel">
    <h2>The Menu</h2>
    <div class="hint">Your loaves and their prices. Switch one off to hide it, or add a new bake.</div>
    ${s.products.map(prodRow).join("")}
    <div style="margin-top:14px"><button class="btn" onclick="editProduct()">+ Add a loaf</button></div>
  </div>`;
}
function prodRow(p) {
  return `
  <div class="prod-row ${p.active?"":"off"}">
    <div class="pinfo">
      <span class="mini">${artFor(p.icon)}</span>
      <div style="min-width:0">
        <div class="nm">${p.name} ${p.special?`<span class="tag">special</span>`:""} <span class="muted" style="font-weight:400">· ${UI.money(p.price)}</span></div>
        <div class="bl">${p.blurb}</div>
      </div>
    </div>
    <div class="acts">
      <label class="switch"><input type="checkbox" ${p.active?"checked":""} onchange="toggleProduct('${p.id}',this.checked)"><span class="track"></span></label>
      <button class="btn ghost sm" onclick="editProduct('${p.id}')">Edit</button>
    </div>
  </div>`;
}

// ── actions ────────────────────────────────────────────────────────────────
function setTab(t) { orderTab = t; render(); }
function pay(id) { Store.markPaid(id, true); UI.toast("Marked paid."); }
function picked(id) { Store.markPicked(id); UI.toast("Picked up — enjoy the bread!"); }
function noshow(id) { Store.markNoShow(id); UI.toast("No-show. The loaf's on the shelf now."); }
function bumpShelf(pid, d) { Store.setShelf(pid, Store.shelfCount(pid) + d); }
function toggleProduct(id, on) { const p = Store.productById(id); Store.saveProduct({ ...p, active: on }); }
function resetDemo() { if (confirm("Reset all demo data back to the starting point?")) { Store.resetDemo(); UI.toast("Fresh start."); } }

function editProduct(id) {
  const p = id ? Store.productById(id) : { id: "p_" + Date.now(), name: "", price: 9, blurb: "", icon: "boule", active: true, special: false };
  const m = document.getElementById("modal");
  m.innerHTML = `
    <h3>${id ? "Edit loaf" : "New loaf"}</h3>
    <label>Name</label><input id="e-name" value="${p.name}" placeholder="Classic Sourdough" />
    <label>Price (dollars)</label><input id="e-price" type="number" min="0" step="1" value="${p.price}" />
    <label>A line about it</label><input id="e-blurb" value="${p.blurb || ""}" placeholder="Crackling crust, open crumb…" />
    <label>Drawing</label>
    <select id="e-icon">${["boule","batard","seeded","swirl","baguette"].map((k) => `<option value="${k}" ${p.icon===k?"selected":""}>${k}</option>`).join("")}</select>
    <label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:.9rem;margin-top:14px">
      <input type="checkbox" id="e-special" ${p.special?"checked":""} style="width:auto"> This is the monthly special
    </label>
    <div class="row">
      ${id ? `<button class="btn ghost" onclick="removeProduct('${p.id}')">Delete</button>` : `<button class="btn ghost" onclick="closeModal()">Cancel</button>`}
      <button class="btn accent" onclick="saveProductForm('${p.id}')">Save</button>
    </div>`;
  document.getElementById("modalBack").classList.add("show");
  setTimeout(() => m.querySelector("#e-name").focus(), 120);
}
function saveProductForm(id) {
  const name = document.getElementById("e-name").value.trim();
  if (!name) { UI.toast("Give it a name first."); return; }
  Store.saveProduct({
    id,
    name,
    price: +document.getElementById("e-price").value || 0,
    blurb: document.getElementById("e-blurb").value.trim(),
    icon: document.getElementById("e-icon").value,
    special: document.getElementById("e-special").checked,
    active: true,
  });
  closeModal();
  UI.toast("Saved.");
}
function removeProduct(id) {
  if (confirm("Delete this loaf from the menu?")) { Store.deleteProduct(id); closeModal(); UI.toast("Removed."); }
}
function closeModal() { document.getElementById("modalBack").classList.remove("show"); }
document.getElementById("modalBack").addEventListener("click", (e) => { if (e.target.id === "modalBack") closeModal(); });

// live re-render whenever the store changes (incl. orders from the shop tab)
window.addEventListener("store:changed", render);
window.addEventListener("storage", () => { Store.load(); render(); });

render();
