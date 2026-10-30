// Subtle entrances: the parts of each section rise into place, staggered, once.
// Only elements still below the fold are hidden, and only by this script, so the page
// reads fine without JavaScript and nothing on the first screen ever blinks.
const TARGETS = [
  '.section-heading', '.about .facts > div', '.about .paragraph', '.about .skills > div',
  '.jobs > li', '.featured > article', '.side-heading', '.side > li',
  '.lead', '.rows > li', '.footer .meta', '.footer .name',
].join(',');

export function mountReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    // Stagger whatever enters together, in reading order.
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      const el = e.target as HTMLElement;
      el.style.setProperty('--reveal-delay', `${i * 70}ms`);
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }); // no bottom inset: the last element on the page must still be able to enter

  for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
    if (el.getBoundingClientRect().top < innerHeight) continue;
    el.classList.add('reveal');
    io.observe(el);
  }
}
