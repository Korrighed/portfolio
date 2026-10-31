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
  const n = projects.length;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = window.matchMedia('(max-width: 64rem)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // Seuils d'apparition des etapes 1 a 5 (progression 0..1 dans le projet).
  // L'etape 1 est visible des l'arrivee sur le projet.
  const THRESHOLDS = [0, 0.2, 0.4, 0.62, 0.82];

  // ---------- Fond de points = indicateur de progression du projet ----------
  // Grille de points (meme esprit que le hero Vanta). Le cercle lumineux part de
  // derriere l'apercu et grandit avec la lecture : a 100 % tout l'ecran est allume.
  // Rien ne descend. La houle suit le scroll (phase), sans derive.
  const GAP = 34;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let width = 0;
  let height = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

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

  function drawDots(time, delta) {
    scrollEased += (scrollTarget - scrollEased) * 0.06;
    progressEased += (progress - progressEased) * 0.14;
    fade = Math.min(1, fade + delta / 700);
    tint += (Math.max(0, active) / (n - 1) - tint) * 0.03;

    // Powder Blue (180, 205, 237) qui glisse legerement vers un bleu plus profond.
    const red = Math.round(180 - 60 * tint);
    const green = Math.round(205 - 45 * tint);
    const blue = Math.round(237 - 22 * tint);
    const gain = 0.4 + 0.6 * fade;
    const edge = maxRadius * 0.14;
    const radius = progressEased * (maxRadius + edge);

    ctx.clearRect(0, 0, width, height);
    for (let y = GAP / 2; y < height + GAP; y += GAP) {
      for (let x = GAP / 2; x < width + GAP; x += GAP) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const reach = clamp((radius - distance) / edge, 0, 1);
        const ring = (distance - radius) / 22;
        const band = Math.exp(-ring * ring) * (progressEased > 0.001 ? 1 : 0);
        const swell = Math.sin(x * 0.011 + y * 0.007 - time * 0.00035 - scrollEased * 0.0016);
        const k = swell * 0.5 + 0.5;
        const alpha = (0.07 + 0.05 * k + 0.2 * reach + 0.2 * band) * gain;
        const dot = 1.1 + 0.4 * k + 0.4 * reach + 0.8 * band;
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y + swell * 3, dot, 0, 6.2832);
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
    // Mode lecture normale (scene trop haute pour l'ecran) : tout est visible d'emblee.
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
    projects[index].classList.toggle('is-done', value >= 0.97);
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
  let queued = false;

  function update() {
    queued = false;
    const viewport = window.innerHeight;
    const box = section.getBoundingClientRect();
    const inView = box.top < viewport && box.bottom > 0;
    const showMenu = box.top < viewport * 0.5 && box.bottom > viewport * 0.5;
    nav.classList.toggle('is-visible', showMenu);
    bar.classList.toggle('is-visible', showMenu);

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
    scrollTarget = window.scrollY;

    if (current !== active) {
      active = current;
      progressEased = progress;
      fade = 0;
      setActive(current);
    }

    const preview = projects[current].querySelector('.frame');
    if (preview) {
      const rect = preview.getBoundingClientRect();
      if (rect.width > 0) {
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
    }

    if (inView && !document.hidden) startLoop();
    else stopLoop();

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

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  function onResize() {
    measureFlow();
    resizeCanvas();
    scheduleUpdate();
  }

  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', scheduleUpdate);
  reduceMotion.addEventListener('change', onResize);
  stacked.addEventListener('change', onResize);
  document.fonts?.ready.then(onResize);

  // ---------- Navigation ----------
  // Menu : on atterrit sur le projet entierement revele (fin de scene). « Suite » : au debut du projet suivant.
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

  function closeSheet() {
    sheet.classList.remove('is-open');
    scrim.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    sheet.setAttribute('inert', '');
    lastFocus?.focus?.();
  }

  menuButton.addEventListener('click', (event) => {
    if (sheet.classList.contains('is-open')) closeSheet();
    else openSheet(event.detail === 0);
  });
  sheetClose.addEventListener('click', closeSheet);
  scrim.addEventListener('click', closeSheet);

  document.addEventListener('keydown', (event) => {
    if (!sheet.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeSheet();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...sheet.querySelectorAll('a[href], button')];
    if (!focusable.length) return;
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
      if (sheet.contains(element)) {
        sheet.classList.remove('is-open');
        scrim.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        sheet.setAttribute('inert', '');
        lastFocus = null;
      }
      goTo(element.getAttribute('data-goto'), element.getAttribute('data-at') === 'start');
    });
  });

  measureFlow();
  resizeCanvas();
  update();
}
