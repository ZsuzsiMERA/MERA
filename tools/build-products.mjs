// Builds one static page per product (termek/<slug>.html) and sitemap.xml from
// products.json. Cloudflare Pages runs this on every deploy, so the live pages
// always match the catalogue; run it locally (`node tools/build-products.mjs`)
// to preview product pages with Live Server.
//
// Pages are static Hungarian HTML so search engines see the full product text,
// price and structured data. product-page.js switches the text when the visitor
// changes language, and shop-basket.js handles prices and the basket as on the
// other pages. The header, footer, stylesheets and scripts are copied from
// bolt.html, so changes there carry over here on the next build.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const P = require(path.join(root, 'product-format.js'));

const SITE = 'https://merahome.hu';
const OUT_DIR = path.join(root, 'termek');
const LANG = 'hu';
const STATIC_PAGES = ['', 'bolt', 'tudnivalok'];
const DEFAULT_OG_IMAGE = 'assets/og-image.jpg?v=2';

const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
const shopPage = fs.readFileSync(path.join(root, 'bolt.html'), 'utf8');

// ---- helpers ---------------------------------------------------------------

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tx = (obj) => P.t(obj, LANG);
const abs = (rel) => `${SITE}/${String(rel).replace(/^\/+/, '')}`;
const pageUrl = (p) => `${SITE}/termek/${P.slugOf(p)}`;

function pick(re, label) {
  const match = shopPage.match(re);
  if (!match) throw new Error(`Could not find the ${label} in bolt.html`);
  return match[0];
}

// Product pages live one folder down, so make bolt.html's relative links point
// back up. The basket link opens the shop page's basket.
function rebase(html) {
  return html
    .replace(/(href|src)="#shopBasket"/g, '$1="../bolt.html#shopBasket"')
    .replace(/(href|src)="\.\/"/g, '$1="../"')
    .replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/|\.\.\/|data:)([^"]+)"/g, '$1="../$2"');
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:–-]+$/, '') + '…';
}

