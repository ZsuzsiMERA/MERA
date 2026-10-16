const section = document.querySelector('.hero-scroll');
const video = section?.querySelector('.hero-video');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (section && video) {
  let target = 0;
  let frame = 0;
  let loading = false;

  function getProgress() {
    const rect = section.getBoundingClientRect();
    const track = section.offsetHeight - window.innerHeight;
    return track > 0 ? Math.max(0, Math.min(1, -rect.top / track)) : 0;
  }

  function seek() {
    frame = 0;
    if (reducedMotion.matches || !video.duration || video.seeking) return;
    const time = target * video.duration;
    if (Math.abs(video.currentTime - time) > 0.01) video.currentTime = time;
  }

  function schedule() {
    target = getProgress();
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(seek);
  }

  async function loadVideo() {
    if (loading || reducedMotion.matches) return;
    loading = true;
    const source = video.dataset.src;
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
      video.src = URL.createObjectURL(await response.blob());
    } catch (error) {
      console.error('Unable to buffer the hero video; loading it directly instead.', error);
      video.src = source;
    }
  }

  function updateMotionPreference() {
    video.pause();
    if (reducedMotion.matches) {
      target = 0;
      if (video.readyState >= 1) video.currentTime = 0;
    } else {
      loadVideo();
      schedule();
    }
  }

  video.addEventListener('loadedmetadata', schedule);
  video.addEventListener('seeked', schedule);
  video.addEventListener('error', () => {
    console.error('The hero video could not be played.');
    video.setAttribute('hidden', '');
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', updateMotionPreference);
  loadVideo();
}
