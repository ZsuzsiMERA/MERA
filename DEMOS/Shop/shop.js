/* Mera shop: a basket kept in the visitor's browser, and an order form that
   emails the order to the shop through Web3Forms (https://web3forms.com).

   Setup: create a free access key at web3forms.com with the shop's email address
   and paste it below. Until then the demo runs without sending anything and shows
   the email it would have sent. */
var WEB3FORMS_ACCESS_KEY = 'PASTE-YOUR-ACCESS-KEY-HERE';
var SHOP_NAME = 'Mera';

(function () {
  var BASKET_KEY = 'mera-basket';
  var LAST_ORDER_KEY = 'mera-last-order';
  var demoMode = WEB3FORMS_ACCESS_KEY.indexOf('PASTE') === 0;

  /* Storage can be unavailable (private windows, blocked site data), so every
     read and write is guarded and the shop still works for the current page. */
  var memory = {};
  function load(store, key, fallback) {
    try {
      var raw = window[store].getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return memory[key] || fallback;
    }
  }
  function save(store, key, value) {
    memory[key] = value;
    try { window[store].setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function getBasket() { return load('localStorage', BASKET_KEY, []); }
  function setBasket(items) { save('localStorage', BASKET_KEY, items); updateCount(); }

  var formatter = new Intl.NumberFormat('hu-HU');
  function money(forints) { return formatter.format(forints) + ' Ft'; }

  function total(items) {
    return items.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
  }

  function updateCount() {
    var count = getBasket().reduce(function (n, item) { return n + item.qty; }, 0);
    document.querySelectorAll('[data-basket-count]').forEach(function (el) { el.textContent = count; });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* Shop page: "Add to basket" buttons read the product from its <article>. */
  document.querySelectorAll('[data-add]').forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.product');
      var items = getBasket();
      var id = card.dataset.id;
      var existing = items.find(function (item) { return item.id === id; });
      if (existing) {
        existing.qty += 1;
      } else {
        items.push({ id: id, name: card.dataset.name, price: Number(card.dataset.price), qty: 1 });
      }
      setBasket(items);
      var note = card.querySelector('.added');
      if (note) { note.textContent = 'Added. ' + (existing ? existing.qty : 1) + ' in your basket.'; }
    });
  });

  /* Basket page: table of items with quantity controls, then the order form. */
  var basketEl = document.querySelector('[data-basket]');
  var orderSection = document.querySelector('[data-order-section]');

  function renderBasket() {
    var items = getBasket();
    if (!items.length) {
      basketEl.innerHTML = '<div class="empty">Your basket is empty. <a href="index.html">Go to the shop</a></div>';
      orderSection.hidden = true;
      return;
    }
    var rows = items.map(function (item, i) {
      return '<tr>' +
        '<td>' + escapeHtml(item.name) + '</td>' +
        '<td class="num">' + money(item.price) + '</td>' +
        '<td><span class="qty">' +
          '<button type="button" class="secondary" data-change="-1" data-index="' + i + '" aria-label="One fewer">−</button>' +
          item.qty +
          '<button type="button" class="secondary" data-change="1" data-index="' + i + '" aria-label="One more">+</button>' +
        '</span></td>' +
        '<td class="num">' + money(item.price * item.qty) + '</td>' +
      '</tr>';
    }).join('');
    basketEl.innerHTML =
      '<table class="basket">' +
        '<thead><tr><th>Product</th><th class="num">Price</th><th>Quantity</th><th class="num">Subtotal</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '<tfoot><tr><td colspan="3">Total (excluding delivery)</td><td class="num">' + money(total(items)) + '</td></tr></tfoot>' +
      '</table>';
    orderSection.hidden = false;
  }

  if (basketEl) {
    basketEl.addEventListener('click', function (event) {
      var button = event.target.closest('[data-change]');
      if (!button) { return; }
      var items = getBasket();
      var item = items[Number(button.dataset.index)];
      item.qty += Number(button.dataset.change);
      if (item.qty < 1) { items.splice(Number(button.dataset.index), 1); }
      setBasket(items);
      renderBasket();
    });
    renderBasket();
  }

  function orderNumber() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return 'M-' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) +
      '-' + Math.floor(1000 + Math.random() * 9000);
  }

  /* The email the shop receives: plain text, so it reads well in any inbox. */
  function orderText(number, items, customer) {
    var lines = items.map(function (item) {
      return '  ' + item.qty + ' × ' + item.name + ' @ ' + money(item.price) + ' = ' + money(item.price * item.qty);
    });
    return [
      'Order ' + number,
      '',
      lines.join('\n'),
      '',
      'Total (excluding delivery): ' + money(total(items)),
      '',
      'Name: ' + customer.name,
      'Email: ' + customer.email,
      'Phone: ' + customer.phone,
      'Delivery address:',
      customer.address,
      '',
      'Message: ' + (customer.message || '(none)'),
      '',
      'Next step: reply to the customer to confirm stock and delivery, with the bank details',
      'and the amount to transfer. Ask them to use ' + number + ' as the payment reference.'
    ].join('\n');
  }

  var form = document.querySelector('[data-order-form]');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var items = getBasket();
      if (!items.length) { return; }

      var data = new FormData(form);
      var customer = {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        address: data.get('address'),
        message: data.get('message')
      };
      var number = orderNumber();
      var text = orderText(number, items, customer);
      var status = form.querySelector('[data-form-status]');
      var submit = form.querySelector('[type="submit"]');

      function finish() {
        save('sessionStorage', LAST_ORDER_KEY, { number: number, preview: demoMode ? text : '' });
        setBasket([]);
        window.location.href = 'thanks.html';
      }

      if (demoMode) { finish(); return; }

      submit.disabled = true;
      status.textContent = 'Sending…';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'New order ' + number + ' from ' + customer.name,
          from_name: SHOP_NAME + ' website',
          replyto: customer.email,
          botcheck: data.get('botcheck') ? true : false,
          name: customer.name,
          email: customer.email,
          message: text
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          if (!result.success) { throw new Error(result.message); }
          finish();
        })
        .catch(function () {
          submit.disabled = false;
          status.textContent = 'Sorry, the order could not be sent. Please try again, or email us directly.';
        });
    });
  }

  /* Thank-you page: show the order number, and in demo mode the email preview. */
  var numberEl = document.querySelector('[data-order-number]');
  if (numberEl) {
    var last = load('sessionStorage', LAST_ORDER_KEY, null);
    if (last) {
      numberEl.textContent = last.number;
      if (last.preview) {
        document.querySelector('[data-preview-text]').textContent = last.preview;
        document.querySelector('[data-demo-preview]').hidden = false;
      }
    }
  }

  updateCount();
})();
