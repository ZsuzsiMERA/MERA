// Product pages: run `node tools/build-products.mjs` first, then this with Node
// and Playwright available (Chromium installed).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const screenshots = process.env.MERA_SCREENSHOT_DIR || fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'mera-products-'));
fs.mkdirSync(screenshots, { recursive: true });
const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0])));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
  fs.readFile(file, (error, data) => { res.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(error ? '' : data); });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.MERA_BROWSER_CHANNEL ? { channel: process.env.MERA_BROWSER_CHANNEL } : {}) });
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const context = await browser.newContext({ locale: 'hu-HU' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });

    // Every product page exists and carries valid structured data.
    for (const p of products) {
      const html = fs.readFileSync(path.join(root, 'termek', `${p.slug}.html`), 'utf8');
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
      const product = ld['@graph'].find(node => node['@type'] === 'Product');
      assert.equal(product.offers.price, String(p.price.huf));
      assert.equal(product.url, `https://merahome.hu/termek/${p.slug}`);
      assert.ok(html.includes(`<link rel="canonical" href="https://merahome.hu/termek/${p.slug}">`));
    }
    const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
    for (const p of products) assert.ok(sitemap.includes(`https://merahome.hu/termek/${p.slug}<`), `sitemap lists ${p.slug}`);

    // Shop cards link to the product pages.
    await page.goto(`${url}/bolt.html`);
    await page.waitForSelector('.shop-product');
    const nameplateCard = page.locator('.shop-product[data-product-id="nameplate"]');
    assert.equal(await nameplateCard.locator('h3 a').getAttribute('href'), 'termek/nevtabla.html');
    await nameplateCard.locator('h3 a').click();
    await page.waitForURL(/termek\/nevtabla\.html$/);

    // Gallery: vertical thumbnails, selected image large to their right.
    const thumbs = page.locator('[data-gallery-thumb]');
    const stage = page.locator('[data-gallery-stage]');
    assert.equal(await thumbs.count(), 1 + products[0].gallery.length);
    const [t0, t1, stageBox] = [await thumbs.nth(0).boundingBox(), await thumbs.nth(1).boundingBox(), await stage.boundingBox()];
    assert.ok(t1.y > t0.y + t0.height - 1 && Math.abs(t1.x - t0.x) < 1, 'thumbnails stack vertically');
    assert.ok(stageBox.x > t0.x + t0.width && stageBox.width > t0.width * 3, 'large image sits right of the thumbnails');
    await thumbs.nth(1).click();
    assert.equal(await stage.getAttribute('src'), '../assets/shop/nameplate-detail.svg');
    assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'), 'true');
    assert.equal(await thumbs.nth(0).getAttribute('aria-pressed'), 'false');
    await page.keyboard.press('ArrowDown');
    assert.equal(await stage.getAttribute('src'), '../assets/shop/nameplate-room.svg');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.index), '2');
    await page.keyboard.press('ArrowDown');
    assert.equal(await stage.getAttribute('src'), '../assets/shop/nameplate.svg', 'wraps to the first image');
    await page.screenshot({ path: path.join(screenshots, 'product-desktop.png'), fullPage: true });

    // Add to basket with a quantity.
    await page.locator('[data-basket-qty]').fill('3');
    await page.locator('.product-detail [data-basket-add]').click();
    assert.equal(await page.locator('[data-basket-count]').first().textContent(), '3');
    await page.locator('.product-detail [data-basket-add]').click();
    assert.equal(await page.locator('[data-basket-count]').first().textContent(), '6');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mera-shop-basket')));
    assert.deepEqual(saved, [{ id: 'nameplate', quantity: 6 }]);

    // Language and currency switches.
    assert.equal(await page.title(), 'Névtábla | MERA');
    await page.selectOption('#language', 'en');
    assert.equal(await page.locator('h1').textContent(), 'Name plaque');
    assert.equal(await page.title(), 'Name plaque | MERA');
    assert.equal(await page.locator('.product-specs dt').first().textContent(), 'Width');
    assert.equal(await page.locator('.product-detail [data-basket-add]').textContent(), 'Add to basket');
    assert.equal(await thumbs.nth(1).getAttribute('aria-label'), 'Name plaque – close-up');
    await page.selectOption('#currency', 'eur');
    assert.equal(await page.locator('[data-product-price]').textContent(), '€17');
    assert.match(await page.locator('[data-related-price]').first().textContent(), /^€\d/);
    await page.selectOption('#language', 'hu');
    await page.selectOption('#currency', 'huf');

    // The basket on the shop page shows the item added on the product page.
    await page.locator('.product-breadcrumb a[href="../bolt.html"]').click();
    await page.waitForSelector('.basket-item');
    assert.match(await page.locator('.basket-item-name').textContent(), /Névtábla/);

    // Phone width: no sideways scrolling, thumbnails still beside the image.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${url}/termek/fa-ejjeli-lampa.html`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'no horizontal scroll');
    const [m0, mStage] = [await thumbs.nth(0).boundingBox(), await stage.boundingBox()];
    assert.ok(mStage.x > m0.x + m0.width, 'thumbnails stay left of the image on phones');
    await page.screenshot({ path: path.join(screenshots, 'product-phone.png'), fullPage: true });

    // Featured cards on the home page link through too.
    await page.goto(url);
    await page.waitForSelector('.shop-product');
    assert.equal(await page.locator('.shop-product[data-product-id="night-light"] .shop-product-media').getAttribute('href'), 'termek/fa-ejjeli-lampa.html');

    assert.deepEqual(errors, []);
    console.log(`Product page checks passed. Screenshots: ${screenshots}`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
