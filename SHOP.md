# MERA shop & catalogue

How the product catalogue, shop page, basket and currency switch work, and how to
update them. The site is published to **Cloudflare Pages**, so documentation files
like this one can live in the repo without appearing on the website.

## What was asked for

These are the requirements this system was built to, in the order they were given:

1. Move products into a **file** so the catalogue is easy to update → a JSON file (`products.json`).
2. Ship **10 test products**.
3. Give each product its **own image** (no repeats).
4. Show prices in **HUF and EUR**, with a **currency switch** in the header that works like the language switch.
5. Add a **category** to each product for filtering/searching.
6. **Home page** shows a few **featured** products; the **shop page** lists **everything**.
7. Add a **price filter**: under 10 000 Ft, under 20 000 Ft, all.
8. Show a **small product image** on each basket row.
9. **Remove the basket panel from the home page** — the header link is enough.
10. Play an **animation** when an item is added, so it's obvious it worked.
11. Ask **"are you sure?"** before emptying the basket.
12. Add a **checkout** button that opens an **order form on its own page** (`rendeles.html`) where the customer enters their details, and the order is **emailed to MERA**.
13. Extend each product with a **longer description, dimensions and more details** (features, materials, weight, care, availability).
14. Give every product its **own page** with **SEO** (title, description, canonical link, social preview, structured data, sitemap) and **add to basket** with a quantity.
15. Add **alternate product images**: thumbnails in a **vertical list**, with the selected image in a **large frame to their right**.

## The files

| File | Purpose |
| --- | --- |
| `products.json` | The catalogue — the one file to edit to change products (see below). |
| `products.js` | Reads `products.json` and builds the product cards (each links to its product page). On the shop page it also builds the search box and the category + price filters. |
| `product-format.js` | Shared labels and formatting (categories, dimensions, availability, prices) used by the cards, the product pages and the page builder. |
| `tools/build-products.mjs` | Builds the product pages (`termek/<slug>.html`) and `sitemap.xml` from `products.json`. Runs automatically on every Cloudflare deploy. |
| `termek/*.html` | The generated product pages — **don't edit these by hand**; edit `products.json` and rebuild. |
| `product-page.js` / `product-page.css` | The product page's image gallery, language switching and layout. |
| `currency.js` | The HUF/EUR switch: remembers the choice, sets `<html data-currency>`, and fires a `mera:currencychange` event. |
| `shop-basket.js` | The basket: add/remove/quantities, persistence, prices in the chosen currency, the basket thumbnails, the add-to-basket animation, and the empty-basket confirmation. |
| `checkout.js` | The order page: reads the basket + catalogue, shows the summary, and emails the order to MERA. |
| `shop-section.css` | Styling for the product grid, basket, filter toolbar, animation and checkout. |
| `localization.js` | Hungarian/English/German text (the existing translation system). |
| `index.html` | Home page — shows **featured** products only. |
| `bolt.html` | Shop page — shows **all** products with filters and search. |
| `rendeles.html` | Checkout / order page — the order form that emails MERA. |
| `assets/shop/*.svg` | Placeholder product illustrations (a main image plus a close-up and an in-the-room view per product). |
| `tests/product-pages.cjs` | Browser test for the product pages, gallery and basket (needs Playwright). |

## Updating the shop (edit `products.json`)

`products.json` is a list of products. To **add** a product, copy a block; to
**remove** one, delete its block; to **reprice**, change the numbers. No HTML.

