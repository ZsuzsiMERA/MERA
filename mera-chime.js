(() => {
  'use strict';
  const preferenceKey = 'mera-chime-enabled-v1';
  let enabled = true;
  try { enabled = localStorage.getItem(preferenceKey) !== 'false'; } catch {}
  let context;
  let activeVoice;
  let lastPlayed = -Infinity;
  const labels = {
    hu: { on: 'Csilingelés: be', off: 'Csilingelés: ki', preview: 'Csilingelés kipróbálása' },
    en: { on: 'Chime: on', off: 'Chime: off', preview: 'Preview chime' },
    de: { on: 'Klang: an', off: 'Klang: aus', preview: 'Klang anhören' }
  };
  const controls = [];
  function renderControls() {
    const text = labels[document.documentElement.lang] || labels.hu;
    controls.forEach(({ toggle, preview }) => {
      toggle.textContent = enabled ? text.on : text.off;
      toggle.setAttribute('aria-pressed', String(enabled));
      if (preview) {
        preview.textContent = text.preview;
        preview.disabled = !enabled;
      }
    });
  }
  function silence() {
    if (!context || !activeVoice) return;
    const now = context.currentTime;
    activeVoice.gain.cancelScheduledValues(now);
    activeVoice.gain.setTargetAtTime(0, now, 0.015);
  }
  async function play() {
    if (!enabled || performance.now() - lastPlayed < 1800) return;
    lastPlayed = performance.now();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      context ||= new AudioContext();
      // Called only from an explicit click/keyboard activation, never on page load.
      if (context.state === 'suspended') await context.resume();
      if (!enabled || context.state !== 'running') return;
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
  function addControls(parent, withPreview) {
    if (!parent) return;
    const group = document.createElement('div');
    group.className = 'mera-chime-controls';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mera-chime-toggle';
    toggle.addEventListener('click', () => {
      enabled = !enabled;
      if (!enabled) silence();
      try { localStorage.setItem(preferenceKey, String(enabled)); } catch {}
      renderControls();
    });
    group.append(toggle);
    let preview;
    if (withPreview) {
      preview = document.createElement('button');
      preview.type = 'button';
      preview.className = 'mera-chime-preview';
      preview.addEventListener('click', play);
      group.append(preview);
    }
    controls.push({ toggle, preview });
    parent.append(group);
  }
  document.addEventListener('DOMContentLoaded', () => {
    addControls(document.querySelector('footer'), false);
    addControls(document.querySelector('.mera-key-dialog'), true);
    renderControls();
  });
  document.addEventListener('mera:languagechange', renderControls);
  document.addEventListener('visibilitychange', () => { if (document.hidden) silence(); });
  window.addEventListener('storage', event => {
    if (event.key === preferenceKey || event.key === null) {
      enabled = event.newValue !== 'false';
      if (!enabled) silence();
      renderControls();
    }
  });
})();
