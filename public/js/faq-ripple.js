// Fond de la FAQ : grille de points tres pale (meme pas de 34 px que le hero et les
// projets) ; a chaque changement de question, un anneau de points part du centre du bloc
// de reponse puis s'eteint. Aucun point sous le texte. La boucle ne tourne que pendant
// une onde. Sous prefers-reduced-motion : grille fixe, pas d'onde.
const section = document.querySelector('.faq');
const canvas = section?.querySelector('.faq__bg');

if (section && canvas) {
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const GAP = 34; // espacement des points
  const DOT = 1.6; // rayon d'un point au repos
  const GROW = 1.6; // rayon supplementaire au pic de l'onde
  const IDLE_ALPHA = 0.1;
  const PEAK_ALPHA = 0.42;
  const RING = 40; // largeur de l'anneau
  const MASK_PAD = 16; // marge autour des textes sans point
  const CHANGE_MS = 1900;
  const ENTRY_MS = 3000;
  // Couleur des points (rgb) : jeton --faq-dot du theme (Yale Blue en clair, Powder Blue en sombre)
  const COLOR = getComputedStyle(section).getPropertyValue('--faq-dot').trim() || '52, 73, 102';
  const TAU = Math.PI * 2;
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  const restStyle = `rgba(${COLOR}, ${IDLE_ALPHA})`;

  let width = 0;
  let height = 0;
  let points = new Float32Array(0); // x, y des points visibles (hors zones de texte)
  let ringIndex = new Int32Array(0); // points touches par l'anneau a l'image courante
  let origin = { x: 0, y: 0 };
  let maxRadius = 1;
  let wave = null; // { start, duration }
  let frameId = 0;

  const easeOut = (t) => 1 - (1 - t) ** 1.6;

  // Geometrie : calculee au redimensionnement et au demarrage d'une onde, jamais pendant le dessin.
  function layout() {
    const base = canvas.getBoundingClientRect();
    width = base.width;
    height = base.height;

    // Zones sans point : titre, liste des questions, reponse affichee.
    const zones = ['.faq__head', '.faq__tabs', '.faq__panel.is-active']
      .map((selector) => section.querySelector(selector))
      .filter(Boolean)
      .map((element) => {
        const r = element.getBoundingClientRect();
        return {
          left: r.left - base.left - MASK_PAD,
          top: r.top - base.top - MASK_PAD,
          right: r.right - base.left + MASK_PAD,
          bottom: r.bottom - base.top + MASK_PAD,
        };
      })
      .filter((m) => m.right > m.left && m.bottom > m.top);

    const cols = Math.ceil(width / GAP) + 1;
    const rows = Math.ceil(height / GAP) + 1;
    const offsetX = (width - (cols - 1) * GAP) / 2;
    const offsetY = (height - (rows - 1) * GAP) / 2;
    const visible = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * GAP;
        const y = offsetY + row * GAP;
        if (!zones.some((m) => x > m.left && x < m.right && y > m.top && y < m.bottom)) visible.push(x, y);
      }
    }
    points = Float32Array.from(visible);
    ringIndex = new Int32Array(points.length / 2);

    // Origine de l'onde : centre du bloc de reponse ; rayon final : coin le plus eloigne.
    const plate = section.querySelector('.faq__plate');
    const r = plate?.getBoundingClientRect();
    origin = r ? { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 } : { x: width / 2, y: height / 2 };
    const far = Math.max(
      Math.hypot(origin.x, origin.y),
      Math.hypot(width - origin.x, origin.y),
      Math.hypot(origin.x, height - origin.y),
      Math.hypot(width - origin.x, height - origin.y),
    );
    maxRadius = far + RING;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    // Reaffecter width/height reinitialise le canvas : seulement si la taille change.
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    draw(performance.now());
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);

    let radius = 0;
    let fade = 0;
    let innerSq = -1;
    let outerSq = -1;
    if (wave) {
      const t = Math.min(1, (now - wave.start) / wave.duration);
      radius = easeOut(t) * maxRadius;
      fade = 1 - t * t;
      innerSq = radius > RING ? (radius - RING) ** 2 : -1;
      outerSq = (radius + RING) ** 2;
    }

    // Points au repos : un seul trace, un seul remplissage.
    let ringCount = 0;
    ctx.fillStyle = restStyle;
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      if (wave) {
        const dx = x - origin.x;
        const dy = y - origin.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > innerSq && distSq < outerSq) {
          ringIndex[ringCount++] = i;
          continue;
        }
      }
      ctx.moveTo(x + DOT, y);
      ctx.arc(x, y, DOT, 0, TAU);
    }
    ctx.fill();

    // Points de l'anneau : taille et opacite propres a chacun.
    for (let n = 0; n < ringCount; n++) {
      const i = ringIndex[n];
      const x = points[i];
      const y = points[i + 1];
      const delta = Math.abs(Math.hypot(x - origin.x, y - origin.y) - radius);
      const k = delta < RING ? (1 - delta / RING) * fade : 0;
      ctx.fillStyle = `rgba(${COLOR}, ${IDLE_ALPHA + (PEAK_ALPHA - IDLE_ALPHA) * k})`;
      ctx.beginPath();
      ctx.arc(x, y, DOT + GROW * k, 0, TAU);
      ctx.fill();
    }
  }

  function tick(now) {
    if (wave && now - wave.start < wave.duration) {
      draw(now);
      frameId = requestAnimationFrame(tick);
    } else {
      wave = null;
      frameId = 0;
      draw(now);
    }
  }

  function start(duration) {
    if (reduceMotion.matches) return;
    layout();
    wave = { start: performance.now(), duration };
    if (!frameId) frameId = requestAnimationFrame(tick);
  }

  section.addEventListener('faq:change', () => start(CHANGE_MS));

  // Onde d'arrivee : une seule fois, quand la section est a moitie visible.
  const entry = new IntersectionObserver(
    (items) => {
      if (items.some((item) => item.isIntersecting)) {
        entry.disconnect();
        start(ENTRY_MS);
      }
    },
    { threshold: 0.5 },
  );
  entry.observe(section);

  // Le ResizeObserver appelle resize() des l'observation : pas d'appel direct.
  new ResizeObserver(resize).observe(canvas);
  reduceMotion.addEventListener('change', () => {
    wave = null;
    draw(performance.now());
  });
  document.fonts?.ready.then(() => {
    layout();
    draw(performance.now());
  });
}
