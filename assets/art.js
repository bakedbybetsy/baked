// ─────────────────────────────────────────────────────────────────────────
//  Line art — single-ink, continuous-line bread in the spirit of the logo.
//  Every drawing is an SVG string so it scales crisp on any phone and loads
//  in a few bytes. `currentColor` lets CSS decide the ink (and fade sold-outs).
// ─────────────────────────────────────────────────────────────────────────

const _svg = (inner, vb = "0 0 100 100") =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

window.ART = {
  // A round boule with a wheat-ear score across the top.
  boule: () => _svg(`
    <ellipse cx="50" cy="58" rx="34" ry="26"/>
    <path d="M50 38 L50 74"/>
    <path d="M50 46 L42 41 M50 46 L58 41 M50 56 L41 50 M50 56 L59 50 M50 66 L42 60 M50 66 L58 60"/>
  `),

  // A long batard with a single curved ear.
  batard: () => _svg(`
    <path d="M14 64 Q14 48 34 46 Q50 45 66 46 Q86 48 86 64 Q86 76 66 78 Q50 79 34 78 Q14 76 14 64 Z"/>
    <path d="M30 56 Q50 50 70 56"/>
  `),

  // A cross-hatched seeded loaf.
  seeded: () => _svg(`
    <ellipse cx="50" cy="58" rx="34" ry="26"/>
    <path d="M34 48 L66 70 M50 44 L62 74 M66 50 L40 72"/>
    <circle cx="40" cy="54" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="58" cy="52" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="52" cy="66" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="44" cy="68" r="1.4" fill="currentColor" stroke="none"/>
  `),

  // A swirl loaf (cinnamon).
  swirl: () => _svg(`
    <ellipse cx="50" cy="58" rx="34" ry="26"/>
    <path d="M50 58 m0 0 a6 6 0 1 1 8 4 a12 12 0 1 1 -16 -8 a18 18 0 1 1 26 14"/>
  `),

  // A baguette pair.
  baguette: () => _svg(`
    <path d="M22 76 L74 30" /><path d="M30 82 L82 36"/>
    <path d="M40 56 l4 -4 M50 48 l4 -4 M60 40 l4 -4"/>
  `),

  // A wheat sprig — used as dividers and flourishes.
  wheat: () => _svg(`
    <path d="M50 88 L50 30"/>
    <path d="M50 44 Q40 40 38 30 Q48 32 50 42 Q52 32 62 30 Q60 40 50 44 Z"/>
    <path d="M50 56 Q40 52 38 42 Q48 44 50 54 Q52 44 62 42 Q60 52 50 56 Z"/>
    <path d="M50 68 Q40 64 38 54 Q48 56 50 66 Q52 56 62 54 Q60 64 50 68 Z"/>
  `),

  // The continuous-line loaf at the heart of the seal.
  sealLoaf: () => _svg(`
    <path d="M28 60 Q26 46 42 46 Q50 38 58 46 Q74 46 72 60"/>
    <path d="M22 62 Q50 74 78 62 Q78 70 68 72 Q50 76 32 72 Q22 70 22 62 Z"/>
    <path d="M42 48 Q50 42 58 48"/>
  `, "0 0 100 90"),

  // A hand dusting flour (hero) — loose and gestural.
  baker: () => _svg(`
    <path d="M20 70 Q30 50 50 50 Q70 50 80 70"/>
    <path d="M40 50 Q44 36 50 36 Q56 36 60 50"/>
    <circle cx="50" cy="28" r="8"/>
    <path d="M34 58 l2 4 M46 60 l1 4 M58 58 l-1 4 M52 56 l0 4"/>
  `),

  // A small oven glyph for the admin.
  oven: () => _svg(`
    <rect x="20" y="22" width="60" height="60" rx="6"/>
    <rect x="28" y="40" width="44" height="34" rx="3"/>
    <path d="M28 30 h44"/><circle cx="64" cy="26" r="2" fill="currentColor" stroke="none"/>
    <path d="M36 52 h28 M36 62 h28"/>
  `),
};

// Convenience: get a product's art, falling back to a boule.
window.artFor = (iconName) => (window.ART[iconName] || window.ART.boule)();
