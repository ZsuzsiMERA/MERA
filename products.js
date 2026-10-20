// Builds the shop product cards from products.json.
//
// A container <div class="shop-products" data-shop-mode="featured|all"> decides
// what it shows: "featured" (the home page) renders only products flagged
// `featured`; "all" (the shop page) renders every product and adds a search box
// and category filter. Prices are left for shop-basket.js to format (it owns the
// currency), so this file only handles layout and the translated text.
(function () {
  const container = document.querySelector('.shop-products');
  if (!container) return;
  const mode = container.dataset.shopMode === 'featured' ? 'featured' : 'all';

  // Category labels and the product page paths are shared with the product
  // pages (product-format.js).
  const { CATEGORY_LABELS, pagePath } = window.MeraProducts;
  const UI = {
    all:    { hu: 'Mind', en: 'All', de: 'Alle' },
    search: { hu: 'Keresés a termékek között…', en: 'Search products…', de: 'Produkte suchen…' },
    none:   { hu: 'Nincs a keresésnek megfelelő termék.', en: 'No matching products.', de: 'Keine passenden Produkte.' },
    price:  { hu: 'Ár', en: 'Price', de: 'Preis' },
    add:    { hu: 'Kosárba teszem', en: 'Add to basket', de: 'In den Warenkorb' }
  };

  const lang = () => document.documentElement.lang || 'hu';
  const t = (obj) => obj[lang()] || obj.hu || Object.values(obj)[0] || '';

  // Price filter (thresholds are in HUF regardless of the displayed currency).
  const PRICE_FILTERS = [
    { key: 'all', max: Infinity },
    { key: 'u10', max: 10000 },
    { key: 'u20', max: 20000 }
  ];
  const PRICE_UNDER = { hu: '{v} alatt', en: 'Under {v}', de: 'Unter {v}' };
  function hufLabel(amount) {
    try {
      return new Intl.NumberFormat(lang(), { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(amount);
    } catch (error) {
      return amount + ' Ft';
    }
  }
  const priceFilterLabel = (f) => (f.key === 'all' ? t(UI.all) : t(PRICE_UNDER).replace('{v}', hufLabel(f.max)));

  let products = [];
  const cards = []; // { el, product, img, nameEl, descEl, priceLabelEl, addBtn }
  let filterButtons = [];
  let priceButtons = [];
  let searchInput = null;
  let emptyEl = null;
  let activeCategory = 'all';
  let activePrice = 'all';

  function searchText(p) {
    const cat = CATEGORY_LABELS[p.category] ? t(CATEGORY_LABELS[p.category]) : '';
    return `${t(p.name)} ${t(p.description)} ${cat}`.toLowerCase();
  }

  function buildCard(p) {
    const art = document.createElement('article');
    art.className = 'shop-product';
    art.dataset.productId = p.id;
    art.dataset.priceHuf = p.price.huf;
    art.dataset.priceEur = p.price.eur;
    art.dataset.category = p.category || '';

    const href = pagePath(p);
    const media = document.createElement('a');
    media.className = 'shop-product-media';
    media.href = href;
    media.tabIndex = -1; // the name link below is the keyboard stop
    const img = document.createElement('img');
    img.src = p.image || '';
    img.alt = t(p.name);
    img.width = 600; img.height = 450; img.loading = 'lazy';
    media.append(img);

    const body = document.createElement('div');
    body.className = 'shop-product-body';

    const name = document.createElement('h3');
    const nameLink = document.createElement('a');
    nameLink.href = href;
    nameLink.setAttribute('data-product-name', '');
    nameLink.textContent = t(p.name);
    name.append(nameLink);

    const desc = document.createElement('p');
    desc.textContent = t(p.description);

    const price = document.createElement('p');
    price.className = 'shop-price';
    const priceLabel = document.createElement('span');
    priceLabel.textContent = t(UI.price);
    const priceValue = document.createElement('strong');
    priceValue.setAttribute('data-product-price', ''); // shop-basket.js fills this
    price.append(priceLabel, document.createTextNode(' '), priceValue);

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'shop-add';
    add.setAttribute('data-basket-add', '');
    add.textContent = t(UI.add);

    body.append(name, desc, price, add);
    art.append(media, body);
    cards.push({ el: art, product: p, img, nameEl: nameLink, descEl: desc, priceLabelEl: priceLabel, addBtn: add });
    return art;
  }

  function buildToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'shop-toolbar';

    searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'shop-search';
    searchInput.setAttribute('aria-label', t(UI.search));
    searchInput.placeholder = t(UI.search);
    searchInput.addEventListener('input', applyFilter);

    const filters = document.createElement('div');
    filters.className = 'shop-filters';
    filters.setAttribute('role', 'group');

    const cats = ['all', ...[...new Set(products.map((p) => p.category))].filter(Boolean)];
    filterButtons = cats.map((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shop-filter' + (cat === 'all' ? ' is-active' : '');
      btn.dataset.category = cat;
      btn.setAttribute('aria-pressed', cat === 'all' ? 'true' : 'false');
      btn.textContent = cat === 'all' ? t(UI.all) : t(CATEGORY_LABELS[cat] || { hu: cat });
      btn.addEventListener('click', () => {
        activeCategory = cat;
        filterButtons.forEach((b) => {
          const on = b.dataset.category === cat;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyFilter();
      });
      return btn;
    });
    filters.append(...filterButtons);

    const priceFilters = document.createElement('div');
    priceFilters.className = 'shop-filters shop-price-filters';
    priceFilters.setAttribute('role', 'group');
    priceButtons = PRICE_FILTERS.map((f) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shop-filter' + (f.key === 'all' ? ' is-active' : '');
      btn.dataset.price = f.key;
      btn.setAttribute('aria-pressed', f.key === 'all' ? 'true' : 'false');
      btn.textContent = priceFilterLabel(f);
      btn.addEventListener('click', () => {
        activePrice = f.key;
        priceButtons.forEach((b) => {
          const on = b.dataset.price === f.key;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyFilter();
      });
      return btn;
    });
    priceFilters.append(...priceButtons);

    toolbar.append(filters, priceFilters, searchInput);
    container.before(toolbar);

    emptyEl = document.createElement('p');
    emptyEl.className = 'shop-empty';
    emptyEl.hidden = true;
    emptyEl.textContent = t(UI.none);
    container.after(emptyEl);
  }

  function applyFilter() {
    if (mode !== 'all') return;
    const query = (searchInput.value || '').trim().toLowerCase();
    const priceCap = (PRICE_FILTERS.find((f) => f.key === activePrice) || {}).max ?? Infinity;
    let visible = 0;
    for (const card of cards) {
      const catOk = activeCategory === 'all' || card.product.category === activeCategory;
      const priceOk = Number(card.product.price.huf) < priceCap;
      const qOk = !query || searchText(card.product).includes(query);
      card.el.hidden = !(catOk && priceOk && qOk);
      if (!card.el.hidden) visible += 1;
    }
    if (emptyEl) emptyEl.hidden = visible > 0;
  }

  function localize() {
    for (const card of cards) {
      card.nameEl.textContent = t(card.product.name);
      card.descEl.textContent = t(card.product.description);
      card.img.alt = t(card.product.name);
      card.priceLabelEl.textContent = t(UI.price);
      card.addBtn.textContent = t(UI.add);
    }
    if (mode === 'all' && searchInput) {
      searchInput.placeholder = t(UI.search);
      searchInput.setAttribute('aria-label', t(UI.search));
      filterButtons.forEach((b) => {
        b.textContent = b.dataset.category === 'all' ? t(UI.all) : t(CATEGORY_LABELS[b.dataset.category] || { hu: b.dataset.category });
      });
      priceButtons.forEach((b) => {
        b.textContent = priceFilterLabel(PRICE_FILTERS.find((f) => f.key === b.dataset.price));
      });
      if (emptyEl) emptyEl.textContent = t(UI.none);
      applyFilter();
    }
  }

  function render() {
    const list = mode === 'featured' ? products.filter((p) => p.featured) : products;
    container.replaceChildren();
    cards.length = 0;
    list.forEach((p) => container.append(buildCard(p)));
    if (mode === 'all') buildToolbar();
  }

  fetch('products.json')
    .then((response) => {
      if (!response.ok) throw new Error(`products.json request failed: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      products = Array.isArray(data) ? data.filter((p) => p && p.id && p.price) : [];
      render();
      // Tell shop-basket.js the cards exist so it can wire up the basket.
      document.dispatchEvent(new CustomEvent('mera:productsrendered'));
    })
    .catch((error) => {
      console.error('Could not load the products.', error);
      container.innerHTML = '<p class="shop-empty">A termékek jelenleg nem elérhetők.</p>';
    });

  document.addEventListener('mera:languagechange', () => {
    if (cards.length) localize();
  });
})();