function validate(list) {
  const seen = new Set();
  for (const p of list) {
    if (!p.id || !p.price || !p.name) throw new Error(`Product is missing id, price or name: ${JSON.stringify(p).slice(0, 80)}`);
    const slug = P.slugOf(p);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Slug "${slug}" (${p.id}) must be lowercase letters, digits and dashes`);
    if (seen.has(slug)) throw new Error(`Two products share the slug "${slug}"`);
    seen.add(slug);
    for (const img of [p.image, ...(p.gallery || []).map((g) => g.src)]) {
      if (img && !fs.existsSync(path.join(root, img))) throw new Error(`${p.id}: image not found: ${img}`);
    }
  }
}

// ---- page parts --------------------------------------------------------------

const header = rebase(pick(/<header class="home-header">[\s\S]*?<\/header>/, 'header'));
const footer = rebase(pick(/<footer[\s\S]*?<\/footer>/, 'footer'));
const headAssets = rebase(
  [...shopPage.matchAll(/<link rel="stylesheet"[^>]*>|<script [^>]*><\/script>/g)].map((m) => m[0]).join('')
)
  .replace(/<script src="\.\.\/products\.js[^"]*" defer><\/script>/, '')
  + '<link rel="stylesheet" href="../product-page.css"><script src="../product-page.js" defer></script>';
if (!/product-format\.js[\s\S]*shop-basket\.js/.test(headAssets)) throw new Error('bolt.html must load product-format.js before shop-basket.js');

// Link previews (og:image): social apps can't show SVGs, so use the product's
// first photo (JPG/PNG/WebP); else the share image made for it by
// tools/make-share-images.cjs; else the site's general share image.
function shareImage(p) {
  const photo = images(p).find((img) => /\.(jpe?g|png|webp)$/i.test(img.src));
  if (photo) return { src: photo.src, alt: tx(photo.alt) };
  const made = `assets/shop/share/${p.id}.jpg`;
  if (fs.existsSync(path.join(root, made))) return { src: made, alt: tx(p.name), width: 1200, height: 630 };
  return { src: DEFAULT_OG_IMAGE, alt: 'MERA', width: 1200, height: 630 };
}

function images(p) {
  return [{ src: p.image, alt: p.name }, ...(p.gallery || [])].filter((img) => img && img.src);
}

function gallery(p) {
  const list = images(p);
  const thumbs = list.map((img, i) => `<li><button class="product-thumb" type="button" data-gallery-thumb data-index="${i}" aria-controls="productImage" aria-pressed="${i === 0}" aria-label="${esc(tx(img.alt))}"><img src="../${esc(img.src)}" alt="" width="120" height="90" loading="lazy"></button></li>`).join('');
  const first = list[0];
  return `<div class="product-gallery" data-gallery>`
    + (list.length > 1 ? `<ul class="product-thumbs" aria-label="${esc(tx(P.UI.gallery))}" data-pp-ui-aria="gallery">${thumbs}</ul>` : '')
    + `<div class="product-stage"><img id="productImage" src="../${esc(first.src)}" alt="${esc(tx(first.alt))}" width="600" height="450" fetchpriority="high" data-basket-image data-gallery-stage></div>`
    + `</div>`;
}

function specRows(p) {
  const rows = P.dimensionRows(p.dimensions, LANG).map((r) => [r.label, r.value]);
  const weight = P.weightText(p.weight, LANG);
  if (weight) rows.push([tx(P.UI.weight), weight]);
  if (p.materials) rows.push([tx(P.UI.materials), tx(p.materials)]);
  return rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
}

function section(key, body) {
  return `<section class="product-section"><h2 data-pp-ui="${key}">${esc(tx(P.UI[key]))}</h2>${body}</section>`;
}

function related(p) {
  const pool = products.filter((o) => o.id !== p.id);
  const same = pool.filter((o) => o.category === p.category);
  const list = [...same, ...pool.filter((o) => o.category !== p.category)].slice(0, 4);
  if (!list.length) return '';
  const cards = list.map((o) => `<li><a class="product-related-card" href="${esc(P.slugOf(o))}.html"><img src="../${esc(o.image)}" alt="" width="300" height="225" loading="lazy"><span class="product-related-name" data-related-name="${esc(o.id)}">${esc(tx(o.name))}</span><span class="product-related-price" data-related-price="${esc(o.id)}">${esc(P.formatPrice(o.price.huf, 'huf', LANG))}</span></a></li>`).join('');
  return { html: `<section class="product-related" aria-labelledby="relatedTitle"><h2 id="relatedTitle" data-pp-ui="related">${esc(tx(P.UI.related))}</h2><ul>${cards}</ul></section>`, list };
}

function structuredData(p) {
  const quantity = (value, unitCode) => ({ '@type': 'QuantitativeValue', value, unitCode });
  const UNIT = { cm: 'CMT', mm: 'MMT', m: 'MTR', g: 'GRM', kg: 'KGM' };
  const dims = p.dimensions || {};
  const product = {
    '@type': 'Product',
    '@id': `${pageUrl(p)}#product`,
    name: tx(p.name),
    description: [tx(p.description), ...P.paragraphs(tx(p.details))].join(' '),
    image: images(p).map((img) => abs(img.src)),
    sku: p.id,
    url: pageUrl(p),
    brand: { '@type': 'Brand', name: 'MERA' },
    category: tx(P.CATEGORY_LABELS[p.category]) || undefined,
    material: tx(p.materials) || undefined,
    offers: {
      '@type': 'Offer',
      url: pageUrl(p),
      priceCurrency: 'HUF',
      price: String(p.price.huf),
      availability: P.availability(p).schema,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'MERA' }
    }
  };
  for (const key of ['width', 'height', 'depth']) {
    if (Number.isFinite(dims[key])) product[key] = quantity(dims[key], UNIT[dims.unit || 'cm']);
  }
  if (p.weight && Number.isFinite(p.weight.value)) product.weight = quantity(p.weight.value, UNIT[p.weight.unit || 'g']);

  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tx(P.UI.home), item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: tx(P.UI.shop), item: `${SITE}/bolt` },
      { '@type': 'ListItem', position: 3, name: tx(p.name), item: pageUrl(p) }
    ]
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [product, breadcrumbs] }).replace(/</g, '\\u003c');
}

// ---- the page ----------------------------------------------------------------

