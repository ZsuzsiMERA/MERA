// Renders a 1200×630 JPG link-preview image (assets/shop/share/<id>.jpg) for each
// product whose pictures are all SVG. Social apps (Telegram, Facebook, WhatsApp…)
// can't show SVGs, so without this a product link previews with the site's
// general share image. Products with a JPG/PNG/WebP photo don't need one: the
// page builder uses the photo directly.
//
// Needs Playwright (Chromium): `node tools/make-share-images.cjs`, then
// `node tools/build-products.mjs`. Re-run after changing a product's SVG.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'assets', 'shop', 'share');
const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
const isRaster = (src) => /\.(jpe?g|png|webp)$/i.test(src || '');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  let made = 0;
  for (const p of products) {
    const sources = [p.image, ...(p.gallery || []).map((g) => g.src)];
    if (sources.some(isRaster) || !/\.svg$/i.test(p.image || '')) continue;
    const svg = fs.readFileSync(path.join(root, p.image), 'utf8');
    // Fill the sides with the illustration's own background colour so it blends.
    const background = (svg.match(/<rect[^>]*width="600"[^>]*fill="(#[0-9a-f]{3,8})"/i) || [])[1] || '#f6f1eb';
    const dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
    await page.setContent(`<body style="margin:0;height:630px;display:grid;place-items:center;background:${background}"><img src="${dataUrl}" style="height:630px;width:auto"></body>`);
    await page.waitForFunction(() => document.querySelector('img').complete);
    await page.screenshot({ path: path.join(outDir, `${p.id}.jpg`), type: 'jpeg', quality: 85 });
    made += 1;
  }
  await browser.close();
  console.log(`Made ${made} share images in assets/shop/share/`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
