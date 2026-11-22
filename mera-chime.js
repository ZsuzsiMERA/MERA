(() => {
  'use strict';
  let context;
  let generation = 0;
  const voices = new Set();

  function prepare() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio || document.hidden) return;
      context ||= new Audio({ latencyHint: 'interactive' });
      if (context.state !== 'running') return context.resume().catch(() => {});
    } catch {
      // Sound is optional when the device has no audio output.
    }
  }

  function strike(frequency, start, volume) {
    // The high partials decay faster than the body of the bell.
    for (const [ratio, level, decay] of [[1, 1, 0.95], [2.01, 0.24, 0.49], [2.73, 0.13, 0.28], [4.08, 0.04, 0.16]]) {
      const tone = context.createOscillator();
      const envelope = context.createGain();
      tone.frequency.value = frequency * ratio;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(volume * level, start + 0.007);
      envelope.gain.exponentialRampToValueAtTime(0.00001, start + decay);
      tone.connect(envelope);
      envelope.connect(context.destination);
      voices.add(tone);
      tone.onended = () => {
        voices.delete(tone);
        tone.disconnect();
        envelope.disconnect();
      };
      tone.start(start);
      tone.stop(start + decay + 0.01);
    }
  }

  async function play() {
    const id = ++generation;
    await prepare();
    if (id !== generation || document.hidden || context?.state !== 'running') return;
    const start = context.currentTime;
    strike(1046.5, start, 0.14);
    strike(1568, start + 0.09, 0.075);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    generation++;
    for (const tone of voices) tone.stop();
  });
  window.MeraChime = Object.freeze({ prepare, play });
})();