function page(p) {
  const name = tx(p.name);
  const title = `${name} | MERA`;
  const metaDescription = truncate([tx(p.description), P.paragraphs(tx(p.details))[0]].filter(Boolean).join(' '), 158);
  const share = shareImage(p);
  const ogImage = abs(share.src);
  const ogImageTags = `<meta property="og:image" content="${ogImage}">`
    + (share.width ? `\n<meta property="og:image:width" content="${share.width}">\n<meta property="og:image:height" content="${share.height}">` : '')
    + `\n<meta property="og:image:alt" content="${esc(share.alt)}">`;
  const avail = P.availability(p);
  const rel = related(p);
  const pageData = {
    product: p,
    related: (rel.list || []).map((o) => ({ id: o.id, name: o.name, price: o.price }))
  };

  const info = [
    `<p class="eyebrow" data-pp="category">${esc(tx(P.CATEGORY_LABELS[p.category]))}</p>`,
    `<h1 data-product-name data-pp="name">${esc(name)}</h1>`,
    `<p class="product-lead" data-pp="description">${esc(tx(p.description))}</p>`,
    `<p class="shop-price product-price"><span data-pp-ui="price">${esc(tx(P.UI.price))}</span> <strong data-product-price>${esc(P.formatPrice(p.price.huf, 'huf', LANG))}</strong></p>`,
    `<p class="product-availability is-${esc(p.availability || 'in_stock')}"><span data-pp="availability">${esc(tx(avail.label))}</span>${p.leadTime ? ` <span class="product-lead-time" data-pp="leadTime">${esc(tx(p.leadTime))}</span>` : ''}</p>`,
    p.availability === 'out_of_stock' ? '' : `<div class="product-buy"><label class="product-qty"><span data-pp-ui="quantity">${esc(tx(P.UI.quantity))}</span><input type="number" name="quantity" min="1" max="99" value="1" inputmode="numeric" data-basket-qty></label><button class="shop-add" type="button" data-basket-add data-pp-ui="add">${esc(tx(P.UI.add))}</button></div>`,
    `<p class="product-basket-link"><a href="../bolt.html#shopBasket" data-pp-ui="viewBasket">${esc(tx(P.UI.viewBasket))}</a></p>`,
    `<p class="basket-status visually-hidden" data-basket-status role="status" aria-live="polite" aria-atomic="true"></p>`,
    p.details ? section('details', `<div data-pp="details">${P.paragraphs(tx(p.details)).map((s) => `<p>${esc(s)}</p>`).join('')}</div>`) : '',
    p.features ? section('features', `<ul class="product-features" data-pp="features">${(tx(p.features) || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`) : '',
    (p.dimensions || p.weight || p.materials) ? section('specs', `<dl class="product-specs" data-pp="specs">${specRows(p)}</dl>`) : '',
    p.care ? section('care', `<p data-pp="care">${esc(tx(p.care))}</p>`) : ''
  ].join('');

  return `<!doctype html>
<!-- Generated by tools/build-products.mjs from products.json — edit those, not this file. -->
<html lang="hu">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(metaDescription)}"><title data-i18n="productPageTitle">${esc(title)}</title>
<link rel="canonical" href="${pageUrl(p)}">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#f3e9db">
<meta property="og:type" content="product">
<meta property="og:site_name" content="MERA">
<meta property="og:locale" content="hu_HU">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDescription)}">
<meta property="og:url" content="${pageUrl(p)}">
${ogImageTags}
<meta property="product:price:amount" content="${esc(p.price.huf)}">
<meta property="product:price:currency" content="HUF">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(metaDescription)}">
<meta name="twitter:image" content="${ogImage}">
<script type="application/ld+json">${structuredData(p)}</script>
${headAssets}</head>
<body>
<a class="skip" href="#main" data-i18n="skipLink">Ugrás a tartalomhoz</a>
${header}
<main id="main" class="product-main">
<nav class="product-breadcrumb" aria-label="Morzsamenü"><ol><li><a href="../" data-pp-ui="home">${esc(tx(P.UI.home))}</a></li><li><a href="../bolt.html" data-pp-ui="shop">${esc(tx(P.UI.shop))}</a></li><li aria-current="page" data-pp="name">${esc(name)}</li></ol></nav>
<article class="product-detail" data-product-id="${esc(p.id)}" data-price-huf="${esc(p.price.huf)}" data-price-eur="${esc(p.price.eur)}" data-category="${esc(p.category || '')}">
${gallery(p)}
<div class="product-info">${info}</div>
</article>
${rel.html || ''}
<script type="application/json" id="productData">${JSON.stringify(pageData).replace(/</g, '\\u003c')}</script>
</main>
${footer}
</body></html>
`;
}

function sitemap() {
  const urls = [
    ...STATIC_PAGES.map((slug) => `${SITE}/${slug}`),
    ...products.map(pageUrl)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
}

// ---- write ---------------------------------------------------------------------

validate(products);
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const p of products) {
  fs.writeFileSync(path.join(OUT_DIR, `${P.slugOf(p)}.html`), page(p));
}
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap());
console.log(`Built ${products.length} product pages in termek/ and updated sitemap.xml`);
