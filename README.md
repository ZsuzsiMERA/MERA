# MERA

Editable static homepage reconstructed from 01.pdf (three printed pages of one Wix homepage). Open this folder in VS Code, then open index.html with Live Server.

## Files
- mera-keys.js and mera-keys.css: five discreet golden keys on the homepage, localized discovery messages and an animated secret MERA panel
- index.html: Hungarian page content
- styles.css: responsive styling
- assets/: hero artwork, original catalogue thumbnails, and placeholder shop illustrations
- DEMOS/Videos/: scroll-scrub demo and MERA nursery video used in the homepage hero
- localization.js and localization.css: Hungarian, English and German language switching on both page concepts
- hero-scrub.js and hero-scrub.css: accessible, scroll-scrubbed homepage hero
- shop-basket.js and shop-section.css: localized product shop with a persistent editable basket

## Accessibility and languages

### Secret MERA keys

Five keys sit in the introduction, folklore, shop, story and footer sections. Each has a 44px minimum touch target and keyboard focus styling. The unobtrusive footer counter opens a hint before completion and reopens the secret panel at 5/5. The fifth discovery opens the supplied six-line Hungarian poem and a secret-word form. Correctly entering SZOFIA plays the key/lock animation and reveals the code for a surprise included with an order. Revisiting a completed collection does not automatically interrupt the page.

The form accepts case differences, surrounding spaces and accents (including Szófia), gives inline feedback for empty or incorrect answers, and supports Enter submission. Its success state is stored separately as `mera-secret-word-v1`; both progress and solution synchronize across tabs. The original poem is preserved in Hungarian, with English and German adaptations. The gift instructions ask the customer to mention SZOFIA when ordering. This is a client-side discovery feature, not a checkout integration or single-use redemption system: the current site has no live checkout. The future order system must handle fulfillment and any redemption restrictions; the local success flag is not proof of entitlement.

Progress uses the versioned `mera-secret-keys-v1` localStorage entry containing known key IDs. Duplicate/unknown IDs and malformed values are handled; other tabs synchronize through storage events. If storage is unavailable, progress works in memory and the panel explains that it cannot be saved. Clearing site storage resets progress. The puzzle is not access control for protected content. Edit the HU/EN/DE text in `copy` and `puzzleCopy` in mera-keys.js.

The native modal supports Escape, focus containment and focus restoration. Reduced-motion preferences disable all key animations. The lock opens only after the correct word. With JavaScript unavailable, the original page remains usable without the embellishments.

Collected keys now open at 300px height, with a separate inspection dialog showing the complete key and a close-up of the relevant ornament. The 5/5 puzzle includes all five keys in order, each tappable for inspection. Escape and the back button return focus to the originating key, and collected keys remain inspectable after solving the puzzle. The closed/open lock is photorealistic transparent artwork in `assets/keys/lock-closed.png` and `lock-open.png`, replacing the CSS outline lock. The gallery and form use two columns on desktop and a scrolling single column on mobile.

Browser regression test: with Playwright and Chromium installed, run `node tests/mera-keys.cjs`. Optionally set `MERA_BROWSER_CHANNEL=msedge` to use installed Edge, and `MERA_SCREENSHOT_DIR` to retain screenshots in a chosen directory. The test serves the site locally and checks discovery, duplicate clicks, reload persistence, unlock/reopen, languages, keyboard focus, cross-tab updates, malformed/blocked storage and mobile/reduced-motion behavior.

The homepage and cinematic concept can be switched between Hungarian, English and German. The chosen language is remembered in the browser and updates the document language, page title, descriptions and image alternatives. Both pages include a keyboard-accessible skip link and language selector. The homepage shop supports adding, removing and adjusting products in a browser-persisted basket; checkout and payment are intentionally disabled pending confirmed prices and order setup. The video hero respects reduced-motion preferences and shows the static nursery illustration instead of moving video.

The homepage uses the six-second MERA nursery animation (768p, with the Hailuo watermark) for scroll scrubbing: closed door, ornate key, and the Izabel nursery reveal.

## Migration status
This is a partial reconstruction, not a full Wix export. The current shop shows a sample name plaque, linen cushion and ceramic vase; names, descriptions and prices must be replaced with MERA's confirmed catalogue before publishing. The contact email is hello@merahome.hu. The original font was not identified; Georgia is used as a local fallback. Header navigation is newly added for the local page. Missing imagery and printed blank space are not reproduced. Social links were omitted because their destinations are unknown.

No checkout, payment, member login, product detail pages or backend is implemented. The repository is [zsuzsimera/MERA](https://github.com/zsuzsimera/MERA), and the existing GitHub Pages site is [zsuzsimera.github.io/MERA](https://zsuzsimera.github.io/MERA/). Local changes appear on the live site after they are published to the repository and the Pages deployment completes. Relative asset paths support the GitHub Pages project URL.

Still needed: remaining page references, full-resolution product images, real catalogue/prices and social URLs. Review the completed site before publishing.
