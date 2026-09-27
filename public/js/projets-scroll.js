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

// Longueur de scroll d'une carte, en hauteurs de viewport. Volontairement
// decouple du nombre d'etapes : passer de 4 a 5 etapes (points cles et liens
// separes) ne doit pas rallonger la section, seulement resserrer les reveals.
const REEL_VIEWPORTS = 4;

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
      end: () => '+=' + window.innerHeight * REEL_VIEWPORTS,
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

// Defile vers une progression donnee d'une carte, au lieu du saut d'ancre brut
// qui atterrit sur `top top` (progress 0 = carte vierge, aucune etape revelee,
// l'utilisateur doit scroller pour voir quoi que ce soit). start/end sont relus
// a chaque appel : les pin-spacers des cartes precedentes decalent les
// positions, une valeur mise en cache serait fausse d'un viewport ou plus sur
// les dernieres cartes.
function scrollToReelProgress(reelId, progress, duration = 1.2) {
  const data = reelTriggers.get(reelId);
  if (!data) return false;
  const target = data.trigger.start + (data.trigger.end - data.trigger.start) * progress;
  gsap.to(window, {
    duration,
    ease: 'power2.inOut',
    scrollTo: { y: target, autoKill: false },
  });
  return true;
}

// CTA hero "Projets" : atterrit sur la carte n°1 avec son etape 1 deja
// revelee, le reveal se jouant pendant la transition.
const heroCta = document.querySelector('.hero__scroll');
const firstReel = document.querySelector('.reel');
if (heroCta && firstReel) {
  heroCta.addEventListener('click', (event) => {
    const { stepCount } = reelTriggers.get(firstReel.id) ?? {};
    if (stepCount && scrollToReelProgress(firstReel.id, 1 / stepCount)) {
      event.preventDefault();
    }
  });
}

// Menu lateral : on vise la fin du timeline, donc la carte entierement
// revelee, liens GitHub et Site compris. Le reveal des etapes se joue pendant
// le trajet ScrollToPlugin : l'utilisateur voit tout apparaitre et n'a rien a
// scroller pour lire la carte ou atteindre les liens.
// href="#reel-N" est conserve : sans JS, ou si le CDN gsap tombe (garde en
// tete de fichier), le saut d'ancre natif reste le comportement de repli.
document.querySelectorAll('.reel-nav__link').forEach((link) => {
  const reelId = link.getAttribute('href')?.slice(1);
  if (!reelId || !reelTriggers.has(reelId)) return;
  link.addEventListener('click', (event) => {
    if (scrollToReelProgress(reelId, 1)) event.preventDefault();
  });
});

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
