// ─────────────────────────────────────────────────────────────────────────
//  Small shared UI bits used by both the storefront and the admin.
// ─────────────────────────────────────────────────────────────────────────

window.UI = {
  // Build the seal markup from whatever name is in the store. One source,
  // so renaming the business re-letters every seal on the site.
  seal(size = 150) {
    const name = (Store.state.brandName || CONFIG.brandName);
    // Split "Baked by Betsy" → top line "BAKED", script line "by Betsy".
    const parts = name.split(/\s+by\s+/i);
    const top = (parts[0] || name).toUpperCase();
    const bot = parts[1] ? "by " + parts[1] : "";
    return `
      <div class="seal" style="--seal:${size}px">
        <div class="seal-wheat l">${ART.wheat()}</div>
        <div class="seal-wheat r">${ART.wheat()}</div>
        <div class="seal-inner">
          <div class="seal-top">${top}</div>
          <div class="seal-loaf">${ART.sealLoaf()}</div>
          ${bot ? `<div class="seal-bot">${bot}</div>` : ""}
        </div>
      </div>`;
  },

  // A short-lived note at the bottom of the screen.
  toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      Object.assign(t.style, {
        position: "fixed", left: "50%", bottom: "26px", transform: "translateX(-50%)",
        background: "#4a3826", color: "#f4ecd8", padding: "11px 20px", borderRadius: "999px",
        fontSize: "0.86rem", zIndex: 99, boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        opacity: 0, transition: "opacity .2s ease", fontFamily: "Inter, sans-serif",
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => (t.style.opacity = 1));
    clearTimeout(t._h);
    t._h = setTimeout(() => (t.style.opacity = 0), 2600);
  },

  money: (n) => "$" + Number(n).toFixed(Number(n) % 1 ? 2 : 0),
};
