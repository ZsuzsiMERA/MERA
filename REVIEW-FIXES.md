# MERA website — review & fixes

A friendly checklist of things to improve on the site, most important first. The site is in good
shape — the code is clean and the structure is right. These are mostly about **images, search/social
previews, and replacing placeholder content**.

Each task says **why it matters**, then **how to do it**. Where it helps, there's a prompt you can
paste straight into **Codex** in VS Code (open the MERA folder first so Codex can edit the files).

**Before you start, every time:**
1. In GitHub Desktop, make sure you're up to date (Fetch/Pull).
2. Work on one task, preview with **Live Server** (right-click `index.html` → *Open with Live Server*).
3. When it looks right: GitHub Desktop → write a short summary → **Commit** → **Push**.
4. After you push, the published site rebuilds automatically a minute or two later (hosting is moving
   to Cloudflare Pages — see **Hosting** at the end).

---

## 1. Shrink the secret-key images (biggest issue) 🔴

**Why:** The hidden "golden keys" game uses 14 images in `assets/keys/` that are about **1.5 MB each —
roughly 20 MB in total**. Several of them load on the homepage even for visitors who never find the
game, so the site is slow to load, especially on phones. These can be ~95% smaller with no visible
loss.

**How (do the images first, then the code):**

**a) Resize and compress the images** — easiest tool is **Squoosh** (free, runs in your browser):
1. Go to https://squoosh.app
2. Drag in one image from `assets/keys/` (e.g. `sofia-sz.png`).
3. On the right: set **Resize** on, longest edge to **800 px**. Set format to **WebP**, quality ~**80**.
4. Download it. Repeat for all 14 PNGs in `assets/keys/`:
   `antique-1..5.png`, `sofia-sz/o/f/i/a.png`, `lock-closed.png`, `lock-open.png`.
5. Keep the **same base names** but they'll now end in `.webp` (e.g. `sofia-sz.webp`). Put them in
   `assets/keys/`, replacing the old `.png` files (delete the `.png` versions).

> Prefer a command line? With ImageMagick installed, from the `assets/keys` folder:
> `magick mogrify -resize 800x800 -quality 80 -format webp *.png` then delete the `*.png`.

**b) Point the code at the new files and make them load only when needed** — paste into Codex:

> In mera-keys.js, change every `assets/keys/....png` reference to the matching `.webp` file, and add
> `loading="lazy"` to the key and lock `<img>` tags so they only download when the keys panel is
> actually opened. Don't change any other behaviour.

---

## 2. Replace the hero video 🔴

**Why:** The big video at the top of the homepage is a **placeholder with a "Hailuo" watermark** on it,
and it's loaded from the `DEMOS` folder. A watermarked clip looks unfinished to visitors. Also — the
`DEMOS` folder will no longer be published (see task 4), so **the hero video must be moved into
`assets/` or it won't show up on the live site at all.**

**How:**
1. Get the final MERA hero video (no watermark). Keep it at about 6 seconds, 720p.
2. It needs a special encoding so scrolling can scrub it smoothly. With **ffmpeg** installed
   (`winget install ffmpeg` in a terminal), run:
   ```
   ffmpeg -i your-video.mp4 -c:v libx264 -crf 26 -g 1 -pix_fmt yuv420p -vf scale=-2:720 -an -movflags +faststart clip.mp4
   ```
3. Put the result at **`assets/video/clip.mp4`** (make the `assets/video` folder).
4. Paste into Codex:
   > In index.html, change the hero video `data-src` from `DEMOS/Videos/videos/clip.mp4` to
   > `assets/video/clip.mp4`.
5. Keep the clip under ~10 MB. If it's bigger, shorten it or lower the quality (raise `-crf 26` to `30`).

---

## 3. Add search & social previews (and a favicon) 🔴

**Why:** Right now the site has **no favicon** (the little icon in the browser tab) and **no social
preview** — so when the link is shared on Instagram, Facebook or Messenger it shows up blank and
plain. These are quick wins that make the brand look finished.

**How:**
1. Make a **share image** (1200 × 630 px) — a nice MERA photo or logo on a warm background — and save
   it as `assets/og-image.jpg`.
