// Currency switch (HUF / EUR). Mirrors the language control: the choice is
// stored in the browser, applied to <html data-currency>, and broadcast as a
// `mera:currencychange` event that the shop and basket listen to.
(function () {
  const root = document.documentElement;
  const select = document.querySelector('#currency');
  const STORAGE_KEY = 'mera-currency';
  const isValid = (value) => value === 'huf' || value === 'eur';

  function apply(currency) {
    root.dataset.currency = currency;
    if (select) select.value = currency;
    document.dispatchEvent(new CustomEvent('mera:currencychange', { detail: { currency } }));
  }

  let saved;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not read the saved currency preference.', error);
  }
  apply(isValid(saved) ? saved : 'huf');

  select?.addEventListener('change', () => {
    apply(isValid(select.value) ? select.value : 'huf');
    try {
      localStorage.setItem(STORAGE_KEY, root.dataset.currency);
    } catch (error) {
      console.warn('Could not save the currency preference.', error);
    }
  });
})();
