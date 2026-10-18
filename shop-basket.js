// Shop basket: keeps the chosen products in the browser and renders the basket.
// Prices follow the currency chosen in the header (HUF/EUR) — each product card
// carries both amounts in data-price-huf / data-price-eur. Cards are built by
// products.js, so this waits for `mera:productsrendered` before wiring up.
//
// The basket panel only exists on the shop page. On the home page there are
// featured product cards but no panel, so the panel elements are optional: items
// can still be added and the header count still updates; the basket itself is
// viewed on the shop page.
function initShop() {
  const productCards = [...document.querySelectorAll('.shop-product')];
  if (!productCards.length) return;

  const basketStorageKey = 'mera-shop-basket';
  const basketItems = document.querySelector('[data-basket-items]');
  const basketEmpty = document.querySelector('[data-basket-empty]');
  const basketSummary = document.querySelector('[data-basket-summary]');
  const basketTotal = document.querySelector('[data-basket-total]');
  const basketClear = document.querySelector('[data-basket-clear]');
  const basketStatus = document.querySelector('[data-basket-status]');
  const basketLinks = document.querySelectorAll('[data-basket-link]');
  const basketCountLabels = document.querySelectorAll('[data-basket-count]');
  const basketProductById = new Map(productCards.map((card) => [card.dataset.productId, card]));
  let basket = new Map();

  const currency = () => (document.documentElement.dataset.currency === 'eur' ? 'eur' : 'huf');

  function priceOf(card) {
    if (!card) return 0;
    return Number(currency() === 'eur' ? card.dataset.priceEur : card.dataset.priceHuf) || 0;
  }

  function loadBasket() {
    try {
      const saved = JSON.parse(localStorage.getItem(basketStorageKey) || '[]');
      if (!Array.isArray(saved)) throw new TypeError('Saved basket must be a list.');

      for (const item of saved) {
        if (item && Number.isSafeInteger(item.quantity) && item.quantity > 0 && typeof item.id === 'string') {
          basket.set(item.id, item.quantity);
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof TypeError) {
        console.error('The saved basket data is invalid; starting with an empty basket.', error);
        basket.clear();
        try {
          localStorage.removeItem(basketStorageKey);
        } catch (storageError) {
          console.warn('Could not clear invalid saved basket data.', storageError);
        }
      } else {
        console.warn('Could not load the saved basket; using an empty basket.', error);
      }
    }
  }

  function saveBasket() {
    try {
      localStorage.setItem(
        basketStorageKey,
        JSON.stringify([...basket].map(([id, quantity]) => ({ id, quantity })))
      );
    } catch (error) {
      console.warn('Could not save the basket in this browser.', error);
    }
  }

  function translation(key, replacements = {}) {
    const dictionary = translations[document.documentElement.lang];
    const value = dictionary?.[key];
    if (typeof value !== 'string') throw new Error(`Missing basket translation: ${key}`);
    return value.replace(/\{(\w+)\}/g, (placeholder, name) => replacements[name] ?? placeholder);
  }

  function formatPrice(amount) {
    const cur = currency();
    try {
      return new Intl.NumberFormat(document.documentElement.lang, {
        style: 'currency',
        currency: cur === 'eur' ? 'EUR' : 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: cur === 'eur' ? 2 : 0
      }).format(amount);
    } catch (error) {
      return cur === 'eur' ? '€' + amount : amount + ' Ft';
    }
  }

  function productName(card) {
    return card.querySelector('[data-product-name]').textContent.trim();
  }

  function renderItems() {
    if (!basketItems) return;
    basketItems.replaceChildren();
    for (const [id, quantity] of basket) {
      const card = basketProductById.get(id);
      if (!card) continue;
      const name = productName(card);
      const price = priceOf(card);

      const item = document.createElement('li');
      item.className = 'basket-item';

      const main = document.createElement('div');
      main.className = 'basket-item-main';

      const thumb = document.createElement('img');
      thumb.className = 'basket-item-thumb';
      const cardImage = card.querySelector('img');
      thumb.src = cardImage ? cardImage.getAttribute('src') : '';
      thumb.alt = '';
      thumb.setAttribute('aria-hidden', 'true');
      thumb.width = 46;
      thumb.height = 46;
      thumb.loading = 'lazy';

      const details = document.createElement('div');
      details.className = 'basket-item-details';
      const title = document.createElement('span');
      title.className = 'basket-item-name';
      title.textContent = name;
      const subtotal = document.createElement('span');
      subtotal.className = 'basket-item-subtotal';
      subtotal.textContent = formatPrice(price * quantity);
      details.append(title, subtotal);
      main.append(thumb, details);

      const controls = document.createElement('div');
      controls.className = 'basket-item-controls';
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', translation('quantityControls', { product: name }));

      const decrease = document.createElement('button');
      decrease.type = 'button';
      decrease.className = 'basket-quantity-button';
      decrease.dataset.basketAction = 'decrease';
      decrease.dataset.productId = id;
      decrease.textContent = '−';
      decrease.setAttribute('aria-label', translation('decreaseQuantity', { product: name }));

      const count = document.createElement('span');
      count.className = 'basket-quantity';
      count.textContent = String(quantity);
      count.setAttribute('aria-label', String(quantity));

      const increase = document.createElement('button');
      increase.type = 'button';
      increase.className = 'basket-quantity-button';
      increase.dataset.basketAction = 'increase';
      increase.dataset.productId = id;
      increase.textContent = '+';
      increase.setAttribute('aria-label', translation('increaseQuantity', { product: name }));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'basket-remove-button';
      remove.dataset.basketAction = 'remove';
      remove.dataset.productId = id;
      remove.textContent = translation('removeItem');
      remove.setAttribute('aria-label', translation('removeProduct', { product: name }));

      controls.append(decrease, count, increase, remove);
      item.append(main, controls);
      basketItems.append(item);
    }
  }

  function updateBasket() {
    productCards.forEach((card) => {
      const priceEl = card.querySelector('[data-product-price]');
      if (priceEl) priceEl.textContent = formatPrice(priceOf(card));
    });

    const itemCount = [...basket.values()].reduce((sum, quantity) => sum + quantity, 0);
    const total = [...basket].reduce((sum, [id, quantity]) => sum + priceOf(basketProductById.get(id)) * quantity, 0);

    renderItems();

    basketCountLabels.forEach((element) => {
      element.textContent = String(itemCount);
    });
    basketLinks.forEach((element) => {
      element.setAttribute('aria-label', translation('basketLinkAria', { count: itemCount }));
    });
    if (basketEmpty) basketEmpty.hidden = basket.size > 0;
    if (basketSummary) basketSummary.hidden = basket.size === 0;
    if (basketClear) basketClear.disabled = basket.size === 0;
    if (basketTotal) basketTotal.textContent = formatPrice(total);
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function bumpBadge() {
    basketCountLabels.forEach((badge) => {
      badge.classList.remove('is-bumped');
      void badge.offsetWidth; // restart the animation
      badge.classList.add('is-bumped');
    });
  }

  function flyToBasket(card) {
    const source = card.querySelector('img');
    const target = document.querySelector('[data-basket-count]') || document.querySelector('[data-basket-link]');
    if (!source || !target) return;
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const clone = source.cloneNode();
    clone.className = 'mera-fly';
    clone.style.left = from.left + 'px';
    clone.style.top = from.top + 'px';
    clone.style.width = from.width + 'px';
    clone.style.height = from.height + 'px';
    document.body.append(clone);
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.12)`;
      clone.style.opacity = '0.15';
    });
    const remove = () => clone.remove();
    clone.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 800);
  }

  function confirmAdd(card, button) {
    if (button) {
      button.classList.remove('is-added');
      void button.offsetWidth;
      button.classList.add('is-added');
      setTimeout(() => button.classList.remove('is-added'), 900);
    }
    if (reducedMotion.matches) return;
    flyToBasket(card);
    bumpBadge();
  }

  productCards.forEach((card) => {
    const addButton = card.querySelector('[data-basket-add]');
    addButton.addEventListener('click', () => {
      const id = card.dataset.productId;
      const quantity = (basket.get(id) || 0) + 1;
      basket.set(id, quantity);
      saveBasket();
      updateBasket();
      confirmAdd(card, addButton);
      if (basketStatus) {
        basketStatus.textContent = translation('productAdded', { product: productName(card), count: quantity });
      }
    });
  });

  basketItems?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-basket-action]');
    if (!button) return;

    const { productId, basketAction } = button.dataset;
    const quantity = basket.get(productId);
    if (!quantity) return;

    if (basketAction === 'remove' || (basketAction === 'decrease' && quantity === 1)) {
      basket.delete(productId);
    } else if (basketAction === 'decrease') {
      basket.set(productId, quantity - 1);
    } else if (basketAction === 'increase') {
      basket.set(productId, quantity + 1);
    } else {
      return;
    }

    saveBasket();
    updateBasket();
  });

  basketClear?.addEventListener('click', () => {
    basket.clear();
    saveBasket();
    updateBasket();
    if (basketStatus) basketStatus.textContent = translation('basketCleared');
  });

  document.addEventListener('mera:languagechange', updateBasket);
  document.addEventListener('mera:currencychange', updateBasket);
  loadBasket();
  saveBasket();
  updateBasket();
}

if (document.querySelector('.shop-product')) initShop();
else document.addEventListener('mera:productsrendered', initShop, { once: true });
