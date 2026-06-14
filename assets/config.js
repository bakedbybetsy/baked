// ─────────────────────────────────────────────────────────────────────────
//  Baked by Betsy — configuration
//  Everything here is meant to be edited by a human, not a programmer.
//  The brand name lives in ONE place so a rename re-letters the whole site.
// ─────────────────────────────────────────────────────────────────────────

window.CONFIG = {
  // The word inside the seal. Change this one line to rename the business.
  brandName: "Bread by Betsy",
  brandShort: "BbyB",
  tagline: "Small-batch sourdough, made by hand in limited numbers.",

  // The simple password gate for Betsy's control room.
  // (Prototype only — see README for how real auth slots in later.)
  adminPassword: "betsy",

  // How the week breathes. Betsy's "autopilot": these days auto-open with this
  // many loaves unless she overrides them. 0 = Sunday … 6 = Saturday.
  defaultBakeDays: [
    { weekday: 3, label: "Wednesday", capacity: 6 }, // Wed bake
    { weekday: 6, label: "Saturday", capacity: 6 },  // Sat bake
  ],

  // The promising window for each bake day.
  //   openLeadDays — how far ahead a bake appears so people can find & reserve.
  //   cutoffDays   — promising closes this many days BEFORE the bake, so Betsy
  //                  has time to feed the starter and let it rest in the fridge.
  //                  (Want bread sooner than this? Grab from the shelf instead.)
  openLeadDays: 12,
  cutoffDays: 2,
  cutoffHour: 18, // closes at 6pm on the cutoff day

  // The five-or-six regulars + one monthly special.
  // `icon` picks a line drawing from art.js. `shelf` seeds today's shelf count.
  products: [
    { id: "classic",   name: "Classic Sourdough",      price: 9,  icon: "boule",     blurb: "The everyday loaf. Crackling crust, open crumb, faint tang.", shelf: 2, active: true },
    { id: "multigrain", name: "Seeded Multigrain",     price: 11, icon: "seeded",    blurb: "Sunflower, flax, and sesame folded through a hearty crumb.",  shelf: 1, active: true },
    { id: "country",   name: "Country Batard",         price: 10, icon: "batard",    blurb: "A long, lazy oval with a deep ear and a chewy bite.",         shelf: 0, active: true },
    { id: "rosemary",  name: "Rosemary & Sea Salt",    price: 11, icon: "boule",     blurb: "Garden rosemary and flaky salt baked right into the crust.",  shelf: 1, active: true },
    { id: "cinnamon",  name: "Cinnamon Raisin",        price: 11, icon: "swirl",     blurb: "Plump raisins and cinnamon in a soft, sweet morning loaf.",   shelf: 0, active: true },
    // The monthly special — the one thing allowed to be seen further ahead.
    { id: "special",   name: "Roasted Garlic & Herb",  price: 13, icon: "boule",     blurb: "June's special: slow-roasted garlic, thyme, and a whisper of olive oil.", shelf: 0, active: true, special: true, specialMonth: "June" },
  ],
};