```json
{
  "id": "nameplate",
  "slug": "nevtabla",
  "category": "personalised",
  "featured": true,
  "availability": "made_to_order",
  "leadTime":    { "hu": "Elkészítési idő: 5–7 munkanap", "en": "…", "de": "…" },
  "image": "assets/shop/nameplate.svg",
  "gallery": [
    { "src": "assets/shop/nameplate-detail.svg", "alt": { "hu": "Névtábla – közelről", "en": "…", "de": "…" } }
  ],
  "price": { "huf": 6900, "eur": 17 },
  "name":        { "hu": "Névtábla", "en": "Name plaque", "de": "Namensschild" },
  "description": { "hu": "Személyre szabható névtábla a babaszobába.", "en": "…", "de": "…" },
  "details":     { "hu": "Első bekezdés…\n\nMásodik bekezdés…", "en": "…", "de": "…" },
  "features":    { "hu": ["Legfeljebb 12 betűs névvel", "…"], "en": ["…"], "de": ["…"] },
  "materials":   { "hu": "Nyír rétegelt lemez, vízbázisú festék és lakk", "en": "…", "de": "…" },
  "dimensions":  { "width": 30, "height": 12, "depth": 1.8, "unit": "cm" },
  "weight":      { "value": 320, "unit": "g" },
  "care":        { "hu": "Száraz vagy enyhén nedves ruhával töröld át.", "en": "…", "de": "…" }
}
```

- **`id`** — a unique short name, lowercase, no spaces. The basket uses it, so don't reuse an id or rename one that customers may already have in their basket.
- **`slug`** — the product page address: `nevtabla` → `merahome.hu/termek/nevtabla`. Lowercase letters, digits and dashes only (no accents). **Don't change it once the product is live**, or links and search results to the old address break. If left out, the `id` is used.
- **`category`** — one of: `personalised`, `textile`, `decor`, `lighting`, `keepsake`, `storage`. This drives the category filter on the shop page. (To add a new category, also add its label in `CATEGORY_LABELS` in `product-format.js`.)
- **`featured`** — `true` shows the product on the **home page**; every product shows on the **shop page** regardless.
- **`availability`** — `in_stock`, `made_to_order` or `out_of_stock` (out of stock hides the add-to-basket button). Shown on the product page and given to Google.
- **`leadTime`** — optional, e.g. how long a made-to-order piece takes. Shown next to the availability.
- **`image`** — the main picture, used on the cards, in the basket and first in the product page gallery.
- **`gallery`** — optional extra pictures for the product page, each with a `src` and a short `alt` description (what the picture shows, for screen readers and search engines). Add as many as you like; they appear as thumbnails in order after the main image.
- **`price`** — `huf` and `eur` are set **separately** (EUR is not auto-converted). Digits only.
- **`name` / `description`** — `description` is the short line on the cards and under the product name.
- **`details`** — the longer description on the product page. Separate paragraphs with a blank line (`\n\n` in the file).
- **`features`** — a short bullet list per language.
- **`materials`**, **`care`** — short texts per language.
- **`dimensions`** — numbers only, in the given `unit` (default `cm`). Use any of `width`, `height`, `depth`, `length`, `diameter`; only the ones you list are shown.
- **`weight`** — `value` and `unit` (`g` or `kg`); 1000 g and over is shown in kg.
- All text fields: Hungarian (`hu`) is required; `en` and `de` are optional and fall back to `hu`. Everything after `description` is optional — sections without data are simply left off the product page.

After editing, save and commit; the live site updates after the push, and the product
pages and sitemap are rebuilt automatically. To **preview product pages locally** with
Live Server, first run `node tools/build-products.mjs` in the MERA folder (Codex can run it
for you) — it also checks for mistakes such as a missing image or a duplicate slug, and
stops with a message if it finds one.

## How it behaves

