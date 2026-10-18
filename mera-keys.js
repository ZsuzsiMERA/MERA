(() => {
  'use strict';
  const storageKey = 'mera-secret-keys-v1';
  const solvedKey = 'mera-secret-word-v1';
  // This puzzle reveals an order gift code; redemption belongs to the shop/order workflow.
  const locations = ['.intro', '.folklore', '.shop-section', '.about', 'footer'];
  const ids = ['beginnings', 'tradition', 'details', 'story', 'home'];
  const copy = {
    hu: {
      key: 'Rejtett antik kulcs', found: 'Megtalált antik kulcs', progress: 'Megtalált kulcsok', close: 'Bezárás',
      hint: 'Öt apró részlet. Egy titkos MERA-történet.', title: 'Egy apró titokra leltél', secret: 'A titkos MERA',
      intro: 'A legszebb kezdetekhez', text: 'Vannak kincsek, amelyek csak akkor mutatkoznak meg, ha időt szánunk a részletekre. Ez a csendes kis zug most neked nyílt meg.',
      note: 'Egy kívánság az otthonodnak', wish: 'Legyen benne hely az első meséknek, a nagy öleléseknek és mindannak, amit egyszer majd jó lesz felidézni.',
      messages: ['Minden szép történet egy apró kezdettel indul.', 'A hagyomány emléket őriz. Te új történetet adsz hozzá.', 'A szeretet a legapróbb részletekben is ott van.', 'Egy otthon attól különleges, hogy a ti történetetek lakik benne.', 'A legszebb kincsekből idővel emlék lesz.'],
      unsaved: 'A böngésző most nem engedi a mentést; az előrehaladás csak ezen az oldalon marad meg.'
    },
    en: {
      key: 'Hidden antique key', found: 'Antique key found', progress: 'Keys found', close: 'Close',
      hint: 'Five little details. One secret MERA story.', title: 'You found a little secret', secret: 'Secret MERA',
      intro: 'For the most beautiful beginnings', text: 'Some treasures only reveal themselves when we take time to notice the details. This quiet little corner has now opened for you.',
      note: 'A wish for your home', wish: 'May it hold first stories, warm embraces and everything you will one day love to remember.',
      messages: ['Every beautiful story starts with a small beginning.', 'Tradition holds a memory. You give it a new story.', 'Love lives in the smallest details.', 'Your story is what makes a home special.', 'The most beautiful treasures become memories.'],
      unsaved: 'Your browser cannot save progress right now; it will last only on this page.'
    },
    de: {
      key: 'Versteckter antiker Schlüssel', found: 'Antiker Schlüssel gefunden', progress: 'Gefundene Schlüssel', close: 'Schließen',
      hint: 'Fünf kleine Details. Eine geheime MERA-Geschichte.', title: 'Du hast ein kleines Geheimnis entdeckt', secret: 'Das geheime MERA',
      intro: 'Für die schönsten Anfänge', text: 'Manche Schätze zeigen sich erst, wenn wir uns Zeit für die Details nehmen. Dieser stille kleine Ort hat sich nun für dich geöffnet.',
      note: 'Ein Wunsch für dein Zuhause', wish: 'Möge es Raum bieten für erste Geschichten, innige Umarmungen und alles, woran du dich einmal gerne erinnern wirst.',
      messages: ['Jede schöne Geschichte hat einen kleinen Anfang.', 'Tradition bewahrt Erinnerungen. Du schenkst ihr eine neue Geschichte.', 'Liebe steckt in den kleinsten Details.', 'Eure Geschichte macht ein Zuhause besonders.', 'Die schönsten Schätze werden zu Erinnerungen.'],
      unsaved: 'Dein Browser kann den Fortschritt gerade nicht speichern; er bleibt nur auf dieser Seite erhalten.'
    }
  };
  const puzzleCopy = {
    hu: {
      poem: 'Öt kulcs rejtőzött titkok nyomán,\ns most mind előkerült az út során.\nDe a zár még őriz egy utolsó titkot:\negy nevet, mely egyszer mindent elindított.\nÍrd be a titkos szót, ha sejted már,\ns a kulcsok mögött egy ajándék vár.',
      label: 'Titkos szó / kuponkód', submit: 'Kinyitom a zárat',
      help: 'A kulcsok részletei rejtik a megfejtést.',
      empty: 'Írd be a titkos szót.', wrong: 'Ez a szó még nem nyitja a zárat. Nézd meg újra a kulcsok apró részleteit!',
      success: 'Egy meglepetés vár rád', unlocked: 'Megfejtetted a titkot! Ezzel a kóddal egy meglepetés jár a rendelésed mellé.',
      codeLabel: 'A te ajándékkódod', claim: 'Rendeléskor add meg a SZOFIA kódot, hogy a meglepetést is a csomagodba készíthessük.'
    },
    en: {
      poem: 'Five keys lay hidden along the way,\nand now you have found them all today.\nYet the lock still holds one secret inside:\na name where the very first spark resides.\nEnter the secret word, if you know,\nand a gift behind the keys will show.',
      label: 'Secret word / coupon code', submit: 'Unlock', help: 'The details of the keys hold the answer.',
      empty: 'Enter the secret word.', wrong: 'This word does not open the lock yet. Look closely at the details of the keys!',
      success: 'A surprise awaits you', unlocked: 'You solved the secret! This code adds a surprise to your order.',
      codeLabel: 'Your gift code', claim: 'Mention the code SZOFIA when placing your order so we can include your surprise in the parcel.'
    },
    de: {
      poem: 'Fünf Schlüssel lagen im Verborgenen bereit,\nnun hast du sie gefunden mit Ruhe und Zeit.\nDoch das Schloss bewahrt noch ein Geheimnis allein:\nein Name, mit dem alles begann zu sein.\nTrag das geheime Wort ein, wenn du es weißt,\ndann wartet ein Geschenk, das dich willkommen heißt.',
      label: 'Geheimes Wort / Gutscheincode', submit: 'Schloss öffnen', help: 'Die Details der Schlüssel verraten die Lösung.',
      empty: 'Trag das geheime Wort ein.', wrong: 'Dieses Wort öffnet das Schloss noch nicht. Schau dir die Details der Schlüssel noch einmal an!',
      success: 'Eine Überraschung wartet auf dich', unlocked: 'Du hast das Geheimnis gelöst! Mit diesem Code erhältst du eine Überraschung zu deiner Bestellung.',
      codeLabel: 'Dein Geschenkcode', claim: 'Gib bei deiner Bestellung den Code SZOFIA an, damit wir deine Überraschung ins Paket legen können.'
    }
  };
  const puzzleWords = () => puzzleCopy[document.documentElement.lang] || puzzleCopy.hu;
  const inspectionCopy = {
    hu: { inspect: 'Részletek nagyítása', collection: 'A megtalált kulcsaid', hint: 'Koppints egy kulcsra, és nézd meg közelről a részleteit.', detail: 'A kulcs titka közelről', whole: 'A teljes kulcs', ornament: 'Nagyított részlet', back: 'Vissza a kulcsokhoz' },
    en: { inspect: 'Inspect the details', collection: 'Your discovered keys', hint: 'Tap a key to take a closer look at its details.', detail: 'A closer look at the key', whole: 'The complete key', ornament: 'Enlarged detail', back: 'Back to the keys' },
    de: { inspect: 'Details vergrößern', collection: 'Deine gefundenen Schlüssel', hint: 'Tippe auf einen Schlüssel, um seine Details genauer anzusehen.', detail: 'Der Schlüssel aus der Nähe', whole: 'Der ganze Schlüssel', ornament: 'Vergrößertes Detail', back: 'Zurück zu den Schlüsseln' }
  };
  const inspectionWords = () => inspectionCopy[document.documentElement.lang] || inspectionCopy.hu;
  const words = () => copy[document.documentElement.lang] || copy.hu;
  // Hidden initials belong to the artwork; stable IDs preserve existing progress.
  const keyAssets = ['sofia-sz', 'sofia-o', 'sofia-f', 'sofia-i', 'sofia-a'];
  const keyArts = keyAssets.map(asset => '<img class="mera-key-art" src="assets/keys/' + asset + '.png" alt="" aria-hidden="true" width="1024" height="1536" decoding="async">');
  const keyArt = keyArts[0];
  // Focal points locate the actual engraved/cut-out ornament, without adding letters over the artwork.
  const keyDetails = [
    { x: '50%', y: '22%', zoom: 1.5 },
    { x: '65%', y: '82%', zoom: 2.8 },
    { x: '64%', y: '82%', zoom: 2.5 },
    { x: '50%', y: '63%', zoom: 4 },
    { x: '50%', y: '32%', zoom: 2.8 }
  ];
  let storageAvailable = true;
  const parse = value => {
    try { const data = JSON.parse(value); return new Set(Array.isArray(data) ? data.filter(id => ids.includes(id)) : []); }
    catch { return new Set(); }
  };
  let found;
  try { found = parse(localStorage.getItem(storageKey)); } catch { found = new Set(); storageAvailable = false; }
  let solved = false;
  try { solved = localStorage.getItem(solvedKey) === 'solved'; } catch { storageAvailable = false; }
  const buttons = [];
  const progress = document.createElement('button');
  progress.type = 'button';
  progress.className = 'mera-key-progress';
  document.querySelector('footer').append(progress);
  const status = document.createElement('p');
  status.className = 'mera-key-sr';
  status.setAttribute('role', 'status');
  document.body.append(status);
  const dialog = document.createElement('dialog');
  dialog.className = 'mera-key-dialog';
  dialog.setAttribute('aria-labelledby', 'mera-secret-title');
  dialog.innerHTML = '<button type="button" class="mera-key-close"></button><div class="mera-key-emblem">' + keyArt + '</div><p class="mera-key-kicker"></p><h2 id="mera-secret-title"></h2><p class="mera-key-message"></p><div class="mera-secret-content" hidden><p class="mera-secret-poem"></p><form class="mera-secret-form" novalidate><label for="mera-secret-word"></label><p id="mera-secret-help"></p><div class="mera-secret-fields"><input id="mera-secret-word" name="secret-word" type="text" maxlength="64" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="mera-secret-help mera-secret-error" required><button type="submit"></button></div><p id="mera-secret-error" role="alert" aria-atomic="true"></p></form><section class="mera-gift" aria-labelledby="mera-gift-title" hidden><h3 id="mera-gift-title" tabindex="-1"></h3><p class="mera-gift-message"></p><p class="mera-gift-code-label"></p><p class="mera-gift-code"></p><p class="mera-gift-claim"></p></section></div><p class="mera-key-storage"></p>';
  document.body.append(dialog);
  const emblem = dialog.querySelector('.mera-key-emblem');
  emblem.innerHTML = '<button type="button" class="mera-key-inspect">' + keyArt + '<span></span></button><div class="mera-real-lock" aria-hidden="true"><img class="mera-lock-closed" src="assets/keys/lock-closed.png" alt="" width="1024" height="1024"><img class="mera-lock-open" src="assets/keys/lock-open.png" alt="" width="1024" height="1024"></div>';
  const collection = document.createElement('section');
  collection.className = 'mera-key-collection';
  collection.setAttribute('aria-labelledby', 'mera-collection-title');
  collection.innerHTML = '<h3 id="mera-collection-title"></h3><p class="mera-collection-hint"></p><div class="mera-key-gallery">' + keyArts.map((art, index) => '<button type="button" data-inspect-key="' + index + '">' + art + '<span>' + (index + 1) + '</span></button>').join('') + '</div>';
  dialog.querySelector('.mera-secret-content').prepend(collection);
  const detailDialog = document.createElement('dialog');
  detailDialog.className = 'mera-detail-dialog';
  detailDialog.setAttribute('aria-labelledby', 'mera-detail-title');
  detailDialog.innerHTML = '<button type="button" class="mera-detail-close"></button><h2 id="mera-detail-title"></h2><div class="mera-detail-layout"><figure class="mera-whole-key">' + keyArt + '<figcaption></figcaption></figure><figure class="mera-detail-figure"><div class="mera-detail-stage">' + keyArt + '</div><figcaption></figcaption></figure></div>';
  document.body.append(detailDialog);
  let detailReturnFocus;
  function renderInspection() {
    const t = inspectionWords();
    emblem.querySelector('.mera-key-inspect span').textContent = t.inspect;
    emblem.querySelector('.mera-key-inspect').setAttribute('aria-label', t.inspect);
    collection.querySelector('h3').textContent = t.collection;
    collection.querySelector('.mera-collection-hint').textContent = t.hint;
    collection.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-label', `${t.inspect} · ${index + 1}/5`));
    detailDialog.querySelector('h2').textContent = t.detail;
    detailDialog.querySelector('.mera-detail-close').textContent = t.back;
    detailDialog.querySelector('.mera-whole-key figcaption').textContent = t.whole;
    detailDialog.querySelector('.mera-detail-figure figcaption').textContent = t.ornament;
  }
  function inspectKey(index, trigger) {
    if (!found.has(ids[index])) return;
    detailReturnFocus = trigger;
    const focal = keyDetails[index];
    detailDialog.querySelectorAll('.mera-key-art').forEach(img => { img.src = 'assets/keys/' + keyAssets[index] + '.png'; });
    const stage = detailDialog.querySelector('.mera-detail-stage');
    stage.style.setProperty('--focus-x', focal.x);
    stage.style.setProperty('--focus-y', focal.y);
    stage.style.setProperty('--zoom', focal.zoom);
    renderInspection();
    detailDialog.showModal();
    detailDialog.querySelector('.mera-detail-close').focus();
  }
  emblem.querySelector('.mera-key-inspect').addEventListener('click', event => inspectKey(activeIndex ?? 0, event.currentTarget));
  collection.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => inspectKey(index, button)));
  detailDialog.querySelector('.mera-detail-close').addEventListener('click', () => detailDialog.close());
  detailDialog.addEventListener('close', () => detailReturnFocus?.focus({ preventScroll: true }));
  let activeIndex = null;
  let secretOpen = false;
  let returnFocus;
  let puzzleError = '';
  const form = dialog.querySelector('.mera-secret-form');
  const input = dialog.querySelector('#mera-secret-word');
  function renderPuzzle() {
    const t = puzzleWords();
    const unlocked = secretOpen && solved;
    collection.hidden = unlocked;
    dialog.classList.toggle('is-solved', unlocked);
    dialog.querySelector('.mera-secret-poem').textContent = t.poem;
    dialog.querySelector('.mera-secret-poem').hidden = unlocked;
    form.hidden = unlocked;
    form.querySelector('label').textContent = t.label;
    form.querySelector('button').textContent = t.submit;
    dialog.querySelector('#mera-secret-help').textContent = t.help;
    dialog.querySelector('#mera-secret-error').textContent = puzzleError ? t[puzzleError] : '';
    input.setAttribute('aria-invalid', String(Boolean(puzzleError)));
    dialog.querySelector('.mera-gift').hidden = !unlocked;
    dialog.querySelector('#mera-gift-title').textContent = t.success;
    dialog.querySelector('.mera-gift-message').textContent = t.unlocked;
    dialog.querySelector('.mera-gift-code-label').textContent = t.codeLabel;
    dialog.querySelector('.mera-gift-code').textContent = unlocked ? 'SZOFIA' : '';
    dialog.querySelector('.mera-gift-claim').textContent = t.claim;
  }
  function renderDialog() {
    const t = words();
    dialog.querySelector('.mera-key-emblem .mera-key-art').outerHTML = keyArts[activeIndex ?? 0];
    dialog.querySelector('.mera-key-close').textContent = t.close;
    dialog.querySelector('.mera-key-kicker').textContent = t.intro;
    dialog.querySelector('h2').textContent = secretOpen ? t.secret : t.title;
    dialog.querySelector('.mera-key-message').textContent = activeIndex === null ? t.hint : t.messages[activeIndex];
    dialog.querySelector('.mera-key-message').hidden = secretOpen;
    dialog.querySelector('.mera-secret-content').hidden = !secretOpen;
    renderInspection();
    emblem.querySelector('.mera-key-inspect').disabled = !found.has(ids[activeIndex ?? 0]);
    renderPuzzle();
    dialog.querySelector('.mera-key-storage').textContent = storageAvailable ? '' : t.unsaved;
  }
  function render() {
    const t = words();
    buttons.forEach((button, index) => {
      const collected = found.has(ids[index]);
      button.classList.toggle('is-found', collected);
      button.setAttribute('aria-label', `${collected ? t.found : t.key} · ${index + 1}/5`);
      button.setAttribute('aria-pressed', String(collected));
    });
    progress.innerHTML = keyArt + `<span>${found.size}/5</span>`;
    progress.setAttribute('aria-label', `${t.progress}: ${found.size}/5. ${found.size === 5 ? t.secret : t.hint}`);
    renderDialog();
  }
  function open(index, secret, animate) {
    activeIndex = index;
    secretOpen = secret;
    puzzleError = '';
    renderDialog();
    dialog.classList.toggle('is-secret', secret);
    dialog.classList.remove('is-unlocking');
    dialog.classList.toggle('is-discovering', animate);
    if (!dialog.open) {
      returnFocus = document.activeElement;
      dialog.showModal();
      dialog.querySelector('.mera-key-close').focus();
    }
  }
  // Decorative light stays inside the modal so its backdrop cannot hide it.
  const sparkles = document.createElement('span');
  sparkles.className = 'mera-discovery-sparkles';
  sparkles.setAttribute('aria-hidden', 'true');
  sparkles.innerHTML = '<i></i><i></i><i></i>';
  emblem.append(sparkles);
  function celebrateDiscovery() {
    dialog.classList.remove('is-key-discovery');
    void emblem.offsetWidth;
    dialog.classList.add('is-key-discovery');
  }
  sparkles.addEventListener('animationend', event => {
    if (event.animationName === 'mera-discovery-finish') dialog.classList.remove('is-key-discovery');
  });
  dialog.addEventListener('close', () => dialog.classList.remove('is-key-discovery'));
  locations.forEach((selector, index) => {
    const section = document.querySelector(selector);
    if (!section) return;
    section.classList.add('mera-key-location');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `mera-hidden-key mera-hidden-key-${index + 1}`;
    button.innerHTML = keyArts[index];
    button.addEventListener('click', () => {
      const isNew = !found.has(ids[index]);
      found.add(ids[index]);
      try { localStorage.setItem(storageKey, JSON.stringify([...found])); } catch { storageAvailable = false; }
      if (isNew) {
        button.classList.remove('is-glinting');
        void button.offsetWidth;
        button.classList.add('is-glinting');
      }
      render();
      status.textContent = `${words().messages[index]} ${words().progress}: ${found.size}/5`;
      open(index, found.size === 5 && !solved, isNew && found.size === 5);
      if (isNew) { celebrateDiscovery(); window.MeraChime?.play(); }
    });
    button.addEventListener('animationend', () => button.classList.remove('is-glinting'));
    buttons.push(button);
    section.append(button);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (found.size !== 5 || !secretOpen || solved) return;
    const answer = input.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
    if (answer !== 'SZOFIA') {
      puzzleError = answer ? 'wrong' : 'empty';
      renderPuzzle();
      input.focus();
      return;
    }
    solved = true;
    puzzleError = '';
    input.value = '';
    try { localStorage.setItem(solvedKey, 'solved'); } catch { storageAvailable = false; }
    renderDialog();
    dialog.classList.remove('is-discovering');
    dialog.classList.add('is-unlocking');
    dialog.scrollTop = 0;
    dialog.querySelector('#mera-gift-title').focus({ preventScroll: true });
  });
  input.addEventListener('input', () => {
    if (puzzleError) { puzzleError = ''; renderPuzzle(); }
  });
  progress.addEventListener('click', () => open(null, found.size === 5, false));
  dialog.querySelector('.mera-key-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { dialog.classList.remove('is-unlocking', 'is-discovering'); returnFocus?.focus({ preventScroll: true }); });
  document.addEventListener('mera:languagechange', render);
  window.addEventListener('storage', event => {
    if (![storageKey, solvedKey, null].includes(event.key)) return;
    if (event.key === storageKey || event.key === null) found = parse(event.newValue);
    if (event.key === solvedKey || event.key === null) solved = event.newValue === 'solved';
    if (dialog.open) { secretOpen = found.size === 5; dialog.classList.toggle('is-secret', secretOpen); dialog.classList.remove('is-unlocking', 'is-discovering'); }
    render();
  });
  render();
})();
