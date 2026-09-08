import { animate, svg } from 'https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm';

gsap.registerPlugin(ScrollTrigger);

const spherePaths = document.querySelectorAll('.projets-bg__sphere path');
const sphereAnim = spherePaths.length
  ? animate(svg.createDrawable(spherePaths), {
      draw: ['0 0', '0 1'],
      ease: 'inOut(3)',
      duration: 1000,
      autoplay: false,
    })
  : null;

document.querySelectorAll('.reel').forEach((reel) => {
  const pin = reel.querySelector('.reel__pin');
  const navLink = document.querySelector(`.reel-nav__link[href="#${reel.id}"]`);
  const steps = [...reel.querySelectorAll('.step')].sort(
    (a, b) => Number(a.dataset.step) - Number(b.dataset.step),
  );

  gsap.set(steps, { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: reel,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (steps.length + 0.5),
      scrub: 1,
      pin,
      onToggle: (self) => navLink?.classList.toggle('is-active', self.isActive),
      // La sphere se redessine (0 -> complete) sur le scroll de chaque projet.
      onUpdate: (self) => sphereAnim?.seek(sphereAnim.duration * self.progress),
    },
  });

  steps.forEach((step) => {
    tl.to(step, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '+=0.2');
  });
});
