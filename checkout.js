// Checkout page (rendeles.html). Reads the basket from the browser and the
// catalogue from products.json, shows the order summary, and emails the order to
// MERA. Prices follow the chosen currency; text follows the chosen language.
//
// To email orders automatically, paste a free Web3Forms access key
// (https://web3forms.com) below. Until then, submitting opens the visitor's own
// email app addressed to ORDER_EMAIL with the order details filled in.
(function () {
  const WEB3FORMS_ACCESS_KEY = 'PASTE-YOUR-WEB3FORMS-ACCESS-KEY';
  const ORDER_EMAIL = 'hello@merahome.hu';
  const BASKET_KEY = 'mera-shop-basket';

  const summaryEl = document.querySelector('[data-checkout-summary]');
  if (!summaryEl) return;
  const totalEl = document.querySelector('[data-checkout-total]');
  const orderBox = document.querySelector('[data-checkout-order]');
  const emptyEl = document.querySelector('[data-checkout-empty]');
  const formEl = document.querySelector('[data-checkout-form]');
  const statusEl = document.querySelector('[data-checkout-status]');
  const thanksEl = document.querySelector('[data-checkout-thanks]');

  const lang = () => document.documentElement.lang || 'hu';
  const currency = () => (document.documentElement.dataset.currency === 'eur' ? 'eur' : 'huf');
  const t = (key) => window.translations?.[lang()]?.[key] ?? window.translations?.hu?.[key] ?? key;

  function formatPrice(amount) {
    const cur = currency();
    try {
      return new Intl.NumberFormat(lang(), {
        style: 'currency',
        currency: cur === 'eur' ? 'EUR' : 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: cur === 'eur' ? 2 : 0
      }).format(amount);
    } catch (error) {
      return cur === 'eur' ? '€' + amount : amount + ' Ft';
    }
  }

  const products = new Map();

  function readBasket() {
    try {
      const saved = JSON.parse(localStorage.getItem(BASKET_KEY) || '[]');
      return Array.isArray(saved)
        ? saved.filter((i) => i && typeof i.id === 'string' && Number.isSafeInteger(i.quantity) && i.quantity > 0)
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveBasket(list) {
    try {
      localStorage.setItem(BASKET_KEY, JSON.stringify(list));
    } catch (error) {
      console.warn('Could not update the basket.', error);
    }
  }

  function orderItems() {
    return readBasket()
      .map(({ id, quantity }) => {
        const product = products.get(id);
        if (!product) return null;
        const name = product.name[lang()] || product.name.hu;
        const unit = currency() === 'eur' ? product.price.eur : product.price.huf;
        return { id, quantity, name, subtotal: Number(unit) * quantity };
      })
      .filter(Boolean);
  }

  function updateHeaderCount() {
    const count = readBasket().reduce((sum, i) => sum + i.quantity, 0);
    document.querySelectorAll('[data-basket-count]').forEach((el) => { el.textContent = String(count); });
  }

  function render() {
    updateHeaderCount();
    const list = orderItems();
    const empty = list.length === 0;
    if (orderBox) orderBox.hidden = empty;
    if (emptyEl) emptyEl.hidden = !empty;
    if (empty) return;

    summaryEl.replaceChildren();
    for (const line of list) {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${line.quantity} × ${line.name}`;
      const value = document.createElement('span');
      value.textContent = formatPrice(line.subtotal);
      li.append(label, value);
      summaryEl.append(li);
    }
    if (totalEl) totalEl.textContent = formatPrice(list.reduce((sum, i) => sum + i.subtotal, 0));
  }

  function orderText(customer, list, total) {
    const lines = list.map((i) => `  ${i.quantity} x ${i.name} — ${formatPrice(i.subtotal)}`);
    return [
      'MERA - rendeles / order',
      '',
      ...lines,
      '',
      'Osszesen / Total: ' + formatPrice(total),
      '',
      'Nev / Name: ' + customer.name,
      'E-mail: ' + customer.email,
      'Telefon / Phone: ' + customer.phone,
      'Cim / Address: ' + customer.address,
      'Megjegyzes / Note: ' + (customer.message || '-')
    ].join('\n');
  }

  fetch('products.json')
    .then((response) => response.json())
    .then((data) => {
      (Array.isArray(data) ? data : []).forEach((p) => { if (p && p.id) products.set(p.id, p); });
      render();
    })
    .catch((error) => {
      console.error('Could not load products for checkout.', error);
      render();
    });

  document.addEventListener('mera:languagechange', render);
  document.addEventListener('mera:currencychange', render);

  if (formEl) {
    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!formEl.reportValidity()) return;
      const data = new FormData(formEl);
      if (data.get('botcheck')) return; // honeypot
      const list = orderItems();
      if (!list.length) {
        if (statusEl) statusEl.textContent = t('coEmptyError');
        return;
      }
      const customer = {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        address: data.get('address'),
        message: data.get('message')
      };
      const total = list.reduce((sum, i) => sum + i.subtotal, 0);
      const body = orderText(customer, list, total);
      const subject = 'MERA rendeles - ' + customer.name;
      const submitButton = formEl.querySelector('[type="submit"]');

      const succeed = () => {
        saveBasket([]);
        updateHeaderCount();
        if (orderBox) orderBox.hidden = true;
        if (emptyEl) emptyEl.hidden = true;
        if (thanksEl) thanksEl.hidden = false;
        if (statusEl) statusEl.textContent = '';
      };

      if (WEB3FORMS_ACCESS_KEY.indexOf('PASTE') === 0) {
        window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        succeed();
        return;
      }

      if (statusEl) statusEl.textContent = t('coSending');
      if (submitButton) submitButton.disabled = true;
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject,
          from_name: 'MERA webshop',
          replyto: customer.email,
          name: customer.name,
          email: customer.email,
          message: body
        })
      })
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) throw new Error(result.message || 'Web3Forms error');
          succeed();
        })
        .catch(() => {
          if (submitButton) submitButton.disabled = false;
          if (statusEl) statusEl.textContent = t('coError');
        });
    });
  }
})();
