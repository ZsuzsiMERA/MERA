# MERA

Editable static homepage reconstructed from 01.pdf (three printed pages of one Wix homepage). Open this folder in VS Code, then open index.html with Live Server.

## Files
- index.html: Hungarian page content
- styles.css: responsive styling
- assets/: hero and four product thumbnails recovered from the PDF
- DEMOS/Videos/: scroll-scrub demo and MERA nursery video used in the homepage hero
- localization.js and localization.css: Hungarian, English and German language switching on both page concepts
- hero-scrub.js and hero-scrub.css: accessible, scroll-scrubbed homepage hero
- shop-basket.js and shop-section.css: localized product shop with a persistent editable basket

## Accessibility and languages
The homepage and cinematic concept can be switched between Hungarian, English and German. The chosen language is remembered in the browser and updates the document language, page title, descriptions and image alternatives. Both pages include a keyboard-accessible skip link and language selector. The homepage shop supports adding, removing and adjusting products in a browser-persisted basket; checkout and payment are intentionally disabled pending confirmed prices and order setup. The video hero respects reduced-motion preferences and shows the static nursery illustration instead of moving video.

The homepage uses the six-second MERA nursery animation (768p, with the Hailuo watermark) for scroll scrubbing: closed door, ornate key, and the Izabel nursery reveal.

## Migration status
This is a partial reconstruction, not a full Wix export. The PDF's visible copy and prices are preserved. The fourth product title was clipped in the PDF; “Organic Cotton Blanket” is an inferred completion and needs confirmation. Product thumbnails are only 147 × 147 pixels. The original font was not identified; Georgia is used as a local fallback. Header navigation is newly added for the local page. Missing imagery and printed blank space are not reproduced. Social links were omitted because their destinations are unknown.

No checkout, cart, member login, product detail pages or backend is implemented. Prices and product names may be Wix sample data and must be confirmed before publishing. No GitHub remote or deployment has been configured. Relative asset paths support static hosting, including GitHub Pages.

Still needed: remaining page references, full-resolution product images, real catalogue/prices, social URLs and the target GitHub repository. Review the completed site before publishing.
