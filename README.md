# Bread by Betsy

A small, warm storefront for a one-person sourdough business — built around a
single idea:

> **This isn't a store. It's a capacity system wearing a storefront.**

Every choice here exists to protect one tired-happy baker's time while giving
her customers the quiet thrill of catching a fresh loaf before it's gone.

---

## The model, in one breath

There are **two kinds of bread**, and they obey different physics:

- **The Shelf — bread that exists *right now.*** Walk-up, grab-and-go. When the
  shelf is empty, there's simply nothing on it. (Surplus bakes, the loaf or two
  Betsy keeps on hand, and no-show loaves all land here.)
- **The Oven — *capacity* for a future bake.** Reserve a slot ahead of time.
  Betsy bakes **only what gets promised**, so an unclaimed slot costs her
  nothing. The oven visibly *fills up* as people reserve — that filling is the
  scarcity, made gentle.

A loaf flows from oven to shelf exactly like real bread: a reserved loaf gets
baked, and if no one picks it up, it comes out of the oven and onto the shelf.

**Four nouns, nothing more:** products · bake days (oven racks) · orders ·
customers. **Three of Betsy's verbs:** set the oven, tend the shelf, see who's
coming.

---

## What's here

| File | What it is |
|---|---|
| `index.html` | The storefront — the shelf, the filling oven, the monthly special, about. |
| `admin.html` | Betsy's kitchen — a phone-first control room (password gated). |
| `assets/config.js` | **The only file a non-programmer edits.** Brand name, password, default bake days, the menu. |
| `assets/store.js` | The data layer — the four nouns and every operation over them. |
| `assets/art.js` | Single-ink, line-drawn bread (SVG). |
| `assets/styles.css` / `assets/admin.css` | The cream-and-brown look. |
| `assets/storefront.js` / `assets/admin.js` | The two faces. |

## See it

It's a plain static site — no build step.

```bash
# any static server works; for example:
python3 -m http.server 8000
# then open http://localhost:8000
```

Open the shop in one tab and **Betsy's kitchen** (`admin.html`, password
`betsy`) in another — reserve a loaf in the shop and watch it appear in her
inbox, or slide a bake day's capacity and watch the oven change. They share live
state.

## Try the loop

1. On the shop, **Reserve** a slot in the oven → a stamp thunks down → the oven
   fills one slot.
2. Flip to **Betsy's kitchen** → the order is in her inbox; the glance shows
   loaves-to-bake.
3. Mark it **paid**, then **picked up** — or **no-show**, and watch the loaf
   reappear on the shelf.
4. Turn **Accepting orders** off → the shop shows a friendly "resting" note.

---

## Things that are deliberately simple for now

These are the **seams** — wired so they can be made real without rework:

- **Data lives in the browser** (localStorage). The whole data layer is behind
  `window.Store`; swapping to a real backend (e.g. Cloudflare D1 + a Worker)
  means re-implementing those functions, not touching the UI.
- **The admin password is client-side** — fine for a prototype, not real
  security. Real auth (a Worker checking a hashed secret, or Cloudflare Access)
  slots in at the same gate.
- **Notifications** are on-screen only. The plan: email Betsy on each order
  (cheap/free), and — because this is built to install as a phone app (PWA) —
  use **web push** for the buzz, sidestepping paid SMS entirely.
- **Payment is trust-based** (Venmo/Zelle), so the site never handles money. An
  order is a *reservation*; Betsy marks it paid herself.

## Renaming the business

The name isn't final. **It lives in one line** — `brandName` in
`assets/config.js`. Change it and the seal re-letters everywhere. The *look*
(continuous-line loaf in a seal, cream + brown, wheat flourishes) doesn't care
what word sits inside the stamp — so the visual Betsy loves survives any rename.

## Deploying (later)

Built to drop straight onto **Cloudflare Pages** as static files. When the real
backend arrives, a Cloudflare Worker + D1 database fits behind the existing
`Store` seams. No domain is needed to start — Pages gives a free
`*.pages.dev` URL.

---

*Built slowly, on purpose — like the bread.*
