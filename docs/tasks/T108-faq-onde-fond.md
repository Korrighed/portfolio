# T108 — Ajouter le fond de points léger et l'onde à la FAQ

Statut : à faire
Story : US-04 · Exigences : F-19, NF-07, NF-10, T-21
Dépend de : T107
Parallélisable : non
Exécutant : executor

## Objectif

La section FAQ a un fond de points très pâle et fixe (grille de 34 px, comme le hero et les projets). À chaque changement de question, un anneau de points part du centre du bloc de réponse et s'éteint en environ 1,5 s ; à la première arrivée dans la section, une onde plus lente (2,5 s). Aucun point ne passe sous le texte (titre, liste, réponse). La boucle d'animation ne tourne que pendant une onde. Sous `prefers-reduced-motion` : grille fixe, pas d'onde.

## Fichiers à lire

- `src/sections/faq.html` — structure actuelle (à remplacer)
- `public/css/faq.css` — règles `.faq`, `.faq__stage`
- `public/js/faq.js` — fonction `select`
- `src/index.template.html` — où ajouter le script
- `public/js/projets-scroll.js` — constantes `GAP`, `RING_WIDTH` (esprit à reprendre, ne pas importer)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/faq.html` | remplacer | ajout du conteneur `.faq__scene` et du `<canvas>` |
| `public/css/faq.css` | modifier | styles du conteneur et du canvas |
| `public/js/faq.js` | modifier | événement `faq:change` au changement de question |
| `public/js/faq-ripple.js` | créer | dessin de la grille et des ondes |
| `src/index.template.html` | modifier | balise `<script type="module" src="/js/faq-ripple.js">` |

## Étapes

1. Remplacer **tout** le contenu de `src/sections/faq.html` par exactement (les deux marqueurs restent seuls sur leur ligne, sans indentation) :

```html
  <section id="faq" class="faq" aria-labelledby="faq-title">
    <div class="section-divider">
      <div class="section-divider__inner">
        <div class="section-divider__line" aria-hidden="true">
          <span class="section-divider__marker"></span>
        </div>
      </div>
    </div>

    <div class="faq__scene">
      <canvas class="faq__bg" aria-hidden="true"></canvas>

      <div class="faq__stage">
        <header class="faq__head">
          <span class="text-eyebrow">02 — Questions</span>
          <h2 id="faq-title" class="faq__title">Questions fréquentes</h2>
        </header>

        <div class="faq__tabs">
<!-- faq:tabs -->
        </div>

        <div class="faq__plate">
          <div class="faq__panels">
<!-- faq:panels -->
          </div>
        </div>
      </div>
    </div>
  </section>
```

2. Dans `public/css/faq.css`, dans la règle `.faq__stage { … }`, ajouter ces deux lignes à la fin de la règle :

```css
  position: relative;
  z-index: 1;
```

3. Dans `public/css/faq.css`, juste avant la règle `.faq__stage`, ajouter exactement :

```css
/* Scene : le canvas de fond couvre toute la zone, sous le texte */
.faq__scene {
  position: relative;
  display: flex;
  flex: 1;
}

.faq__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

```

4. Dans `public/js/faq.js`, juste après la ligne `section.classList.add('is-tabs');`, ajouter ces deux lignes :

```js
    let current = -1;
    let ready = false;
```

5. Dans `public/js/faq.js`, dans la fonction `select(index, focus)`, ajouter ces deux lignes tout au début du corps de la fonction :

```js
      const changed = index !== current;
      current = index;
```

et ajouter cette ligne juste après `if (focus) tabs[index].focus();` (dernière instruction de la fonction) :

```js
      if (changed && ready) section.dispatchEvent(new CustomEvent('faq:change', { detail: { index } }));
```

6. Dans `public/js/faq.js`, remplacer l'appel final `select(0, false);` par :

```js
    select(0, false);
    ready = true;
