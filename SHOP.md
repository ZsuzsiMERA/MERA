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

## The files

| File | Purpose |
| --- | --- |
| `products.json` | The catalogue — the one file to edit to change products (see below). |
| `products.js` | Reads `products.json` and builds the product cards. On the shop page it also builds the search box and the category + price filters. |
| `currency.js` | The HUF/EUR switch: remembers the choice, sets `<html data-currency>`, and fires a `mera:currencychange` event. |
| `shop-basket.js` | The basket: add/remove/quantities, persistence, prices in the chosen currency, the basket thumbnails, and the add-to-basket animation. |
| `shop-section.css` | Styling for the product grid, basket, filter toolbar and animation. |
| `localization.js` | Hungarian/English/German text (the existing translation system). |
| `index.html` | Home page — shows **featured** products only. |
| `bolt.html` | Shop page — shows **all** products with filters and search. |
| `assets/shop/*.svg` | Placeholder product illustrations (one per product). |

## Updating the shop (edit `products.json`)

`products.json` is a list of products. To **add** a product, copy a block; to
**remove** one, delete its block; to **reprice**, change the numbers. No HTML.

```json
{
  "id": "nameplate",
  "category": "personalised",
  "featured": true,
  "image": "assets/shop/nameplate.svg",
  "price": { "huf": 6900, "eur": 17 },
  "name":        { "hu": "Névtábla", "en": "Name plaque", "de": "Namensschild" },
  "description": { "hu": "…", "en": "…", "de": "…" }
}
```

- **`id`** — a unique short name, lowercase, no spaces. The basket uses it, so don't reuse an id or rename one that customers may already have in their basket.
- **`category`** — one of: `personalised`, `textile`, `decor`, `lighting`, `keepsake`, `storage`. This drives the category filter on the shop page. (To add a new category, also add its label in `CATEGORY_LABELS` near the top of `products.js`.)
- **`featured`** — `true` shows the product on the **home page**; every product shows on the **shop page** regardless.
- **`image`** — path to the picture, e.g. `assets/shop/vase.svg` or `assets/my-photo.jpg`.
- **`price`** — `huf` and `eur` are set **separately** (EUR is not auto-converted). Digits only.
- **`name` / `description`** — Hungarian (`hu`) is required; `en` and `de` are optional and fall back to `hu`.

After editing, save and commit; the live site updates after the push.

## How it behaves

- **Currency switch (HUF/EUR):** in the header next to the language switch. Switching reformats every price and the basket total instantly, and the choice is remembered in the browser. Amounts are shown in the locale's own style (e.g. `6 900 Ft`, and `€17` in English / `17 EUR` in Hungarian).
- **Featured vs all:** the home grid has `data-shop-mode="featured"` (shows `featured: true` products); the shop grid has `data-shop-mode="all"`.
- **Filters & search (shop page):** a category filter, a price filter (All / under 10 000 Ft / under 20 000 Ft — thresholds are in HUF), and a text search over name, description and category. They combine, and all follow the chosen language.
- **Basket:** stored in the browser and shared across pages. Each row shows a thumbnail, name, subtotal and quantity controls. It is a **preview only** — there is no checkout; orders are arranged by email.
- **Home has no basket panel:** the header **Kosár** link carries the count and opens the shop page's basket. Adding a featured product on the home page still updates the count.
- **Add animation:** the product image flies to the basket link, the count badge pops, and the button flashes. It's skipped for visitors who prefer reduced motion (the count still updates).

## Placeholders to replace before launch

- **Product images** are placeholder SVG illustrations in `assets/shop/` — swap for real photos (keep the same file paths, or update `image` in `products.json`).
- **EUR prices** are rough placeholders (≈ HUF ÷ 400) — set real euro prices.
- **Names, descriptions and the catalogue itself** are sample data — replace with the real range.
- The home hero video is still the **watermarked** placeholder (see `REVIEW-FIXES.md`).

## Hosting note

The site is served by **Cloudflare Pages** (see `REVIEW-FIXES.md`). Cloudflare serves
clean URLs, so the shop page is `/bolt` (not `/bolt.html`). The `DEMOS/` folder and
docs like this file stay in the repo but are kept out of the published site by the
build command `rm -rf DEMOS` in the Pages settings.
