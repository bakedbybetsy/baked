# Handoff — read me first

This note is for whoever (human or Claude) picks up **Bread by Betsy** next.
The `README.md` covers *what* the code is and *how* to run it. This file is the
*why* — the decisions behind it, so they don't get re-litigated.

## What this is

A storefront for a one-person sourdough business, built around one idea:

> **It's not a store. It's a capacity system wearing a storefront.**

Every choice protects one baker's time while giving customers the quiet thrill
of catching a fresh loaf before it's gone (Last Crumb / Rolex scarcity, but warm).

## The model (settled — don't redesign without reason)

Two kinds of bread, different physics:
- **The Shelf** = bread that exists *now*. Walk-up, grab-and-go. Empty shelf =
  nothing on it. Fed by surplus, no-shows, and a loaf or two she keeps on hand.
- **The Oven** = *capacity* for a future bake. Reserve ahead; the oven visibly
  fills as people claim slots. **Betsy bakes only what's promised** — an
  unclaimed slot costs her nothing. A no-show loaf falls from oven → shelf,
  exactly like real bread.

Four nouns: products · bake days (oven racks) · orders · customers.
Three of Betsy's verbs: set the oven, tend the shelf, see who's coming.

## Decisions already made

- **Two bake days a week** (Wed + Sat), each with its own capacity, on autopilot
  (auto-open with a default) but overridable. Vacation = one master switch off.
- **Order cutoff = 2 days before a bake** (`cutoffDays` in config), because Betsy
  needs ~2 days to feed the starter and rest it in the fridge. Want bread sooner?
  Grab from the shelf. This lead time is *why* the oven/shelf split exists.
- **Payment is trust-based** (Venmo/Zelle) — the site never handles money. An
  order is a *reservation*; Betsy marks it paid herself. A flaked customer gets a
  gentle **warn, not block** flag.
- **Aesthetic: single-ink line art on parchment**, cream + brown, one terracotta
  accent reserved for "act now." A vintage seal stamps each claim. Keep it
  *evocative, not skeuomorphic* — no cartoon-kitchen drawings. SVG = fast + crisp.
- **Brand name lives in one config line** (`brandName`) so a rename re-letters the
  seal everywhere. (It already went Baked → Bread once.)
- **Admin is the real build**; the storefront is "a pretty counter." The admin is
  phone-first — the dream is running it in 30 seconds while the kettle boils.

## Deliberately simple for now (the seams, wired to swap)

- **Data lives in the browser** (localStorage) behind `window.Store`. Real backend
  (Cloudflare D1 + a Worker) re-implements those functions, untouched UI.
- **Admin password is client-side** — prototype only. Real auth slots in at the
  same gate (a Worker checking a hashed secret, or Cloudflare Access).
- **Notifications are on-screen only.** Plan: email Betsy per order (cheap), and
  install the admin as a **PWA** for free web-push — sidesteps paid SMS.

## Known "not yet" (not bugs)

- The monthly special shares the same booking window as regulars; the
  "book next month's special in advance" idea isn't built yet.
- One reservation = one loaf (no quantity field yet).

## Suggested next steps (in order)

1. **Deploy to Cloudflare Pages** so Betsy can hold it on her phone (see README).
   No domain needed to start; attach the custom domain after.
2. **Visual tweaks** Betsy wants (gather the list).
3. **Persistence** — the first real seam: move `Store` from localStorage to
   Cloudflare D1 + a Worker so orders survive across devices and refreshes.
4. Then: real auth, email-on-order, PWA + push.
