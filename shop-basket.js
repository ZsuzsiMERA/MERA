const basketStorageKey = 'mera-shop-basket';
const productCards = [...document.querySelectorAll('.shop-product')];
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

function loadBasket() {
  try {
    const saved = JSON.parse(localStorage.getItem(basketStorageKey) || '[]');
    if (!Array.isArray(saved)) throw new TypeError('Saved basket must be a list.');

    for (const item of saved) {
      if (
        item &&
        basketProductById.has(item.id) &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0
      ) {
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
  return new Intl.NumberFormat(document.documentElement.lang, {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0
  }).format(amount);
}

function productName(card) {
  return card.querySelector('[data-product-name]').textContent.trim();
}

function updateBasket() {
  const itemCount = [...basket.values()].reduce((sum, quantity) => sum + quantity, 0);
  const total = [...basket].reduce((sum, [id, quantity]) => {
    return sum + Number(basketProductById.get(id).dataset.price) * quantity;
  }, 0);

  basketItems.replaceChildren();
  for (const [id, quantity] of basket) {
    const card = basketProductById.get(id);
    const name = productName(card);
    const price = Number(card.dataset.price);
    const item = document.createElement('li');
    item.className = 'basket-item';

    const details = document.createElement('div');
    details.className = 'basket-item-details';
    const title = document.createElement('span');
    title.className = 'basket-item-name';
    title.textContent = name;
    const subtotal = document.createElement('span');
    subtotal.className = 'basket-item-subtotal';
    subtotal.textContent = formatPrice(price * quantity);
    details.append(title, subtotal);

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
    item.append(details, controls);
    basketItems.append(item);
  }

  basketCountLabels.forEach((element) => {
    element.textContent = String(itemCount);
  });
  basketLinks.forEach((element) => {
    element.setAttribute('aria-label', translation('basketLinkAria', { count: itemCount }));
  });
  basketEmpty.hidden = basket.size > 0;
  basketSummary.hidden = basket.size === 0;
  basketClear.disabled = basket.size === 0;
  basketTotal.textContent = formatPrice(total);
}

productCards.forEach((card) => {
  card.querySelector('[data-basket-add]').addEventListener('click', () => {
    const id = card.dataset.productId;
    const quantity = (basket.get(id) || 0) + 1;
    basket.set(id, quantity);
    saveBasket();
    updateBasket();
    basketStatus.textContent = translation('productAdded', {
      product: productName(card),
      count: quantity
    });
  });
});

basketItems.addEventListener('click', (event) => {
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

basketClear.addEventListener('click', () => {
  basket.clear();
  saveBasket();
  updateBasket();
  basketStatus.textContent = translation('basketCleared');
});

document.addEventListener('mera:languagechange', updateBasket);
loadBasket();
updateBasket();
