# T703 — Hero : quatre classes de placement en position absolue

Statut : fait
Story : US-01 · Exigences : F-02, NF-08
Dépend de : T701, T702
Parallélisable : non
Exécutant : executor

## Objectif

Alex veut replacer lui-même le texte du hero, comme à l'origine (la mise en flux de T701 a légèrement déplacé les textes, au bureau comme sur mobile). On donne à chaque bloc de texte deux classes de placement en position absolue : un ensemble « bureau » (écrans de 48rem et plus) et un ensemble « mobile » (moins de 48rem), soit quatre classes : `hero-pos-desktop-1`, `hero-pos-desktop-2`, `hero-pos-mobile-1`, `hero-pos-mobile-2`. Le numéro 1 est le bloc « Alex / Développeur full stack », le numéro 2 est « Créateur d'application ». Chaque classe ne contient que `top` et `left` (bloc 1) ou `right` (bloc 2), en pourcentage du hero : Alex n'a qu'à changer ces nombres. Les valeurs par défaut reprennent le placement d'origine à 1440×900 (bureau) et la disposition mobile de 390×844. Les tailles de texte fluides de T701 sont conservées.

## Fichiers à lire

- `public/css/hero.css` — fichier à remplacer en entier
- `src/sections/hero.html`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/css/hero.css` | modifier (remplacer tout le contenu) | blocs en position absolue, quatre classes de placement |
| `src/sections/hero.html` | modifier | deux classes ajoutées sur chacun des deux blocs |

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

/* Calque des textes : les blocs y sont places en position absolue (cf. classes hero-pos-* plus bas) */
.hero-blocks {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.hero-block {
  position: absolute;
  width: max-content;
  max-width: 90%;
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

/* Retour a la ligne equilibre : evite un mot seul sur la derniere ligne */
.hero-block__role {
  text-wrap: balance;
}

.hero-block__subtitle {
  font-size: clamp(1.1rem, min(0.9rem + 1.2vw, 4vh), 1.8rem);
  font-weight: 400;
}

.hero-block-2 {
  text-align: right;
}

/* ==========================================================================
   PLACEMENT DU TEXTE : modifier uniquement les nombres ci-dessous.
   Deux ensembles de deux classes, poses sur les blocs dans src/sections/hero.html :
     - bureau (ecrans de 48rem et plus) : hero-pos-desktop-1 et hero-pos-desktop-2
     - mobile (moins de 48rem)          : hero-pos-mobile-1 et hero-pos-mobile-2
   Bloc 1 = « Alex / Developpeur full stack » (ancre en haut a gauche : top + left).
   Bloc 2 = « Createur d'application »        (ancre en haut a droite : top + right).
   Les nombres sont des pourcentages du hero : top = depuis le haut, left / right = depuis le bord.
   ========================================================================== */
@media (min-width: 48rem) {
  .hero-pos-desktop-1 {
    top: 5.2%;
    left: 13.7%;
  }

  .hero-pos-desktop-2 {
    top: 34.9%;
    right: 15.6%;
  }
}

@media (max-width: 47.9375rem) {
  .hero-pos-mobile-1 {
    top: 29.3%;
    left: 5.9%;
  }

  .hero-pos-mobile-2 {
    top: 52.9%;
    right: 5.9%;
  }
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

Le fichier peut être en CRLF : conserver ses fins de ligne (écrire le fichier par un script `node` si l'outil mélange les fins de ligne).

2. Dans `src/sections/hero.html`, remplacer exactement :

```html
      <div class="hero-block hero-block-1">
```

par :

```html
      <div class="hero-block hero-block-1 hero-pos-desktop-1 hero-pos-mobile-1">
```

puis remplacer exactement :

```html
      <div class="hero-block hero-block-2">
```

par :

```html
      <div class="hero-block hero-block-2 hero-pos-desktop-2 hero-pos-mobile-2">
```

3. Lancer ce contrôle (il ne doit afficher que `css ok`). Ne PAS lancer `npm run build` (je le fais moi-même).

```bash
node -e "const s = require('fs').readFileSync('public/css/hero.css', 'utf8'); const o = (s.match(/{/g) || []).length; const c = (s.match(/}/g) || []).length; if (o !== c) throw new Error(o + ' { pour ' + c + ' }'); for (const k of ['hero-pos-desktop-1', 'hero-pos-desktop-2', 'hero-pos-mobile-1', 'hero-pos-mobile-2']) if (!s.includes('.' + k + ' {')) throw new Error(k); console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `hero.css`, alors les quatre classes `hero-pos-desktop-1`, `hero-pos-desktop-2`, `hero-pos-mobile-1`, `hero-pos-mobile-2` existent, chacune ne contenant que `top` et `left` ou `right`.
- [ ] AC-02 : Étant donné `hero.html`, alors le premier bloc porte `hero-pos-desktop-1 hero-pos-mobile-1` et le second `hero-pos-desktop-2 hero-pos-mobile-2`.
- [ ] AC-03 : Étant donné `hero.css`, alors les règles de `.hero__scroll*`, `cta-ping` et `.hero__content` sont inchangées.

## Vérification

La commande de l'étape 3, puis l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 à AC-03.

Rendu navigateur : à rejouer par moi (comparaison avec le placement d'origine à 1440×900 et 390×844).

## Hors périmètre

- Ne pas modifier d'autre fichier, ni `docs/`, ni `public/index.html`.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>
