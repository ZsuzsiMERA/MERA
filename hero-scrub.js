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
    if (Math.abs(video.currentTime - time) > 0.01) {
      // fastSeek scrubs more smoothly in Safari; with an all-intra clip every
      // frame is a keyframe, so it still lands on the exact frame.
      if (typeof video.fastSeek === 'function') video.fastSeek(time);
      else video.currentTime = time;
    }
  }

  let primed = false;
  function prime() {
    if (primed || reducedMotion.matches) return;
    primed = true;
    // Safari won't render seeked frames on a paused video until it has played
    // once. A muted video can start without a user gesture, so play then pause
    // immediately to prime the decoder for scrubbing.
    const played = video.play();
    if (played && typeof played.then === 'function') {
      played.then(() => video.pause()).catch(() => {});
    } else {
      try { video.pause(); } catch (e) {}
    }
  }

  function schedule() {
    target = getProgress();
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(seek);
  }

  function loadVideo() {
    if (loading || reducedMotion.matches) return;
    loading = true;
    // Assign the file directly so the browser seeks it via HTTP range requests.
    // Safari cannot seek blob/object-URL videos, so a direct src is required for
    // scrubbing there; the host (Cloudflare Pages) serves range requests.
    video.src = video.dataset.src;
    video.preload = 'auto';
    try { video.load(); } catch (error) { /* older browsers */ }
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

  video.addEventListener('loadedmetadata', () => { prime(); schedule(); });
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