2. Paste into Codex:
   > In index.html's `<head>`, add: a `<link rel="canonical">` to https://merahome.hu/ ; Open Graph
   > tags (og:title, og:description, og:image using assets/og-image.jpg, og:url, og:type=website,
   > og:locale hu_HU) ; Twitter card tags (summary_large_image) ; and `hreflang` alternate links for
   > Hungarian, English and German. Add an SVG favicon: create assets/favicon.svg with a simple gold
   > "M" monogram on a warm background and link it with `<link rel="icon" type="image/svg+xml">`.
   > Also do the same head additions on tudnivalok.html with its own canonical and title.

> Note: point the canonical/og:url at `https://merahome.hu/` once that domain is live; until then use
> the Cloudflare `*.pages.dev` address. Cloudflare serves **clean URLs**, so write links without
> `.html` (e.g. `/tudnivalok`, not `/tudnivalok.html`).

---

## 4. Keep DEMOS in the repo, but don't publish it 🟠

**Why:** `DEMOS/` holds useful test versions (the shop and scroll-scrub demos) worth keeping in the
repo — but they shouldn't appear on the real website. With Cloudflare Pages you can keep the folder and
simply leave it out of what gets published.

**How:** This is a one-time setting in the **Hosting** setup below — in the Cloudflare Pages build
settings, set the **build command** to `rm -rf DEMOS`. Cloudflare copies the repo into a temporary
build space, runs that command (which removes DEMOS *only from that temporary copy*), and publishes the
rest. Your repo keeps the folder; the live site doesn't show it.

(If you'd also like to keep these notes and the test folder out of the public site, use
`rm -rf DEMOS tests references REVIEW-FIXES.md` instead.)

**Important:** because DEMOS won't be published, make sure the hero video has been moved to
`assets/video/` first (task 2), or the homepage video will be missing on the live site.

---

## 5. Replace the placeholder content 🟠 (your part, not code)

**Why:** The shop and legal pages currently use sample text. These must be real before selling.

- **Products:** the shop shows a sample *nameplate*, *linen cushion* and *ceramic vase* at made-up
  prices. Replace with your real products, descriptions, prices and photos. (Ask Codex: *"replace the
  three sample products in index.html with these real ones: …"* and give it the details.)
- **Legal pages (`tudnivalok.html`):** the headings are right (ÁSZF, Adatvédelem, GYIK, Szállítás,
  Fizetés, Anyagok, Biztonság) but the text needs to be real and correct for a Hungarian online shop.
  Hungarian/EU rules require proper **ÁSZF** (terms) and **Adatvédelmi tájékoztató** (privacy policy),
  including the 14-day right of withdrawal. **Have these checked by someone who knows HU e-commerce
  law** before you start selling — don't rely on placeholder or AI-written legal text.
- **Product photos:** use web-sized images (about 1200 px, saved as WebP/JPEG a few hundred KB each),
  not camera originals.

---

## 6. Small finishing touches 🟢

Paste into Codex:
> Add a `robots.txt` (allow all, link a sitemap), a `sitemap.xml` listing index.html and
> tudnivalok.html with their clean URLs, and a simple branded `404.html` that matches the site style
> and links back to the homepage.

---

## Hosting: move to Cloudflare Pages (free) and turn off GitHub Pages

The site will be hosted on **Cloudflare Pages** instead of GitHub Pages. It's free, deploys
automatically whenever you push, lets you keep DEMOS in the repo without publishing it (task 4), and
has no bandwidth limit. Dominic can do this part with you if you'd rather.

**Set it up (once):**
1. Sign in at https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and authorise the MERA repository.
2. Build settings:
   - **Framework preset:** None
   - **Build command:** `rm -rf DEMOS`  *(this is what keeps DEMOS out of the live site — task 4)*
   - **Build output directory:** `/`
3. **Save and Deploy.** You'll get a temporary `*.pages.dev` address — open it and check the site.
4. From now on, every push to `main` rebuilds and republishes automatically.

**Attach the domain** (once `merahome.hu` is registered and its DNS is on Cloudflare):
5. In the Pages project → **Custom domains** → add `merahome.hu` (and `www`). Cloudflare sets the DNS
   and the HTTPS certificate itself — there's no `CNAME` file to add.
6. Then update the `canonical`/`og:url` links from task 3 to `https://merahome.hu/`.

**Turn off GitHub Pages** (so the old address doesn't linger):
7. On GitHub: repo **Settings → Pages** → set **Source** to **None**.

**Clean URLs:** Cloudflare serves pages without the `.html` ending (`/tudnivalok`, not
`/tudnivalok.html`), and redirects the old form automatically. Write any new links, the sitemap, and
the canonical/og tags without `.html`.

---

*Questions on any of these? Ask Dominic.*
