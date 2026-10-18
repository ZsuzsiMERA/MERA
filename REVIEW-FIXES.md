# MERA website — status & what's left for you

The site has had a round of improvements. This file lists **what's already done** and
**what still needs you (Mera)** — mostly real content and a couple of one-time settings.

**Working with the site:** open the MERA folder in VS Code, edit, preview with Live
Server, then in GitHub Desktop **Commit → Push**. Once hosting is on Cloudflare Pages,
each push republishes automatically. For anything code-related you can paste the Codex
prompts below, or ask Dominic.

---

## Already done (built and committed)

- **Images optimised** — the hidden "golden keys" images went from ~20 MB to under 1 MB (WebP + lazy loading).
- **Search & social** — favicon, Open Graph / Twitter preview, canonical links and a 1200×630 share image, on every page.
- **Site files** — `robots.txt`, `sitemap.xml` and a branded `404` page.
- **Hero video** — wired as a scroll-scrubbed hero that also works in Safari/iOS (loads from `assets/video/`). *(The clip itself is still the watermarked placeholder — see below.)*
- **The shop** — a JSON-driven catalogue (10 test products), a **HUF/EUR currency switch**, a **featured** selection on the home page and a full **shop page** (`bolt.html`) with category + price filters and search, a basket with thumbnails, an add-to-basket animation, an "are you sure?" on emptying it, and a **checkout page** (`rendeles.html`) that emails the order to MERA. Full details in **`SHOP.md`**.

---

## What's left for you 🔴

### 1. Replace the hero video (remove the watermark)
The homepage video still has the "Hailuo" watermark. Get the final clip (≈6 s, 720p), then
re-encode it so scrolling scrubs smoothly and put it at `assets/video/clip.mp4`:
```
ffmpeg -i your-video.mp4 -c:v libx264 -crf 26 -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -vf scale=-2:720 -an -movflags +faststart clip.mp4
```
Keep it under ~10 MB. (Install ffmpeg on Windows with `winget install ffmpeg`.)

### 2. Real products (edit `products.json`)
Replace the sample catalogue with the real one — see **`SHOP.md`** for the format. For each product:
- real **name** and **description** (Hungarian required; English/German optional),
- real **prices** in **both HUF and EUR** (EUR is set by you, not auto-converted),
- a real **photo** — replace the placeholder illustrations in `assets/shop/` (web-sized, ~1200 px, a few hundred KB each), or point `image` at your own file.

### 3. Turn on automatic order emails (`checkout.js`)
Right now, submitting an order opens the customer's own email app addressed to
`hello@merahome.hu`. To have orders arrive automatically instead:
1. Get a free access key at https://web3forms.com for `hello@merahome.hu`.
2. Paste it into `checkout.js` in place of `PASTE-YOUR-WEB3FORMS-ACCESS-KEY`.

### 4. Real legal text (`tudnivalok.html`)
The headings are in place (ÁSZF, Adatvédelem, GYIK, Szállítás, Fizetés, Anyagok, Biztonság)
but the text is placeholder. Hungarian/EU online shops need proper **ÁSZF** (terms) and
**Adatvédelmi tájékoztató** (privacy policy), including the 14-day right of withdrawal.
**Have these checked by someone who knows HU e-commerce law** before selling — don't rely
on placeholder or AI-written legal text.

---

## Hosting: move to Cloudflare Pages (free) and turn off GitHub Pages

Cloudflare Pages is free, deploys on every push, has no bandwidth limit, lets you keep the
`DEMOS` folder and docs in the repo without publishing them, and serves clean URLs
(`/bolt`, not `/bolt.html`). Dominic can do this with you.

1. Sign in at https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, and authorise the MERA repository.
2. Build settings: **Framework preset** None, **Build command** `rm -rf DEMOS`, **Build output directory** `/`.
3. **Save and Deploy** → you get a `*.pages.dev` address to check.
4. Add the domain: Pages project → **Custom domains** → `merahome.hu` (and `www`) once the domain's DNS is on Cloudflare. Then update the `canonical`/`og:url` links to `https://merahome.hu/`.
5. On GitHub: repo **Settings → Pages → Source: None** to switch off the old site.

---

*Questions on any of these? Ask Dominic.*
