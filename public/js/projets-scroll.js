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

// Animation constante : la sphere tourne lentement en continu, independante
// du scroll (360deg boucle sans a-coup visuel : rotate(360) == rotate(0)).
const sphereEl = document.querySelector('.projets-bg__sphere');
if (sphereEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  animate(sphereEl, {
    rotate: 360,
    duration: 90000,
    loop: true,
    ease: 'linear',
  });
}

// Option C (comparaison) : arc surligne sur la sphere, se dessine avec la
// progression de la carte en cours (meme technique que sphereAnim).
const progressArcEl = document.querySelector('.projets-bg__progress-arc');
const progressArcAnim = progressArcEl
  ? animate(svg.createDrawable(progressArcEl), {
      draw: ['0 0', '0 1'],
      autoplay: false,
    })
  : null;

// Option B (comparaison) : remplissage direct (pas besoin d'anime.js ici,
// scrub GSAP fournit deja le lissage) de la barre verticale fixe.
const progressBarFill = document.querySelector('.projets-progress__fill');

const STEP_GAP = 0.3;
const STEP_DURATION = 1;

const reelTriggers = new Map();

document.querySelectorAll('.reel').forEach((reel) => {
  const pin = reel.querySelector('.reel__pin');
  const navLink = document.querySelector(`.reel-nav__link[href="#${reel.id}"]`);
  const steps = [...reel.querySelectorAll('.step')].sort(
    (a, b) => Number(a.dataset.step) - Number(b.dataset.step),
  );

  // Option A (comparaison) : anneau du lien de nav correspondant, se
  // dessine avec la progression de cette carte.
  const ringEl = navLink?.querySelector('.reel-nav__ring-fill');
  const ringAnim = ringEl
    ? animate(svg.createDrawable(ringEl), {
        draw: ['0 0', '0 1'],
        autoplay: false,
      })
    : null;

  gsap.set(steps, { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: reel,
      start: 'top top',
      end: () => '+=' + window.innerHeight * steps.length,
      scrub: 1,
      pin,
      onToggle: (self) => navLink?.classList.toggle('is-active', self.isActive),
      onUpdate: (self) => {
        // La sphere se redessine (0 -> complete) sur le scroll de chaque projet.
        sphereAnim?.seek(sphereAnim.duration * self.progress);
        // Les 3 indicateurs a comparer, pilotes par le meme progress.
        progressArcAnim?.seek(progressArcAnim.duration * self.progress);
        ringAnim?.seek(ringAnim.duration * self.progress);
        if (progressBarFill) progressBarFill.style.height = `${self.progress * 100}%`;
      },
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
const progressBar = document.querySelector('.projets-progress');
if (projetsSection && (reelNav || progressBar)) {
  ScrollTrigger.create({
    trigger: projetsSection,
    start: 'top top',
    end: 'bottom bottom',
    onToggle: (self) => {
      reelNav?.classList.toggle('is-visible', self.isActive);
      progressBar?.classList.toggle('is-visible', self.isActive);
    },
  });
}
