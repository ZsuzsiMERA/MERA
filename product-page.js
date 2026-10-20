// Product page (termek/<slug>.html): the image gallery and the language switch.
// The page is generated in Hungarian by tools/build-products.mjs; this swaps the
// product text into the visitor's language using the product data embedded in
// the page. Prices and the basket are handled by shop-basket.js.
(function () {
  const P = window.MeraProducts;
  const dataEl = document.querySelector('#productData');
  const detail = document.querySelector('.product-detail');
  if (!P || !dataEl || !detail) return;

  let data;
  try {
    data = JSON.parse(dataEl.textContent);
  } catch (error) {
    console.error('The product data on this page is invalid.', error);
    return;
  }
  const product = data.product;
  const lang = () => document.documentElement.lang || 'hu';
  const currency = () => (document.documentElement.dataset.currency === 'eur' ? 'eur' : 'huf');
  const tx = (obj) => P.t(obj, lang());

  // ---- gallery: vertical thumbnails, selected image in the large frame ----
  const images = [{ src: product.image, alt: product.name }, ...(product.gallery || [])].filter((img) => img && img.src);
  const stage = document.querySelector('[data-gallery-stage]');
  const thumbs = [...document.querySelectorAll('[data-gallery-thumb]')];
  let current = 0;

  function show(index, focus) {
    const img = images[index];
    if (!img || !stage) return;
    current = index;
    stage.src = '../' + img.src;
    stage.alt = tx(img.alt);
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-pressed', i === index ? 'true' : 'false'));
    if (focus) thumbs[index]?.focus();
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => show(i, false));
    thumb.addEventListener('keydown', (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (event.key === 'Home') { event.preventDefault(); show(0, true); }
      else if (event.key === 'End') { event.preventDefault(); show(thumbs.length - 1, true); }
      else if (step) {
        event.preventDefault();
        show((i + step + thumbs.length) % thumbs.length, true);
      }
    });
  });

  // ---- language ----
  function setList(el, items, tag) {
    el.replaceChildren(...items.map((text) => {
      const node = document.createElement(tag);
      node.textContent = text;
      return node;
    }));
  }

  function specRows() {
    const rows = P.dimensionRows(product.dimensions, lang()).map((r) => [r.label, r.value]);
    const weight = P.weightText(product.weight, lang());
    if (weight) rows.push([tx(P.UI.weight), weight]);
    if (product.materials) rows.push([tx(P.UI.materials), tx(product.materials)]);
    return rows;
  }

  const FIELDS = {
    name: (el) => { el.textContent = tx(product.name); },
    category: (el) => { el.textContent = tx(P.CATEGORY_LABELS[product.category]); },
    description: (el) => { el.textContent = tx(product.description); },
    availability: (el) => { el.textContent = tx(P.availability(product).label); },
    leadTime: (el) => { el.textContent = tx(product.leadTime); },
    details: (el) => setList(el, P.paragraphs(tx(product.details)), 'p'),
    features: (el) => setList(el, tx(product.features) || [], 'li'),
    care: (el) => { el.textContent = tx(product.care); },
    specs: (el) => {
      el.replaceChildren(...specRows().map(([label, value]) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = value;
        row.append(dt, dd);
        return row;
      }));
    }
  };

  function localize() {
    document.querySelectorAll('[data-pp]').forEach((el) => FIELDS[el.dataset.pp]?.(el));
    document.querySelectorAll('[data-pp-ui]').forEach((el) => { el.textContent = tx(P.UI[el.dataset.ppUi]); });
    document.querySelectorAll('[data-pp-ui-aria]').forEach((el) => el.setAttribute('aria-label', tx(P.UI[el.dataset.ppUiAria])));
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-label', tx(images[i]?.alt)));
    if (stage) stage.alt = tx(images[current]?.alt);
    for (const item of data.related || []) {
      const nameEl = document.querySelector(`[data-related-name="${CSS.escape(item.id)}"]`);
      if (nameEl) nameEl.textContent = tx(item.name);
    }
    document.title = `${tx(product.name)} | MERA`;
    updateRelatedPrices();
  }

  function updateRelatedPrices() {
    for (const item of data.related || []) {
      const priceEl = document.querySelector(`[data-related-price="${CSS.escape(item.id)}"]`);
      if (priceEl) priceEl.textContent = P.formatPrice(item.price[currency()], currency(), lang());
    }
  }

  document.addEventListener('mera:languagechange', localize);
  document.addEventListener('mera:currencychange', updateRelatedPrices);
  localize();
})();
