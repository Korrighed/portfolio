# T701 — Hero responsive

Statut : fait
Story : US-01 · Exigences : NF-08, F-02
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T603, T604, T801)
Exécutant : executor

## Objectif

Les deux blocs de texte du hero sont posés en pixels absolus (`left: 190px`, `right: 216px`, `top: 125px`, hauteurs en %). Mesuré : à 1024×768 « Développeur full stack » et « Créateur d'application » se chevauchent ; de 768 px à 320 px de large, « Alex » et « Développeur full stack » sortent de l'écran à droite et se chevauchent ; en paysage (844×390) le texte chevauche le sous-titre et approche le bouton « Projets ».

On remplace le positionnement absolu par une mise en page en flux : un conteneur centré (72rem au plus) dont la hauteur fait grandir le hero, deux blocs décalés (le premier à gauche, « Créateur d'application » à droite en dessous), des tailles de texte fluides. Sur grand écran le rendu garde la composition actuelle (texte de 3,5 rem et 1,8 rem au maximum).

## Fichiers à lire

- `public/css/hero.css` — fichier à remplacer en entier
- `src/sections/hero.html` — le balisage ne change pas (classes `hero-blocks`, `hero-block`, `hero-block-1`, `hero-block-2`, `hero-block__portfolio`, `hero-block__name`, `hero-block__role`, `hero-block__subtitle`, `hero__scroll`)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/css/hero.css` | modifier (remplacer tout le contenu) | mise en page en flux et tailles fluides ; boutons `hero__scroll` inchangés |

## Étapes

1. Remplacer tout le contenu de `public/css/hero.css` par exactement :

```css
.hero {
  position: relative;
  min-height: calc(var(--vh-screen) * 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-ink-black);
}

/* Textes en flux : le hero grandit avec son contenu ; le bas est reserve au bouton « Projets » */
.hero-blocks {
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 6vh, 3.5rem);
  width: min(100%, 72rem);
  padding: var(--space-lg) clamp(1rem, 6vw, 3rem) 9.5rem;
}

.hero-block {
  color: var(--color-platinum);
  font-family: 'Libre Caslon Text', serif;
  line-height: 1.3;
}

/* Tailles fluides : plafonnees a 3,5 rem et 1,8 rem sur grand ecran, reduites par la hauteur sur ecran bas */
.hero-block__portfolio {
  display: flex;
  flex-direction: column;
  font-size: clamp(1.75rem, min(1.2rem + 3.5vw, 8vh), 3.5rem);
  font-style: italic;
}

.hero-block__name {
  align-self: flex-end;
}

.hero-block__subtitle {
  font-size: clamp(1.1rem, min(0.9rem + 1.2vw, 4vh), 1.8rem);
  font-weight: 400;
}

.hero-block-1 {
  align-self: flex-start;
  max-width: 100%;
}

.hero-block-2 {
  align-self: flex-end;
  text-align: right;
}

.hero__content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: var(--color-platinum);
  padding: var(--space-lg);
}

.hero__scroll {
  position: absolute;
  z-index: 3;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.hero__scroll-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.5rem;
  border-radius: 999px;
  background: var(--color-platinum);
  color: var(--color-ink-black);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: background 200ms, transform 200ms;
}

.hero__scroll-label::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 1px solid var(--color-powder-blue);
  opacity: 0;
}

.hero__scroll:hover .hero__scroll-label {
  background: var(--color-powder-blue);
}

.hero__scroll:active .hero__scroll-label {
  background: var(--color-powder-blue);
  transform: scale(0.94);
}

.hero__scroll:active .hero__scroll-label::after {
  animation: cta-ping 450ms ease-out;
}

@keyframes cta-ping {
  from {
    opacity: 0.6;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(1.35);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__scroll:active .hero__scroll-label::after {
    animation: none;
  }
}

.hero__scroll-line {
  width: 1px;
  height: 3.5rem;
  background: linear-gradient(var(--color-powder-blue), transparent);
}
```

Le fichier peut être en CRLF : conserver ses fins de ligne.

2. Lancer ce contrôle (il ne doit afficher que `css ok`) :

```bash
node -e "const s = require('fs').readFileSync('public/css/hero.css', 'utf8'); const o = (s.match(/{/g) || []).length; const c = (s.match(/}/g) || []).length; if (o !== c) throw new Error(o + ' { pour ' + c + ' }'); if (/\b(left|right|top): *\d+px/.test(s.split('.hero__scroll {')[0])) throw new Error('positions en pixels'); console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `hero.css`, alors `.hero-block-1` et `.hero-block-2` n'ont plus de position absolue ni de valeur en pixels pour `top`, `left`, `right`, `width` ou `height`.
- [ ] AC-02 : Étant donné `hero.css`, alors les règles de `.hero__scroll`, `.hero__scroll-label`, `.hero__scroll-line`, `cta-ping` sont inchangées.
- [ ] AC-03 : Étant donné `hero.css`, alors il ne contient plus de `@media (max-width: 48rem)` pour les blocs du hero (les tailles sont fluides).

## Vérification

La commande de l'étape 2. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 à AC-03.

Rendu navigateur : à rejouer par moi (de 1920×1080 à 320×568 et paysage 844×390). Je peux ajuster les valeurs après mesure.

## Hors périmètre

- Ne pas modifier `hero.html`, l'initialisation de Vanta, ni d'autre fichier.
- Ne pas committer.

## Notes d'exécution

- Fichier modifié : `public/css/hero.css` uniquement. `hero.html` et les autres fichiers non touchés.
- Fins de ligne CRLF conservées (135 lignes), comme avant la modification.
- Contrôle étape 2 : `css ok`.
- AC-01 : Grep sur `hero.css` ne trouve plus de `position: absolute` hors `.hero__scroll` et `.hero__scroll-label::after`, ni de valeur px pour `top`, `left`, `right`, `width`, `height` dans `.hero-block-1` / `.hero-block-2`.
- AC-02 : règles `.hero__content` à `.hero__scroll-line` et `cta-ping` identiques à `HEAD` (comparaison après normalisation CRLF).
- AC-03 : seul `@media (prefers-reduced-motion: reduce)` reste dans le fichier.
- Rendu navigateur (1920×1080 à 320×568, paysage 844×390) : non joué par l'exécuteur, à faire par l'utilisateur.
- Non commité.
