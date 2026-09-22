if (typeof gsap === 'undefined') {
  // CDN gsap absent/en echec : pas de scrollytelling possible, on laisse
  // le fallback CSS (chaque .reel en ecran plein page empile normalement).
  throw new Error('gsap non charge, projets-scroll.js desactive.');
}

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// La barre de progression EST une onde sinusoidale (meme principe que la
// reference : path redessine chaque frame a partir d'un offset croissant),
// adapte en JS vanilla. Un seul rAF partage anime toutes les cartes (meme
// "d" partout) ; chaque carte a son propre trace "fill" clippe sur la
// largeur = avancement de ses etapes, par-dessus un trace "track" discret.
const WAVE_WIDTH = 300;
const WAVE_HEIGHT = 24;
const WAVE_AMPLITUDE = 7;
const WAVE_FREQUENCY = 0.06;
const WAVE_SPEED = 0.05;

const svgNS = 'http://www.w3.org/2000/svg';
const wavePaths = [];

function buildWaveD(offset) {
  let d = '';
  for (let x = 0; x <= WAVE_WIDTH; x += 6) {
    const y = WAVE_HEIGHT / 2 - WAVE_AMPLITUDE * Math.sin(x * WAVE_FREQUENCY - offset);
    d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
  }
  return d;
}

function createProgressWave(bar, clipId) {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'reel__progress-wave');
  svg.setAttribute('viewBox', `0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  const clipPath = document.createElementNS(svgNS, 'clipPath');
  clipPath.setAttribute('id', clipId);
  const clipRect = document.createElementNS(svgNS, 'rect');
  clipRect.setAttribute('x', '0');
  clipRect.setAttribute('y', '0');
  clipRect.setAttribute('width', '0');
  clipRect.setAttribute('height', String(WAVE_HEIGHT));
  clipPath.appendChild(clipRect);

  const track = document.createElementNS(svgNS, 'path');
  track.setAttribute('class', 'reel__progress-wave-track');

  const fill = document.createElementNS(svgNS, 'path');
  fill.setAttribute('class', 'reel__progress-wave-fill');
  fill.setAttribute('clip-path', `url(#${clipId})`);

  svg.append(clipPath, track, fill);
  bar.appendChild(svg);
  wavePaths.push(track, fill);

  return clipRect;
}

const STEP_GAP = 0.3;
const STEP_DURATION = 1;

const reelTriggers = new Map();

document.querySelectorAll('.reel').forEach((reel, index) => {
  const pin = reel.querySelector('.reel__pin');
  const navLink = document.querySelector(`.reel-nav__link[href="#${reel.id}"]`);
  const steps = [...reel.querySelectorAll('.step')].sort(
    (a, b) => Number(a.dataset.step) - Number(b.dataset.step),
  );

  // Barre de progression = onde clippee sur sa largeur, cf. createProgressWave.
  const progressBar = pin.querySelector('.reel__progress');
  const progressClipRect = progressBar ? createProgressWave(progressBar, `reel-progress-clip-${index}`) : null;

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
        if (progressClipRect) progressClipRect.setAttribute('width', String(self.progress * WAVE_WIDTH));
      },
    },
  });

  steps.forEach((step) => {
    tl.to(step, { opacity: 1, y: 0, duration: STEP_DURATION, ease: 'power2.out' }, `+=${STEP_GAP}`);
  });

  reelTriggers.set(reel.id, { trigger: tl.scrollTrigger, stepCount: steps.length });
});

// Boucle d'animation de l'onde, demarree une fois toutes les cartes creees
// (wavePaths contient alors track + fill de chaque carte, meme "d" partage).
// prefers-reduced-motion : on dessine l'onde une seule fois (etat statique,
// la barre de progression reste utile) au lieu de la boucle rAF continue.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (wavePaths.length) {
  if (prefersReducedMotion) {
    const d = buildWaveD(0);
    wavePaths.forEach((path) => path.setAttribute('d', d));
  } else {
    let waveOffset = 0;
    const animateWave = () => {
      waveOffset += WAVE_SPEED;
      const d = buildWaveD(waveOffset);
      wavePaths.forEach((path) => path.setAttribute('d', d));
      requestAnimationFrame(animateWave);
    };
    requestAnimationFrame(animateWave);
  }
}

// CTA hero "Projets" : au lieu d'atterrir sur la carte n°1 encore vierge
// (etape 1 pas revelee) et sans le menu (son ScrollTrigger pas encore
// actif), on defile jusqu'au point ou l'etape 1 de la carte n°1 est deja
// revelee - chaque etape occupe 1/steps.length du timeline (gap + duree
// fixes), donc l'etape 1 finit a 1/steps.length. Le trajet est anime
// (ScrollToPlugin, ease douce) plutot qu'un saut sec : le reveal de
// l'etape 1 se joue pendant la transition.
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
