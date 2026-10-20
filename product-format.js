// Shared product text and formatting, used in the browser (products.js,
// product-page.js) and by the page generator (tools/build-products.mjs), so the
// static product pages and the live language switch always say the same thing.
// In the browser it is exposed as window.MeraProducts; in Node via require().
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MeraProducts = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const CATEGORY_LABELS = {
    personalised: { hu: 'Névre szóló', en: 'Personalised', de: 'Personalisiert' },
    textile:      { hu: 'Textil', en: 'Textiles', de: 'Textilien' },
    decor:        { hu: 'Dekoráció', en: 'Decor', de: 'Deko' },
    lighting:     { hu: 'Világítás', en: 'Lighting', de: 'Beleuchtung' },
    keepsake:     { hu: 'Emlék', en: 'Keepsakes', de: 'Erinnerungen' },
    storage:      { hu: 'Tárolás', en: 'Storage', de: 'Aufbewahrung' }
  };

  const UI = {
    home:        { hu: 'Főoldal', en: 'Home', de: 'Startseite' },
    shop:        { hu: 'Bolt', en: 'Shop', de: 'Shop' },
    price:       { hu: 'Ár', en: 'Price', de: 'Preis' },
    add:         { hu: 'Kosárba teszem', en: 'Add to basket', de: 'In den Warenkorb' },
    quantity:    { hu: 'Mennyiség', en: 'Quantity', de: 'Menge' },
    viewBasket:  { hu: 'Kosár megtekintése', en: 'View basket', de: 'Warenkorb ansehen' },
    details:     { hu: 'Leírás', en: 'Description', de: 'Beschreibung' },
    features:    { hu: 'Jellemzők', en: 'Features', de: 'Merkmale' },
    specs:       { hu: 'Méretek és anyagok', en: 'Size and materials', de: 'Maße und Material' },
    materials:   { hu: 'Anyag', en: 'Materials', de: 'Material' },
    weight:      { hu: 'Tömeg', en: 'Weight', de: 'Gewicht' },
    care:        { hu: 'Ápolás', en: 'Care', de: 'Pflege' },
    gallery:     { hu: 'Termékképek', en: 'Product images', de: 'Produktbilder' },
    related:     { hu: 'Hasonló termékek', en: 'You may also like', de: 'Das könnte dir auch gefallen' },
    backToShop:  { hu: 'Vissza a boltba', en: 'Back to the shop', de: 'Zurück zum Shop' },
    width:       { hu: 'Szélesség', en: 'Width', de: 'Breite' },
    height:      { hu: 'Magasság', en: 'Height', de: 'Höhe' },
    depth:       { hu: 'Mélység', en: 'Depth', de: 'Tiefe' },
    diameter:    { hu: 'Átmérő', en: 'Diameter', de: 'Durchmesser' },
    length:      { hu: 'Hosszúság', en: 'Length', de: 'Länge' }
  };

  const AVAILABILITY = {
    in_stock:      { label: { hu: 'Raktáron', en: 'In stock', de: 'Auf Lager' }, schema: 'https://schema.org/InStock' },
    made_to_order: { label: { hu: 'Rendelésre készül', en: 'Made to order', de: 'Auf Bestellung' }, schema: 'https://schema.org/MadeToOrder' },
    out_of_stock:  { label: { hu: 'Jelenleg nem elérhető', en: 'Currently unavailable', de: 'Derzeit nicht verfügbar' }, schema: 'https://schema.org/OutOfStock' }
  };

  const DIMENSION_KEYS = ['width', 'height', 'depth', 'length', 'diameter'];

  // Pick the text for a language from a { hu, en, de } object; Hungarian is the fallback.
  function t(obj, lang) {
    if (obj == null) return '';
    if (typeof obj !== 'object' || Array.isArray(obj)) return obj;
    return obj[lang] ?? obj.hu ?? Object.values(obj)[0] ?? '';
  }

  function paragraphs(text) {
    return String(text || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  }

  function formatNumber(value, lang) {
    try {
      return new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(value);
    } catch (error) {
      return String(value);
    }
  }

  // [{ key, label, value }] for each dimension the product lists, e.g. Width 30 cm.
  function dimensionRows(dimensions, lang) {
    if (!dimensions) return [];
    const unit = dimensions.unit || 'cm';
    return DIMENSION_KEYS
      .filter((key) => Number.isFinite(dimensions[key]))
      .map((key) => ({ key, label: t(UI[key], lang), value: `${formatNumber(dimensions[key], lang)} ${unit}` }));
  }

  function weightText(weight, lang) {
    if (!weight || !Number.isFinite(weight.value)) return '';
    const unit = weight.unit || 'g';
    if (unit === 'g' && weight.value >= 1000) return `${formatNumber(weight.value / 1000, lang)} kg`;
    return `${formatNumber(weight.value, lang)} ${unit}`;
  }

  function availability(product) {
    return AVAILABILITY[product.availability] || AVAILABILITY.in_stock;
  }

  function formatPrice(amount, currency, lang) {
    const eur = currency === 'eur';
    try {
      return new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: eur ? 'EUR' : 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: eur ? 2 : 0
      }).format(amount);
    } catch (error) {
      return eur ? '€' + amount : amount + ' Ft';
    }
  }

  // The product page's file, relative to the site root. Cloudflare serves it at
  // /termek/<slug> (clean URL); the .html link also works in local previews.
  function slugOf(product) {
    return product.slug || product.id;
  }
  function pagePath(product) {
    return `termek/${slugOf(product)}.html`;
  }

  return { CATEGORY_LABELS, UI, AVAILABILITY, t, paragraphs, formatNumber, dimensionRows, weightText, availability, formatPrice, slugOf, pagePath };
});
