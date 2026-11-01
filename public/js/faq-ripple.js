// Fond de la FAQ : grille de points tres pale (meme pas de 34 px que le hero et les
// projets) ; a chaque changement de question, un anneau de points part du centre du bloc
// de reponse puis s'eteint. Aucun point sous le texte. La boucle ne tourne que pendant
// une onde. Sous prefers-reduced-motion : grille fixe, pas d'onde.
const section = document.querySelector('#faq');
const canvas = section?.querySelector('.faq__bg');

if (section && canvas) {
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const GAP = 34; // espacement des points
  const DOT = 1.6; // rayon d'un point au repos
  const GROW = 1.6; // rayon supplementaire au pic de l'onde
  const IDLE_ALPHA = 0.1;
  const PEAK_ALPHA = 0.42;
  const RING = 40; // largeur de l'anneau, comme les projets
  const MASK_PAD = 16; // marge autour des textes sans point
  const CHANGE_MS = 1900;
  const ENTRY_MS = 3000;
  const COLOR = '52, 73, 102'; // Yale Blue
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  let width = 0;
  let height = 0;
  let wave = null; // { start, duration, x, y, maxR }
  let frameId = 0;

  const easeOut = (t) => 1 - (1 - t) ** 1.6;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  // Zones sans point : titre, liste des questions, reponse affichee.
  function masks() {
    const base = canvas.getBoundingClientRect();
    return ['.faq__head', '.faq__tabs', '.faq__panel.is-active']
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
  }

  function origin() {
    const plate = section.querySelector('.faq__plate');
    const base = canvas.getBoundingClientRect();
    if (!plate) return { x: width / 2, y: height / 2 };
    const r = plate.getBoundingClientRect();
    return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);
    const zones = masks();
    let radius = -1;
    let fade = 0;
    if (wave) {
      const t = Math.min(1, (now - wave.start) / wave.duration);
      radius = easeOut(t) * wave.maxR;
      fade = 1 - t * t;
    }
    const cols = Math.ceil(width / GAP) + 1;
    const rows = Math.ceil(height / GAP) + 1;
    const offsetX = (width - (cols - 1) * GAP) / 2;
    const offsetY = (height - (rows - 1) * GAP) / 2;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * GAP;
        const y = offsetY + row * GAP;
        if (zones.some((m) => x > m.left && x < m.right && y > m.top && y < m.bottom)) continue;
        let k = 0;
        if (wave) {
          const delta = Math.abs(Math.hypot(x - wave.x, y - wave.y) - radius);
          if (delta < RING) k = (1 - delta / RING) * fade;
        }
        ctx.fillStyle = `rgba(${COLOR}, ${IDLE_ALPHA + (PEAK_ALPHA - IDLE_ALPHA) * k})`;
        ctx.beginPath();
        ctx.arc(x, y, DOT + GROW * k, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function tick(now) {
    draw(now);
    if (wave && now - wave.start < wave.duration) {
      frameId = requestAnimationFrame(tick);
    } else {
      wave = null;
      frameId = 0;
      draw(now);
    }
  }

  function start(duration) {
    if (reduceMotion.matches) return;
    const o = origin();
    const far = Math.max(Math.hypot(o.x, o.y), Math.hypot(width - o.x, o.y), Math.hypot(o.x, height - o.y), Math.hypot(width - o.x, height - o.y));
    wave = { start: performance.now(), duration, x: o.x, y: o.y, maxR: far + RING };
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

  new ResizeObserver(resize).observe(canvas);
  reduceMotion.addEventListener('change', () => {
    wave = null;
    draw(performance.now());
  });
  document.fonts?.ready.then(() => draw(performance.now()));
  resize();
}
