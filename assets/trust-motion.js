const trustButtons = document.querySelectorAll('.trust-motion');
const pendingTrustAnimations = new Map();
function playTrustIcon(button) {
  clearTimeout(pendingTrustAnimations.get(button));
  pendingTrustAnimations.delete(button);
  button.classList.remove('run');
  void button.offsetWidth;
  button.classList.add('run');
}
for (const button of trustButtons) {
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') playTrustIcon(button);
  });
  button.addEventListener('click', () => playTrustIcon(button));
}
if (trustButtons.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    trustButtons.forEach((button, index) => {
      if (!button.querySelector('.gesture') && !button.classList.contains('run')) {
        pendingTrustAnimations.set(button, setTimeout(() => playTrustIcon(button), index * 950));
      }
    });
  });
  observer.observe(trustButtons[0].closest('section') || trustButtons[0]);
}
