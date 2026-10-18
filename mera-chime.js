(() => {
  'use strict';
  let context;
  let activeVoice;
  let lastPlayed = -Infinity;
  const labels = {
    hu: { preview: 'Csilingelés kipróbálása' },
    en: { preview: 'Preview chime' },
    de: { preview: 'Klang anhören' }
  };
  const controls = [];
  function renderControls() {
    const text = labels[document.documentElement.lang] || labels.hu;
    controls.forEach(preview => { preview.textContent = text.preview; });
  }
  function silence() {
    if (!context || !activeVoice) return;
    const now = context.currentTime;
    activeVoice.gain.cancelScheduledValues(now);
    activeVoice.gain.setTargetAtTime(0, now, 0.015);
  }
  async function play() {
    if (performance.now() - lastPlayed < 1800) return;
    lastPlayed = performance.now();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      context ||= new AudioContext();
      // Called only from an explicit click/keyboard activation, never on page load.
      if (context.state === 'suspended') await context.resume();
      if (document.hidden || context.state !== 'running') return;
      silence();
      const voice = context.createGain();
      activeVoice = voice;
      voice.gain.value = 0.22;
      voice.connect(context.destination);
      const start = context.currentTime + 0.015;
      // A soft rising bell motif; quiet overtones add a glass-like shimmer.
      [1174.66, 1567.98, 1760, 2349.32].forEach((frequency, index) => {
        const at = start + index * 0.105;
        [1, 2.76].forEach((ratio, partial) => {
          const oscillator = context.createOscillator();
          const envelope = context.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency * ratio;
          const peak = (partial ? 0.025 : 0.14) * (1 - index * 0.1);
          envelope.gain.setValueAtTime(0, at);
          envelope.gain.linearRampToValueAtTime(peak, at + 0.009);
          envelope.gain.exponentialRampToValueAtTime(0.0001, at + (partial ? 0.48 : 1.15));
          oscillator.connect(envelope);
          envelope.connect(voice);
          oscillator.start(at);
          oscillator.stop(at + 1.2);
          oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
        });
      });
      setTimeout(() => { voice.disconnect(); if (activeVoice === voice) activeVoice = null; }, 1800);
    } catch {
      // Audio support or device failure must never interrupt the key game.
    }
  }
  window.MeraChime = Object.freeze({ play });
  function addControls(parent) {
    if (!parent) return;
    const group = document.createElement('div');
    group.className = 'mera-chime-controls';
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.className = 'mera-chime-preview';
    preview.addEventListener('click', play);
    group.append(preview);
    controls.push(preview);
    parent.append(group);
  }
  document.addEventListener('DOMContentLoaded', () => {
    addControls(document.querySelector('.mera-key-dialog'));
    renderControls();
  });
  document.addEventListener('mera:languagechange', renderControls);
  document.addEventListener('visibilitychange', () => { if (document.hidden) silence(); });
})();
