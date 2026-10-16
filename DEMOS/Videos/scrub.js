/* Scroll-scrubbed video. For every <section class="scrub">, the reader's scroll
   position through the section sets the video's playhead: top of the section is
   the first frame, bottom is the last.

   Markup:
     <section class="scrub" style="--scrub-length: 300vh">
       <div class="scrub-stage">
         <video src="videos/clip.mp4" controls muted playsinline preload="auto"></video>
       </div>
     </section>

   The clip must be encoded all-intra (every frame a keyframe), or seeking
   backwards stutters — see "Scroll-scrubbed video" in the README. */
(function () {
  var sections = document.querySelectorAll('.scrub');
  if (!sections.length) { return; }

  function clamp(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

  sections.forEach(function (section) {
    var video = section.querySelector('video');
    if (!video) { return; }

    var target = 0;
    var frame = 0;

    /* How far through the section's scroll track the viewport is, 0 to 1. */
    function progress() {
      var rect = section.getBoundingClientRect();
      var track = rect.height - window.innerHeight;
      return track > 0 ? clamp(-rect.top / track) : 0;
    }

    /* One seek at a time. Setting currentTime while the previous seek is still
       decoding queues work the browser then throws away, which is what makes
       naive scrubbing judder; the `seeked` handler picks up the latest target. */
    function seek() {
      frame = 0;
      if (!video.duration || video.seeking) { return; }
      var t = target * video.duration;
      if (Math.abs(video.currentTime - t) > 0.01) { video.currentTime = t; }
    }

    function schedule() {
      target = progress();
      if (!frame) { frame = requestAnimationFrame(seek); }
    }

    function start() {
      video.pause();
      video.removeAttribute('controls');
      video.removeAttribute('autoplay');
      section.classList.add('is-scrubbing');
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      video.addEventListener('seeked', seek);
      schedule();
    }

    /* Pull the whole file into memory first. Seeking a blob never waits on a
       range request, so scrubbing stays smooth on a slow connection. If the fetch
       fails, scrub the network copy instead. */
    var src = video.currentSrc || video.getAttribute('src');
    fetch(src)
      .then(function (r) {
        if (!r.ok) { throw new Error(r.status); }
        return r.blob();
      })
      .then(function (blob) { video.src = URL.createObjectURL(blob); })
      .catch(function () {})
      .then(function () {
        if (video.readyState >= 1) { start(); }
        else { video.addEventListener('loadedmetadata', start, { once: true }); }
      });
  });
})();
