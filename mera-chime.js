(() => {
  'use strict';
  let context;
  let activeVoice;
  let bufferPromise;
  let pending = false;
  let requestId = 0;
  const audioUrl = new URL('assets/mera-original-sparkle.mp3', document.currentScript.src);
  const labels = {
    hu: { preview: 'Csilingelés kipróbálása', source: 'Hangforrás' },
    en: { preview: 'Preview chime', source: 'Sound credit' },
    de: { preview: 'Klang anhören', source: 'Klangquelle' }
  };
  const controls = [];
  function renderControls() {
    const text = labels[document.documentElement.lang] || labels.hu;
    controls.forEach(preview => { preview.textContent = text.preview; });
    const credit = document.querySelector('.mera-chime-source');
    if (credit) credit.textContent = text.source;
  }
  function silence() {
    requestId++;
    pending = false;
    if (!context || !activeVoice) return;
    const voice = activeVoice;
    activeVoice = null;
    const now = context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0, now, 0.015);
    voice.source.stop(now + 0.08);
  }
  function loadBuffer() {
    if (!bufferPromise) {
      bufferPromise = fetch(audioUrl).then(response => {
        if (!response.ok) throw new Error('Chime could not be loaded');
        return response.arrayBuffer();
      }).then(data => context.decodeAudioData(data)).catch(error => {
        bufferPromise = null;
        throw error;
      });
    }
    return bufferPromise;
  }
  async function play() {
    if (document.hidden || pending || activeVoice) return;
    const id = ++requestId;
    pending = true;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      context ||= new AudioContext();
      // Called only from an explicit click/keyboard activation, never on page load.
      const resumed = context.state === 'suspended' ? context.resume() : Promise.resolve();
      const [buffer] = await Promise.all([loadBuffer(), resumed]);
      if (id !== requestId || document.hidden || context.state !== 'running') return;
      const source = context.createBufferSource();
      const gain = context.createGain();
      const voice = { source, gain };
      source.buffer = buffer;
      source.playbackRate.value = 1;
      gain.gain.value = 0.35;
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (activeVoice === voice) activeVoice = null;
      };
      activeVoice = voice;
      source.start();
    } catch {
      // Audio support or device failure must never interrupt the key game.
    } finally {
      if (id === requestId) pending = false;
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