- **Currency switch (HUF/EUR):** in the header next to the language switch. Switching reformats every price and the basket total instantly, and the choice is remembered in the browser. Amounts are shown in the locale's own style (e.g. `6 900 Ft`, and `€17` in English / `17 EUR` in Hungarian).
- **Featured vs all:** the home grid has `data-shop-mode="featured"` (shows `featured: true` products); the shop grid has `data-shop-mode="all"`.
- **Filters & search (shop page):** a category filter, a price filter (All / under 10 000 Ft / under 20 000 Ft — thresholds are in HUF), and a text search over name, description and category. They combine, and all follow the chosen language.
- **Basket:** stored in the browser and shared across pages. Each row shows a thumbnail, name, subtotal and quantity controls. **Empty basket** asks for confirmation (Yes / Cancel) before clearing.
- **Home has no basket panel:** the header **Kosár** link carries the count and opens the shop page's basket. Adding a featured product on the home page still updates the count.
- **Add animation:** the product image flies to the basket link, the count badge pops, and the button flashes. It's skipped for visitors who prefer reduced motion (the count still updates).
- **Checkout (orders by email):** the basket's **Proceed to order** button links to its own page, `rendeles.html`, which shows the order summary and a form (name, email, phone, delivery address, optional message). There is no online payment — submitting sends the order to MERA by email and shows a thank-you. If the basket is empty, the page says so and links back to the shop.

## Product pages

Each product has its own page at `merahome.hu/termek/<slug>`, built from `products.json`:

- **Gallery** — the thumbnails run down the left; clicking one (or using the arrow keys)
  shows it in the large frame to the right. On phones the thumbnails shrink but stay on the left.
- **Buying** — price in the chosen currency, availability, a quantity box and **Add to basket**.
  The basket is the same one as on the other pages; **View basket** opens it on the shop page.
- **Details** — the long description, features, a size and materials table, and care.
- **Similar products** — up to four others, from the same category first.
- **Language** — pages are written in Hungarian (what search engines see); the language
  switch changes all the product text in place.
- **SEO** — each page has its own title (`Névtábla | MERA`), meta description, canonical
  address, social-preview tags and Google *Product* structured data (price, availability,
  dimensions, images) plus breadcrumbs, and is listed in `sitemap.xml`. Social previews use
  the site's share image unless the product's main image is a JPG/PNG/WebP photo (social
  sites can't show SVGs), so real photos will appear in shares automatically.

The pages are generated: `termek/*.html` and `sitemap.xml` are overwritten on every build,
so change `products.json` (content) or `tools/build-products.mjs` (layout) instead. The
header, footer, stylesheets and scripts are copied from `bolt.html` at build time.

## Checkout email setup

The order form is wired for **Web3Forms** (free, https://web3forms.com). In `checkout.js`:

```js
const WEB3FORMS_ACCESS_KEY = 'PASTE-YOUR-WEB3FORMS-ACCESS-KEY';
const ORDER_EMAIL = 'hello@merahome.hu';
```

- **With a key** (create one free at web3forms.com for `hello@merahome.hu` and paste it in): submitting the form emails the order straight to MERA — the customer stays on the page and sees a thank-you.
- **Without a key** (the default): submitting opens the customer's own email app, pre-addressed to `ORDER_EMAIL` with the order details filled in, for them to send. Set the key to make it fully automatic.

## Placeholders to replace before launch

- **Product images** are placeholder SVG illustrations in `assets/shop/` — swap for real photos (update `image` and `gallery` in `products.json`; web-sized JPG/WebP, ~1200 px wide, 4:3 works best in the gallery).
- **Details, dimensions, weights, materials and lead times** are invented sample data — replace with the real figures before launch, as they're shown to customers and to Google.
- **EUR prices** are rough placeholders (≈ HUF ÷ 400) — set real euro prices.
- **Names, descriptions and the catalogue itself** are sample data — replace with the real range.
- The home hero video is still the **watermarked** placeholder (see `REVIEW-FIXES.md`).

## Hosting note

The site is served by **Cloudflare Pages** (see `REVIEW-FIXES.md`). Cloudflare serves
clean URLs, so the shop page is `/bolt` (not `/bolt.html`). The `DEMOS/` folder and
docs like this file stay in the repo but are kept out of the published site. The build
command in the Pages settings is
`node tools/build-products.mjs && rm -rf DEMOS references tests tools *.md`: it rebuilds
the product pages and sitemap, then removes the demos, reference material, tests, build
tools and `.md` docs from what gets published.
