// ─────────────────────────────────────────────────────────────────────────
//  The storefront. Two objects: the shelf (now) and the oven (coming).
// ─────────────────────────────────────────────────────────────────────────

const app = document.getElementById("app");

function render() {
  const s = Store.state;
  const open = s.storeOpen;
  app.innerHTML = `
    ${hero(s)}
    ${open ? shelfSection() : ""}
    ${open ? ovenSection() : ""}
    ${specialSection()}
    ${aboutSection()}
  `;
}

// ── hero ───────────────────────────────────────────────────────────────────
function hero(s) {
  return `
  <section class="hero">
    <div class="hero-art">${ART.baker()}</div>
    ${UI.seal(148)}
    <h1>Made by hand,<span class="script-name">in small numbers.</span></h1>
    <p>${CONFIG.tagline}</p>
    ${!s.storeOpen ? `<div class="closed-banner">The oven's resting this week — check back soon for the next bake.</div>` : ""}
  </section>`;
}

// ── THE SHELF (present bread) ──────────────────────────────────────────────
function shelfSection() {
  const items = Store.activeProducts();
  const anyOnShelf = items.some((p) => Store.shelfCount(p.id) > 0);
  return `
  <section class="section" id="shelf">
    <div class="section-head">
      <h2>Fresh Today</h2>
      <span class="sub">on the shelf right now — grab &amp; go</span>
    </div>
    ${wheatRule()}
    ${anyOnShelf
      ? `<div class="shelf-grid">${items.map(shelfTile).join("")}</div>`
      : `<p class="muted" style="text-align:center;padding:14px 0 24px">The shelf is empty just now — everything's spoken for. Reserve from the oven below to catch the next bake.</p>`}
  </section>`;
}

function shelfTile(p) {
  const n = Store.shelfCount(p.id);
  const sold = n <= 0;
  if (sold && !p.special) {
    return `
    <div class="loaf-tile sold">
      <div class="art">${artFor(p.icon)}</div>
      <h3>${p.name}</h3>
      <div class="price">${UI.money(p.price)}</div>
      <div class="blurb">${p.blurb}</div>
      <div class="count">sold out for now</div>
      <button class="btn ghost" disabled>On the shelf soon</button>
    </div>`;
  }
  if (sold) return ""; // a special with none on the shelf belongs to the oven, not here
  return `
    <div class="loaf-tile ${p.special ? "special" : ""}">
      ${p.special ? `<div class="ribbon">Special</div>` : ""}
      <div class="art">${artFor(p.icon)}</div>
      <h3>${p.name}</h3>
      <div class="price">${UI.money(p.price)}</div>
      <div class="blurb">${p.blurb}</div>
      <div class="count"><b>${n}</b> left on the shelf</div>
      <button class="btn accent" onclick="grab('${p.id}')">Grab one</button>
    </div>`;
}

// ── THE OVEN (promised bread) ──────────────────────────────────────────────
function ovenSection() {
  const days = Store.visibleBakeDays();
  return `
  <section class="section" id="oven">
    <div class="section-head">
      <h2>Reserve Ahead</h2>
      <span class="sub">the oven for this week — claim a slot before it fills</span>
    </div>
    ${wheatRule()}
    ${days.length
      ? `<div class="oven"><div class="oven-days">${days.map(rack).join("")}</div></div>`
      : `<p class="muted" style="text-align:center;padding:14px 0 24px">No open bakes just now. The next one will appear here a few days ahead.</p>`}
  </section>`;
}

function rack(bd) {
  const closed = bd.phase === "closed";
  const full = bd.left <= 0;
  const slots = Array.from({ length: bd.capacity }, (_, i) => {
    const filled = i < bd.filled;
    return `<div class="slot ${filled ? "filled" : ""}">${filled ? artFor("boule") : ""}</div>`;
  }).join("");

  let action;
  if (closed) action = `<span class="closed-tag">orders closed</span>`;
  else if (full) action = `<span class="muted">oven's full</span>`;
  else action = `<button class="btn accent sm" onclick="reserveOn('${bd.id}')">Reserve</button>`;

  return `
  <div class="rack ${full ? "full" : ""}" data-day="${bd.id}">
    <div class="when">
      <div class="day">${Store.weekdayName(new Date(bd.date + "T00:00:00").getDay())}</div>
      <div class="meta">${Store.fmtDay(bd.date)} · order by the night before</div>
    </div>
    <div class="slots">${slots}</div>
    <div class="left-note">
      <b>${bd.left}</b>${bd.left === 1 ? "loaf" : "loaves"} left
      <div style="margin-top:8px">${action}</div>
    </div>
  </div>`;
}

// ── the monthly special spotlight ──────────────────────────────────────────
function specialSection() {
  const sp = Store.activeProducts().find((p) => p.special);
  if (!sp) return "";
  return `
  <section class="section" id="special">
    <div class="section-head">
      <h2>${sp.specialMonth || "This Month's"} Favorite</h2>
      <span class="sub">a limited bake, here and gone</span>
    </div>
    ${wheatRule()}
    <div class="loaf-tile special" style="max-width:340px;margin:0 auto">
      <div class="ribbon">Special</div>
      <div class="art">${artFor(sp.icon)}</div>
      <h3>${sp.name}</h3>
      <div class="price">${UI.money(sp.price)}</div>
      <div class="blurb">${sp.blurb}</div>
      <div class="count">reserve it from the oven above while slots last</div>
    </div>
  </section>`;
}

