import { animate, svg } from 'https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const spherePaths = document.querySelectorAll('.projets-bg__sphere path');
const sphereAnim = spherePaths.length
  ? animate(svg.createDrawable(spherePaths), {
      draw: ['0 0', '0 1'],
      ease: 'inOut(3)',
      duration: 1000,
      autoplay: false,
    })
  : null;

const STEP_GAP = 0.3;
const STEP_DURATION = 1;

const reelTriggers = new Map();

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
      end: () => '+=' + window.innerHeight * steps.length,
      scrub: 1,
      pin,
      onToggle: (self) => navLink?.classList.toggle('is-active', self.isActive),
      // La sphere se redessine (0 -> complete) sur le scroll de chaque projet.
      onUpdate: (self) => sphereAnim?.seek(sphereAnim.duration * self.progress),
    },
  });

  steps.forEach((step) => {
    tl.to(step, { opacity: 1, y: 0, duration: STEP_DURATION, ease: 'power2.out' }, `+=${STEP_GAP}`);
  });

  reelTriggers.set(reel.id, { trigger: tl.scrollTrigger, stepCount: steps.length });
});

// CTA hero "Projets" : au lieu d'atterrir sur la carte n°1 encore vierge
// (etape 1 pas revelee) et sans le menu (son ScrollTrigger pas encore
// actif), on defile jusqu'au point ou l'etape 1 de la carte n°1 est deja
// revelee - chaque etape occupe 1/steps.length du timeline (gap + duree
// fixes), donc l'etape 1 finit a 1/steps.length. Le trajet est anime
// (ScrollToPlugin, ease douce) plutot qu'un saut sec : le dessin de la
// sphere et le reveal de l'etape 1 se jouent pendant la transition.
const heroCta = document.querySelector('.hero__scroll');
const firstReel = document.querySelector('.reel');
if (heroCta && firstReel) {
  heroCta.addEventListener('click', (event) => {
    const data = reelTriggers.get(firstReel.id);
    if (!data) return;
    event.preventDefault();
    const { trigger, stepCount } = data;
    const progress = 1 / stepCount;
    const target = trigger.start + (trigger.end - trigger.start) * progress;
    gsap.to(window, {
      duration: 1.2,
      ease: 'power2.inOut',
      scrollTo: { y: target, autoKill: false },
    });
  });
}

// Cree apres les triggers de pin ci-dessus : #projets n'a sa hauteur finale
// (pin-spacers des reels inclus) qu'une fois ceux-ci en place. Cree avant,
// "bottom bottom" se calculait sur la hauteur non-pinnee et se declenchait
// bien trop tot (le menu ne restait visible que pendant le 1er projet).
const projetsSection = document.querySelector('#projets');
const reelNav = document.querySelector('.reel-nav');
if (projetsSection && reelNav) {
  ScrollTrigger.create({
    trigger: projetsSection,
    start: 'top top',
    end: 'bottom bottom',
    onToggle: (self) => reelNav.classList.toggle('is-visible', self.isActive),
  });
}