```

7. Créer `public/js/faq-ripple.js` avec exactement :

```js
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
  const GROW = 1.1; // rayon supplementaire au pic de l'onde
  const IDLE_ALPHA = 0.1;
  const PEAK_ALPHA = 0.32;
  const RING = 22; // largeur de l'anneau, comme les projets
  const MASK_PAD = 16; // marge autour des textes sans point
  const CHANGE_MS = 1500;
  const ENTRY_MS = 2500;
  const COLOR = '52, 73, 102'; // Yale Blue
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  let width = 0;
  let height = 0;
  let wave = null; // { start, duration, x, y, maxR }
  let frameId = 0;

  const easeOut = (t) => 1 - (1 - t) ** 3;

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
      fade = 1 - t;
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
```

8. Dans `src/index.template.html`, juste après la ligne `<script type="module" src="/js/faq.js"></script>`, ajouter une ligne vide puis `  <script type="module" src="/js/faq-ripple.js"></script>` (deux espaces d'indentation).
9. Lancer `npm run build` puis `node --check public/js/faq.js` et `node --check public/js/faq-ripple.js`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `public/index.html`, alors il contient `class="faq__scene"`, un seul `<canvas class="faq__bg"`, 5 `class="faq__tab"`, 5 `class="faq__panel"` et `src="/js/faq-ripple.js"`.
- [ ] AC-02 : Étant donné `public/js/faq.js`, alors il contient `faq:change`, `let ready = false;` et `ready = true;`.
- [ ] AC-03 : Étant donné `public/js/faq-ripple.js`, alors il contient `prefers-reduced-motion`, `IntersectionObserver`, `ResizeObserver` et `requestAnimationFrame`.
- [ ] AC-04 : Étant donné le build, alors `npm run build` réussit et les deux `node --check` ne signalent aucune erreur.

## Vérification

```bash
npm run build
node --check public/js/faq.js
node --check public/js/faq-ripple.js
```

Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 à AC-03.

Parcours navigateur : à rejouer par moi après la tâche (grille pâle visible, onde au changement de question, aucun point sous le texte, aucune erreur de console, section toujours dans l'écran).

## Hors périmètre

- Ne pas modifier `public/js/projets-scroll.js`, `public/css/projets.css` ni le canvas `#projets-bg`.
- Ne pas modifier `scripts/build-index.js` ni `src/data/faq.json`.
- Ne pas ajouter de boucle d'animation permanente, de dégradé ni d'image.
- Ne pas committer.

## Notes d'exécution

- Étapes 1 à 9 appliquées telles quelles, texte repris à l'identique. Statut de la tâche non modifié.
- Fichiers modifiés : `src/sections/faq.html`, `public/css/faq.css`, `public/js/faq.js`, `src/index.template.html`. Créé : `public/js/faq-ripple.js`.
- `public/index.html` régénéré par `npm run build` (étape 9). Il n'est pas dans les fichiers cibles, mais le build l'écrit à chaque fois et AC-01 le lit. Diff limité à la section FAQ et à la balise du script (15 ajouts, 9 suppressions).
- Vérifications : `npm run build` OK. `node --check` OK sur `faq.js` et `faq-ripple.js`.
- AC-01 (Grep) : 1 `class="faq__scene"`, 1 `<canvas class="faq__bg"`, 5 `class="faq__tab"`, 5 `class="faq__panel"`, 1 `src="/js/faq-ripple.js"`.
- AC-02 (Grep) : `faq:change`, `let ready = false;`, `ready = true;` présents.
- AC-03 (Grep) : `prefers-reduced-motion`, `IntersectionObserver`, `ResizeObserver`, `requestAnimationFrame` présents.
- `faq.js` : le `const current` du gestionnaire `keydown` masque le `let current` de l'étape 4, à l'intérieur de sa fonction fléchée. Pas de bug (`select` lit la variable externe). Non renommé, hors étapes.
- `faq-ripple.js` : `masks()` relit trois rectangles à chaque image pendant une onde (layout forcé). Code imposé par l'étape 7, non modifié. À surveiller au parcours navigateur.
- Non vérifié : parcours navigateur (grille visible, onde au changement, aucun point sous le texte, console sans erreur). Aucun serveur lancé. À rejouer.
- Réglage après tests navigateur du coordinateur (`public/js/faq-ripple.js` seul) : GROW 1.1 → 1.6, PEAK_ALPHA 0.32 → 0.42, RING 22 → 40, CHANGE_MS 1500 → 1900, ENTRY_MS 2500 → 3000, easeOut `** 3` → `** 1.6`, extinction `fade = 1 - t` → `fade = 1 - t * t`. Masques, IDLE_ALPHA, DOT, GAP inchangés. Commentaire de RING « comme les projets » non mis à jour (les projets gardent 22). `npm run build` et `node --check` OK.
