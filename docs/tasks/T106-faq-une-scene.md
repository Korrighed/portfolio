# T106 — Refaire la section FAQ en une scène d'un écran

Statut : à faire
Story : US-04 · Exigences : F-07, F-19, NF-07, T-19, T-20
Dépend de : T105
Parallélisable : non
Exécutant : executor

## Objectif

La section FAQ tient dans un seul écran (`100svh`), sans point ni motif de fond, sur fond Platinum. À gauche (≥ 64rem) : titre et liste des 5 questions. À droite : un panneau qui affiche la réponse de la question choisie, encadré par un losange ouvert à double trait (écho du logo). Le panneau change sur place, sans aucun décalage de mise en page. Sous 64rem, la liste devient 5 pastilles numérotées au-dessus du panneau. Sans JavaScript, les 5 réponses restent lisibles à la suite.

## Fichiers à lire

- `src/sections/faq.html` — version actuelle (à remplacer)
- `public/css/faq.css` — version actuelle (à remplacer)
- `src/index.template.html` — où ajouter le script
- `public/css/main.css` — variables `--space-*`, `--color-*`, `--font-mono`, `--font-display-family`, classe `.text-eyebrow`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/faq.html` | remplacer | nouvelle structure (en-tête, onglets, panneau) |
| `public/css/faq.css` | remplacer | nouveau style |
| `public/js/faq.js` | créer | onglets accessibles |
| `src/index.template.html` | modifier | une balise `<script type="module" src="/js/faq.js"></script>` |

## Étapes

1. Remplacer **tout** le contenu de `src/sections/faq.html` par exactement :

```html
  <section id="faq" class="faq" aria-labelledby="faq-title">
    <div class="section-divider">
      <div class="section-divider__inner">
        <div class="section-divider__line" aria-hidden="true">
          <span class="section-divider__marker"></span>
        </div>
      </div>
    </div>

    <div class="faq__stage">
      <header class="faq__head">
        <span class="text-eyebrow">02 — Questions</span>
        <h2 id="faq-title" class="faq__title">Questions fréquentes</h2>
      </header>

      <div class="faq__tabs">
<!-- faq:tabs -->
      </div>

      <div class="faq__plate">
        <svg class="faq__diamond" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <polyline class="faq__chev" points="38,6 50,0 62,6" />
          <polyline class="faq__chev faq__chev--in" points="41,9.5 50,3.5 59,9.5" />
          <polyline class="faq__chev" points="6,38 0,50 6,62" />
          <polyline class="faq__chev faq__chev--in" points="9.5,41 3.5,50 9.5,59" />
          <polyline class="faq__chev" points="94,38 100,50 94,62" />
          <polyline class="faq__chev faq__chev--in" points="90.5,41 96.5,50 90.5,59" />
          <polyline class="faq__chev" points="38,94 50,100 62,94" />
          <polyline class="faq__chev faq__chev--in" points="41,90.5 50,96.5 59,90.5" />
        </svg>
        <div class="faq__panels">
<!-- faq:panels -->
        </div>
      </div>
    </div>
  </section>
```

Les deux marqueurs `<!-- faq:tabs -->` et `<!-- faq:panels -->` restent seuls sur leur ligne, sans indentation.

2. Remplacer **tout** le contenu de `public/css/faq.css` par exactement :

```css
/* Separateur entre projets et FAQ */
.section-divider {
  background: var(--color-ink-black-3);
  padding: 2rem 0;
}

.section-divider__inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.section-divider__line {
  position: relative;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-yale-blue) 12%, var(--color-yale-blue) 88%, transparent);
}

.section-divider__marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%) rotate(45deg);
  background: var(--color-ink-black);
  border: 1px solid var(--color-powder-blue);
}

/* ---------- FAQ : une scene d'un ecran, fond uni (aucun point) ---------- */
.faq {
  --faq-vh: 100vh;
  display: flex;
  flex-direction: column;
  min-height: var(--faq-vh);
  background: var(--color-platinum);
}

@supports (height: 100svh) {
  .faq {
    --faq-vh: 100svh;
  }
}

.faq :focus-visible {
  outline: 2px solid var(--color-yale-blue);
  outline-offset: 3px;
}

.faq__stage {
  flex: 1;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: var(--space-lg);
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-sm) var(--space-md);
  align-content: center;
}

