import { animate, stagger, onScroll, svg } from 'https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm';

document.querySelectorAll('.reel').forEach((reel) => {
  const path = reel.querySelector('.reel__line path');
  if (!path) return;

  animate(svg.createDrawable(path), {
    draw: ['0 0', '0 1', '1 1'],
    delay: stagger(40),
    ease: 'inOut(3)',
    autoplay: onScroll({
      target: reel,
      sync: true,
    }),
  });
});