// ── about ──────────────────────────────────────────────────────────────────
function aboutSection() {
  return `
  <section class="section" id="about">
    <div class="section-head"><h2 class="script" style="font-size:2.4rem">About Betsy</h2></div>
    ${wheatRule()}
    <div class="about">
      <div class="portrait" style="width:150px">${ART.baker()}</div>
      <div>
        <p>Betsy bakes the way sourdough wants to be made — slowly, by hand, and never more
        than the day can hold. Each loaf starts with a starter she's kept alive for years,
        a long overnight rise, and a hot morning bake.</p>
        <p>Because it's just her, the numbers are small on purpose. When the oven's full,
        it's full — and that's part of the fun. Catch a loaf while it's warm.</p>
      </div>
    </div>
  </section>`;
}

function wheatRule() {
  return `<div class="wheat-rule"><span class="line"></span>${ART.wheat()}${ART.wheat()}${ART.wheat()}<span class="line"></span></div>`;
}

// ── claim flows (shelf grab + oven reserve), both ending in a stamp ────────
let pending = null;

function grab(productId) {
  const p = Store.productById(productId);
  pending = { kind: "shelf", productId };
  openModal({
    title: `Grab a ${p.name}`,
    sub: `${UI.money(p.price)} · pay Betsy by Venmo or Zelle at pickup`,
    confirm: "Grab it",
  });
}

function reserveOn(bakeDayId) {
  const day = Store.state.bakeDays.find((b) => b.id === bakeDayId);
  const products = Store.activeProducts();
  pending = { kind: "reserve", bakeDayId };
  openModal({
    title: `Reserve for ${Store.weekdayName(new Date(day.date + "T00:00:00").getDay())}`,
    sub: `Betsy bakes this fresh for ${Store.fmtDay(day.date)}.`,
    pickProduct: products,
    confirm: "Reserve my loaf",
  });
}

function openModal({ title, sub, pickProduct, confirm }) {
  const back = document.getElementById("modalBack");
  const m = document.getElementById("modal");
  m.innerHTML = `
    <h3>${title}</h3>
    <div class="muted" style="font-size:.85rem">${sub}</div>
    ${pickProduct ? `
      <label>Which loaf?</label>
      <select id="f-product">
        ${pickProduct.map((p) => `<option value="${p.id}">${p.name} — ${UI.money(p.price)}${p.special ? " ✦ special" : ""}</option>`).join("")}
      </select>` : ""}
    <label>Your name</label>
    <input id="f-name" placeholder="First name" autocomplete="given-name" />
    <label>Phone (so Betsy can text you when it's ready)</label>
    <input id="f-phone" placeholder="(555) 123-4567" inputmode="tel" autocomplete="tel" />
    <div id="f-warn"></div>
    <div class="stamp" id="stamp"><div class="mark">Reserved</div></div>
    <div class="row">
      <button class="btn ghost" onclick="closeModal()">Never mind</button>
      <button class="btn accent" id="f-go" onclick="confirmClaim('${confirm}')">${confirm}</button>
    </div>`;
  back.classList.add("show");
  // gentle flake warning as they type a known number
  m.querySelector("#f-phone").addEventListener("input", (e) => {
    const c = Store.customerFor(e.target.value);
    m.querySelector("#f-warn").innerHTML = c && c.flaked
      ? `<div class="warn">Heads up — there's an unpaid loaf on this number. Betsy may reach out before baking.</div>` : "";
  });
  setTimeout(() => m.querySelector("#f-name")?.focus(), 150);
}

function closeModal() {
  document.getElementById("modalBack").classList.remove("show");
  pending = null;
}

function confirmClaim(verb) {
  const name = document.getElementById("f-name").value.trim();
  const phone = document.getElementById("f-phone").value.trim();
  if (!name || phone.replace(/\D/g, "").length < 7) {
    UI.toast("A name and phone number, please — that's how Betsy reaches you.");
    return;
  }
  const customer = { name, phone };
  let order, stampWord;

  if (pending.kind === "shelf") {
    order = Store.grabFromShelf(pending.productId, customer);
    stampWord = "Sold";
    if (!order) { UI.toast("Ah — that one just went. Try the oven below."); return; }
  } else {
    const productId = document.getElementById("f-product").value;
    order = Store.reserve(pending.bakeDayId, productId, customer);
    stampWord = "Reserved";
    if (!order) { UI.toast("That slot just filled. Pick another bake day."); return; }
  }

  // thunk the stamp, then close + re-render
  const stamp = document.getElementById("stamp");
  stamp.querySelector(".mark").textContent = stampWord;
  document.getElementById("f-go").disabled = true;
  stamp.classList.add("go");
  setTimeout(() => {
    closeModal();
    UI.toast(stampWord === "Sold"
      ? "Yours! Pop by the porch — pay Betsy by Venmo or Zelle."
      : "Reserved! Betsy will text you when it's out of the oven.");
  }, 850);
}

// close on backdrop click
document.getElementById("modalBack").addEventListener("click", (e) => {
  if (e.target.id === "modalBack") closeModal();
});

// live sync: if Betsy changes something in her kitchen tab, the shop updates
window.addEventListener("store:changed", render);
window.addEventListener("storage", () => { Store.load(); render(); });

render();
