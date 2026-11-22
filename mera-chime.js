(() => {
  'use strict';
  // Grab_Key by Mediasaur (CC0), https://freesound.org/s/788053/
  const sound = new Audio();
  sound.preload = 'auto';
  sound.volume = 0.7;
  sound.src = new URL('assets/grab-key.mp3', document.currentScript.src).href;
  sound.load();

  function prepare() {
    if (sound.error) sound.load();
  }

  function play() {
    if (document.hidden) return;
    prepare();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) sound.pause();
  });
  window.MeraChime = Object.freeze({ prepare, play });
})();
