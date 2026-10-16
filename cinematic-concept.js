const story = document.querySelector('.story');
const chapters = [...document.querySelectorAll('.chapter')];
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let pending = false;
function render() {
  pending = false;
  const motion = !preference.matches;
  document.documentElement.classList.toggle('motion', motion);
  const distance = story.offsetHeight - document.querySelector('.stage').offsetHeight;
  const progress = motion ? Math.max(0, Math.min(1, -story.getBoundingClientRect().top / Math.max(1, distance))) : 0;
  document.documentElement.style.setProperty('--progress', progress.toFixed(4));
  const position = progress * chapters.length;
  const current = Math.min(chapters.length - 1, Math.floor(position));
  chapters.forEach((chapter, index) => {
    const visible = !motion || index === current;
    chapter.classList.toggle('active', visible);
    chapter.inert = !visible;
    chapter.setAttribute('aria-hidden', String(!visible));
    const phase = position - current;
    const opacity = index === chapters.length - 1 ? Math.min(1, phase * 8 + .2) : Math.min(1, phase * 8 + .2, (1 - phase) * 8);
    chapter.style.setProperty('--chapter-opacity', opacity);
  });
}
function schedule() { if (!pending) { pending = true; requestAnimationFrame(render); } }
addEventListener('scroll', schedule, {passive:true});
addEventListener('resize', schedule);
preference.addEventListener('change', schedule);
render();