.faq__head {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.faq__title {
  margin: 0;
  font: 700 clamp(2rem, 4vw, 3.25rem) / 1.1 var(--font-display-family);
}

/* Onglets : caches sans JavaScript (les reponses restent a la suite) */
.faq__tabs {
  display: none;
}

.faq.is-tabs .faq__tabs {
  grid-column: 1 / -1;
  display: flex;
  gap: var(--space-xs);
}

.faq__tab {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: none;
  border: 1px solid var(--color-powder-blue);
  color: var(--color-yale-blue);
  font: inherit;
  cursor: pointer;
}

.faq__tab:hover {
  border-color: var(--color-yale-blue);
}

.faq__tab[aria-selected='true'] {
  background: var(--color-yale-blue);
  border-color: var(--color-yale-blue);
  color: var(--color-platinum);
}

.faq__num {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.faq__num::before {
  content: '';
  display: none;
}

/* Sous 64rem le libelle n'est lu que par les lecteurs d'ecran */
.faq__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Panneau + losange ouvert */
.faq__plate {
  position: relative;
  grid-column: 1 / -1;
  padding: var(--space-lg) 12%;
}

.faq__diamond {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.faq__chev {
  fill: none;
  stroke: var(--color-yale-blue);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.faq__chev--in {
  stroke: var(--color-powder-blue);
  stroke-width: 2;
}

/* Sans JavaScript : toutes les reponses a la suite */
.faq__panels {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.faq__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* Avec JavaScript : les panneaux sont empiles dans la meme cellule, la hauteur du
   panneau est celle de la reponse la plus longue : rien ne bouge au changement. */
.faq.is-tabs .faq__panels {
  display: grid;
}

.faq.is-tabs .faq__panel {
  grid-area: 1 / 1;
  visibility: hidden;
  opacity: 0;
}

.faq.is-tabs .faq__panel.is-active {
  visibility: visible;
  opacity: 1;
}

.faq__count {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.14em;
  color: var(--color-yale-blue);
}

.faq__q {
  margin: 0;
  font: 700 1.5rem / 1.2 var(--font-display-family);
}

.faq__a {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-slate-dark);
}

@media (prefers-reduced-motion: no-preference) {
  .faq__tab {
    transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .faq.is-tabs .faq__panel {
    filter: blur(6px);
    transition: opacity 300ms ease, filter 300ms ease, visibility 0s linear 300ms;
  }

  .faq.is-tabs .faq__panel.is-active {
    filter: none;
    transition-delay: 0s;
  }
}

/* Deux colonnes : liste a gauche, panneau a droite (grille 12 colonnes, comme les scenes) */
@media (min-width: 64rem) {
  .faq__head {
    grid-column: 1 / span 5;
  }

  .faq.is-tabs .faq__tabs {
    grid-column: 1 / span 5;
    grid-row: 2;
    flex-direction: column;
    gap: 0;
  }

  .faq__plate {
    grid-column: 7 / span 6;
    grid-row: 1 / span 2;
    align-self: center;
    padding: var(--space-xl) clamp(3rem, 10%, 5rem);
  }

  .faq__tab {
    grid-template-columns: 3rem 1fr;
    place-items: normal;
    align-items: baseline;
    width: 100%;
    height: auto;
    min-height: 44px;
    padding: var(--space-sm) 0;
    background: none;
    border: 0;
    border-top: 1px solid var(--color-powder-blue);
    color: var(--color-slate-dark);
    text-align: left;
  }

  .faq__tab:last-child {
    border-bottom: 1px solid var(--color-powder-blue);
  }

  .faq__tab:hover {
    color: var(--color-ink-black);
  }

  .faq__tab[aria-selected='true'] {
    background: none;
    border-top-color: var(--color-yale-blue);
    color: var(--color-ink-black);
  }

  .faq__num {
    color: var(--color-yale-blue);
  }

  .faq__num::before {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 0.5rem;
    border: 1.5px solid currentColor;
    transform: rotate(45deg);
    vertical-align: middle;
    opacity: 0;
  }

  .faq__tab[aria-selected='true'] .faq__num::before {
    opacity: 1;
  }

  .faq__label {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip-path: none;
    white-space: normal;
    font-size: 1rem;
    line-height: 1.35;
    font-weight: 500;
  }

  .faq__q {
    font-size: clamp(1.5rem, 2.4vw, 2.125rem);
  }

  .faq__a {
    font-size: 1.0625rem;
    line-height: 1.7;
  }
}

/* Ecran bas : on compacte pour que tout tienne sans defilement */
@media (min-width: 64rem) and (max-height: 800px) {
  .faq__stage {
    padding-block: var(--space-md);
  }

  .faq__plate {
    padding-block: var(--space-lg);
  }

  .faq__tab {
    padding-block: 0.75rem;
  }

  .faq__a {
    font-size: 1rem;
    line-height: 1.6;
  }
}

@media (max-width: 63.99rem) and (max-height: 800px) {
  .faq__stage {
    padding-block: var(--space-sm);
  }

  .faq__plate {
    padding-block: var(--space-md);
  }

  .faq__q {
    font-size: 1.375rem;
  }

  .faq__a {
    font-size: 0.9375rem;
    line-height: 1.55;
  }
}

@media (max-width: 48rem) {
  .faq__stage {
    padding-inline: var(--space-sm);
  }
}
```

3. Créer `public/js/faq.js` avec exactement :

```js
// Section FAQ : un onglet par question ; la reponse change sur place (aucun decalage).
// Sans JavaScript, les cinq reponses restent visibles a la suite.
const section = document.querySelector('#faq');

if (section) {
  const list = section.querySelector('.faq__tabs');
  const tabs = [...section.querySelectorAll('.faq__tab')];
  const panels = [...section.querySelectorAll('.faq__panel')];

  if (list && tabs.length > 0 && tabs.length === panels.length) {
    section.classList.add('is-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Questions fréquentes');

    const wide = window.matchMedia('(min-width: 64rem)');
    const syncOrientation = () => list.setAttribute('aria-orientation', wide.matches ? 'vertical' : 'horizontal');
    syncOrientation();
    wide.addEventListener('change', syncOrientation);

    tabs.forEach((tab, index) => {
      tab.id = `faq-tab-${index + 1}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => select(index, false));
    });

    function select(index, focus) {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].classList.toggle('is-active', on);
      });
      if (focus) tabs[index].focus();
    }

    list.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      const last = tabs.length - 1;
      let next = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = current === last ? 0 : current + 1;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = current === 0 ? last : current - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = last;
      if (next === null) return;
      event.preventDefault();
      select(next, true);
    });

    select(0, false);
  }
}
```

4. Dans `src/index.template.html`, juste après la ligne `<script type="module" src="/js/projets-scroll.js"></script>`, ajouter une ligne vide puis `  <script type="module" src="/js/faq.js"></script>` (deux espaces d'indentation comme les scripts voisins).
5. Lancer `npm run build`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `public/index.html`, alors il contient 5 `class="faq__tab"`, 5 `class="faq__panel"`, 8 `faq__chev` et `src="/js/faq.js"`, et ne contient plus `faq__item`, `faq__list` ni de marqueur `faq:`.
- [ ] AC-02 : Étant donné `public/css/faq.css`, alors il ne contient ni `radial-gradient`, ni `background-image`, ni `background-size`.
- [ ] AC-03 : Étant donné le build, alors `npm run build` réussit et `node --check public/js/faq.js` ne signale aucune erreur.
- [ ] AC-04 : Étant donné `public/js/faq.js`, alors il pose `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` et gère les touches ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home et End.

## Vérification

```bash
npm run build
node --check public/js/faq.js
```

Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 et AC-02.

Parcours navigateur : à rejouer par moi après la tâche (1280×720, 1024×768, 390×844 : la section tient dans l'écran, une réponse à la fois, rien ne bouge au changement d'onglet, clavier fonctionnel).

## Hors périmètre

- Ne pas modifier `scripts/build-index.js`, `src/data/faq.json`, les autres sections ni leurs feuilles de style.
- Ne pas ajouter de fond de points, de dégradé ni d'image.
- Ne pas modifier le texte des questions et des réponses.
- Ne pas committer.

## Notes d'exécution

- Prérequis T105 vérifié : `scripts/build-index.js` produit les marqueurs `faq:tabs` et `faq:panels`.
- Étapes 1 à 4 appliquées à la lettre : `src/sections/faq.html` et `public/css/faq.css` remplacés, `public/js/faq.js` créé, script ajouté dans `src/index.template.html` après `projets-scroll.js`.
- Étape 5 : `npm run build` réussi. Le build régénère `public/index.html` (sortie attendue, hors « Fichiers cibles » mais requise par AC-01).
- `node --check public/js/faq.js` : aucune erreur.
- AC-01 (Grep sur `public/index.html`) : 5 `class="faq__tab"`, 5 `class="faq__panel"`, 8 `faq__chev`, `src="/js/faq.js"` présent ; `faq__item`, `faq__list` et `faq:` absents.
- AC-02 (Grep sur `public/css/faq.css`) : aucun `radial-gradient`, `background-image`, `background-size`.
- AC-04 (Grep sur `public/js/faq.js`) : `tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`, ArrowUp/Down/Left/Right, Home, End présents.
- `package.json` ne définit pas de script `lint` : non exécuté.
- Point à arbitrer : `.section-divider__line` garde un `linear-gradient`. Il est repris tel quel de la tâche et existait déjà dans l'ancien `faq.css`. Si la règle « aucun dégradé » vise aussi ce séparateur, à trancher.
- Parcours navigateur (1280×720, 1024×768, 390×844) non exécuté : à rejouer par l'utilisateur.
- Rien committé.
