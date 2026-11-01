// Section Projets : scenes epinglees (CSS sticky), informations qui emergent sur place
// selon la progression du scroll dans le projet, fond de points = indicateur.
// Aucune dependance : natif (scroll, canvas 2D, matchMedia).

const section = document.querySelector('#projets');
const canvas = document.querySelector('#projets-bg');

if (section && canvas) {
  const ctx = canvas.getContext('2d');
  const projects = [...section.querySelectorAll('.project')];
  const stepsByProject = projects.map((project) => [...project.querySelectorAll('.step')]);
  const nav = section.querySelector('.projets-nav');
  const bar = section.querySelector('.projets-bar');
  const barName = section.querySelector('#projets-bar-name');
  const menuButton = section.querySelector('.projets-bar__menu');
  const sheet = section.querySelector('.projets-sheet');
  const scrim = section.querySelector('.projets-scrim');
  const sheetClose = section.querySelector('.projets-sheet__close');
  const links = [...section.querySelectorAll('.projets-nav__link')];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = window.matchMedia('(max-width: 64rem)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // Seuils d'apparition des etapes 1 a 5 (progression 0..1 dans le projet).
  // L'etape 1 est visible des l'arrivee sur le projet.
  const THRESHOLDS = [0, 0.2, 0.4, 0.62, 0.82];
  const DONE_FROM = 0.97;

  // ---------- Fond de points = indicateur de progression du projet ----------
  // Grille de points (meme esprit que le hero Vanta). Le cercle lumineux part de
  // derriere l'apercu et grandit avec la lecture : a 100 % tout l'ecran est allume.
  // Rien ne descend. La houle suit le scroll (phase), sans derive.
  const GAP = 34; // espacement des points, comme le hero
  const TAU = Math.PI * 2;
  const EASE_SCROLL = 0.06;
  const EASE_PROGRESS = 0.14;
  const EASE_TINT = 0.03;
  const FADE_MS = 700; // fondu au changement de projet
  const EDGE_RATIO = 0.14; // bord doux du cercle, en part du rayon maximal
  const RING_WIDTH = 22; // largeur de l'anneau plus gros au bord du cercle, en px
  const SWELL = { x: 0.011, y: 0.007, time: 0.00035, scroll: 0.0016, lift: 3 };
  const COLOR_FROM = [180, 205, 237]; // Powder Blue
  const COLOR_TO = [120, 160, 215]; // bleu plus profond, atteint au dernier projet
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  let width = 0;
  let height = 0;
  let active = -1;
  let progress = 0;
  let progressEased = 0;
  let fade = 1;
  let tint = 0;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 1;
  let scrollTarget = window.scrollY;
  let scrollEased = scrollTarget;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function mixColor(amount) {
    return COLOR_FROM.map((from, index) => Math.round(from + (COLOR_TO[index] - from) * amount));
  }

  function drawDots(time, delta) {
    scrollEased += (scrollTarget - scrollEased) * EASE_SCROLL;
    progressEased += (progress - progressEased) * EASE_PROGRESS;
    fade = Math.min(1, fade + delta / FADE_MS);
    tint += (Math.max(0, active) / (projects.length - 1) - tint) * EASE_TINT;

    const [red, green, blue] = mixColor(tint);
    const gain = 0.4 + 0.6 * fade;
    const edge = maxRadius * EDGE_RATIO;
    const radius = progressEased * (maxRadius + edge);
    const started = progressEased > 0.001;

    ctx.clearRect(0, 0, width, height);
    for (let y = GAP / 2; y < height + GAP; y += GAP) {
      for (let x = GAP / 2; x < width + GAP; x += GAP) {
        const distance = Math.hypot(x - centerX, y - centerY);
        const reach = clamp((radius - distance) / edge, 0, 1);
        const ring = (distance - radius) / RING_WIDTH;
        const band = started ? Math.exp(-ring * ring) : 0;
        const swell = Math.sin(x * SWELL.x + y * SWELL.y - time * SWELL.time - scrollEased * SWELL.scroll);
        const k = swell * 0.5 + 0.5;
        const alpha = (0.07 + 0.05 * k + 0.2 * reach + 0.2 * band) * gain;
        const dot = 1.1 + 0.4 * k + 0.4 * reach + 0.8 * band;
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y + swell * SWELL.lift, dot, 0, TAU);
        ctx.fill();
      }
    }
  }

  let frameId = 0;
  let lastTime = 0;

  function frame(time) {
    const delta = lastTime ? time - lastTime : 16;
    lastTime = time;
    drawDots(time, delta);
    frameId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (reduceMotion.matches || frameId) return;
    lastTime = 0;
    frameId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  }

  // ---------- Etapes ----------
  // En colonne (apercu au-dessus du titre), l'ordre d'apparition suit l'ordre de lecture :
  // data-mstep remplace data-step.
  function applySteps(index, value) {
    // Lecture normale (scene trop haute pour l'ecran) ou reduced-motion : tout est visible d'emblee.
    const showAll = reduceMotion.matches || projects[index].classList.contains('is-flow');
    stepsByProject[index].forEach((element) => {
      const mobileStep = element.getAttribute('data-mstep');
      const step = Number(stacked.matches && mobileStep ? mobileStep : element.getAttribute('data-step'));
      const until = element.getAttribute('data-until');
      const on = showAll || value >= THRESHOLDS[step - 1];
      const gone = Boolean(until) && !showAll && value >= THRESHOLDS[Number(until) - 1];
      element.classList.toggle('is-on', on);
      element.classList.toggle('is-gone', gone);
      element.inert = !on || (gone && stacked.matches);
    });
    projects[index].classList.toggle('is-done', value >= DONE_FROM);
  }

  // Une scene epinglee fait exactement un ecran : si son contenu est plus haut
  // (petit mobile, barres du navigateur, zoom), le bas serait coupe. On mesure
  // alors le projet a vide et on le bascule en lecture normale (classe is-flow).
  function measureFlow() {
    projects.forEach((project) => {
      project.classList.remove('is-flow');
      if (reduceMotion.matches) return;
      const grid = project.querySelector('.project__grid');
      if (grid.scrollHeight - grid.clientHeight > 1) project.classList.add('is-flow');
    });
  }

  function setActive(index) {
    links.forEach((link) => {
      if (link.getAttribute('data-goto') === String(index)) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    barName.textContent = projects[index].getAttribute('data-short');
  }

  // ---------- Mise a jour au scroll ----------
  function updateMenu(viewport) {
    const box = section.getBoundingClientRect();
    const showMenu = box.top < viewport * 0.5 && box.bottom > viewport * 0.5;
    nav.classList.toggle('is-visible', showMenu);
    bar.classList.toggle('is-visible', showMenu);
    return box.top < viewport && box.bottom > 0;
  }

  // Applique les etapes de chaque projet ; le projet actif est le dernier dont le haut
  // a passe la moitie de l'ecran. Retourne son index.
  function updateProjects(viewport) {
    let current = 0;
    projects.forEach((project, index) => {
      const rect = project.getBoundingClientRect();
      const travel = rect.height - viewport;
      const value = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
      applySteps(index, value);
      if (rect.top <= viewport * 0.5) {
        current = index;
        progress = value;
      }
    });
    return current;
  }

  // Le cercle part du centre de l'apercu du projet actif.
  function updateRippleCenter(current) {
    const preview = projects[current].querySelector('.frame');
    if (!preview) return;
    const rect = preview.getBoundingClientRect();
    if (rect.width === 0) return;
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    maxRadius = Math.max(
      1,
      Math.hypot(centerX, centerY),
      Math.hypot(width - centerX, centerY),
      Math.hypot(centerX, height - centerY),
      Math.hypot(width - centerX, height - centerY),
    );
  }

  // ---------- Apercus animes ----------
  // Une seule video joue : celle du projet actif, quand la section est a l'ecran.
  // Sous reduced-motion rien ne demarre seul ; le bouton lance ou met en pause (choix du visiteur).
  const videos = projects.map((project) => project.querySelector('.frame__video'));
  const toggles = projects.map((project) => project.querySelector('.frame__toggle'));

  function isWanted(video) {
    return video.dataset.user ? video.dataset.user === 'play' : !reduceMotion.matches;
  }

  function syncVideos(inView) {
    videos.forEach((video, index) => {
      if (!video) return;
      if (inView && (index === active || index === active + 1)) video.preload = 'auto';
      const run = inView && !document.hidden && index === active && isWanted(video);
      if (run && video.paused) video.play().catch(() => {});
      else if (!run && !video.paused) video.pause();
      const label = isWanted(video) ? 'Pause' : 'Lecture';
      if (toggles[index] && toggles[index].textContent !== label) toggles[index].textContent = label;
    });
  }

  toggles.forEach((button, index) => {
    if (!button || !videos[index]) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      videos[index].dataset.user = isWanted(videos[index]) ? 'pause' : 'play';
      scheduleUpdate();
    });
  });

  let queued = false;

  function update() {
    queued = false;
    const viewport = window.innerHeight;
    const inView = updateMenu(viewport);
    const current = updateProjects(viewport);
    scrollTarget = window.scrollY;

    if (current !== active) {
      active = current;
      progressEased = progress;
      fade = 0;
      setActive(current);
    }
    updateRippleCenter(current);
    syncVideos(inView);

    if (inView && !document.hidden) startLoop();
    else stopLoop();

    // Sous reduced-motion : pas de boucle, le fond est redessine a chaque mise a jour.
    if (reduceMotion.matches) {
      scrollEased = scrollTarget;
      progressEased = progress;
      fade = 1;
      drawDots(0, 0);
    }
  }

  function scheduleUpdate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  function onResize() {
    measureFlow();
    resizeCanvas();
    scheduleUpdate();
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', scheduleUpdate);
  reduceMotion.addEventListener('change', onResize);
  stacked.addEventListener('change', onResize);
  document.fonts?.ready.then(onResize);

  // ---------- Navigation ----------
  // Menu : on atterrit sur le projet entierement revele (fin de scene).
  // "Suite" : au debut du projet suivant.
  function goTo(target, atStart) {
    let top;
    if (target === 'contact') {
      const contact = document.querySelector('#contact');
      if (!contact) return;
      top = contact.getBoundingClientRect().top + window.scrollY;
    } else {
      const project = projects[Number(target)];
      if (!project) return;
      const start = project.getBoundingClientRect().top + window.scrollY;
      top = atStart ? start : start + project.offsetHeight - window.innerHeight;
    }
    window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  // ---------- Vue laterale (mobile) ----------
  let lastFocus = null;
  sheet.setAttribute('inert', '');

  function openSheet(byKeyboard) {
    lastFocus = document.activeElement;
    sheet.removeAttribute('inert');
    sheet.classList.add('is-open');
    scrim.classList.add('is-open');
    menuButton.setAttribute('aria-expanded', 'true');
    if (byKeyboard) {
      setTimeout(() => sheet.querySelector('.projets-nav__link')?.focus(), 30);
    }
  }

  function closeSheet({ restoreFocus = true } = {}) {
    sheet.classList.remove('is-open');
    scrim.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    sheet.setAttribute('inert', '');
    if (restoreFocus) lastFocus?.focus?.();
    lastFocus = null;
  }

  menuButton.addEventListener('click', (event) => {
    if (sheet.classList.contains('is-open')) closeSheet();
    else openSheet(event.detail === 0);
  });
  sheetClose.addEventListener('click', () => closeSheet());
  scrim.addEventListener('click', () => closeSheet());

  // Echap ferme la vue ; Tab reste dedans.
  document.addEventListener('keydown', (event) => {
    if (!sheet.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeSheet();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...sheet.querySelectorAll('a[href], button')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // href="#projet-N" est conserve : sans JS, le saut d'ancre natif reste le repli.
  section.querySelectorAll('[data-goto]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      if (sheet.contains(element)) closeSheet({ restoreFocus: false });
      goTo(element.getAttribute('data-goto'), element.getAttribute('data-at') === 'start');
    });
  });

  measureFlow();
  resizeCanvas();
  update();
}
