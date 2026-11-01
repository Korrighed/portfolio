# T602 — Espace enseignant : en-tête et pied de page clairs, bouton PDF en avant

Statut : fait
Story : US-08 · Exigences : F-22, NF-07
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T601 ; le contrat est la liste des classes de T601)
Exécutant : executor

## Objectif

Styler le balisage produit par T601 : en-tête clair (même aspect que la barre de l'accueil), pied de page clair et compact, scène sombre qui occupe toute la hauteur libre entre les deux, et lien PDF en grand bouton plein (Powder Blue sur la scène sombre), l'action principale de chaque fiche.

## Fichiers à lire

- `public/css/fiches.css` — fichier à remplacer en entier
- `public/css/nav.css`, `public/css/footer.css`, `public/css/faq.css` (jetons `--faq-*`), `public/css/main.css` (jetons `--color-*`, `--space-*`, `--vh-screen`)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/css/fiches.css` | modifier (remplacer tout le contenu) | en-tête, pied de page, mise en page en colonne, bouton PDF |
| `public/css/footer.css` | modifier | ajout du modificateur `.site-footer--light` en fin de fichier |

## Étapes

1. Remplacer tout le contenu de `public/css/fiches.css` par exactement :

```css
/* Espace enseignant : fiches reflexives. Reprend la scene a onglets de la FAQ (faq.css)
   en version sombre (.faq--dark), entre un en-tete et un pied de page clairs.
   Chargee apres nav.css, footer.css et faq.css. */
body.espace {
  display: flex;
  flex-direction: column;
  min-height: var(--vh-screen);
  background: var(--color-ink-black);
  color: var(--color-platinum);
}

/* main.css limite <main> a 48rem : la scene prend toute la largeur et toute la hauteur
   libre entre l'en-tete et le pied de page */
.espace__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  max-width: none;
  margin: 0;
  padding: 0;
}

.espace .faq {
  flex: 1;
  min-height: 0;
}

/* En-tete clair : meme marque que l'accueil ; les liens restent visibles sur mobile (pas de menu replie) */
.espace .nav__inner {
  flex-wrap: nowrap;
  gap: var(--space-sm);
}

.espace .espace__menu {
  display: block;
  width: auto;
}

.espace .nav__menu ul {
  flex-direction: row;
  align-items: center;
  gap: var(--space-md);
  padding: 0;
}

.espace .nav__menu a,
.espace__logout {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}

.espace__logout {
  padding: 0;
  background: none;
  border: 0;
  color: var(--color-yale-blue);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.espace__logout:hover {
  color: var(--color-ink-black);
}

.espace .nav :focus-visible {
  outline: 2px solid var(--color-yale-blue);
  outline-offset: 3px;
}

/* Pied de page clair et compact */
.espace .site-footer__inner {
  padding-block: var(--space-sm);
}

/* En-tete de la scene : auteur et formation */
.fiches__author {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--faq-muted);
}

/* Panneau d'une fiche */
.fiche__sub {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  font-style: italic;
  color: var(--faq-muted);
}

/* Action principale de la page : ouvrir le PDF de la fiche */
.fiche__cta {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-sm);
  min-height: 56px;
  padding: 0.75rem 1.25rem;
  background: var(--faq-accent);
  border: 1px solid var(--faq-accent);
  color: var(--faq-on-accent);
  text-decoration: none;
}

.fiche__cta:hover {
  background: var(--faq-fg);
  border-color: var(--faq-fg);
}

.fiche__cta-icon {
  flex: none;
}

.fiche__cta-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  line-height: 1.25;
}

.fiche__cta-label {
  font-size: 1.0625rem;
  font-weight: 600;
}

.fiche__cta-meta {
  font-size: 0.75rem;
}

.fiche__cta-arrow {
  margin-left: auto;
  padding-left: var(--space-xs);
  font-size: 1.25rem;
  line-height: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .fiche__cta {
    transition: background-color 200ms ease, border-color 200ms ease;
  }

  .fiche__cta-arrow {
    transition: transform 200ms ease;
  }

  .fiche__cta:hover .fiche__cta-arrow {
    transform: translate(2px, -2px);
  }
}

.fiche__cols {
  display: grid;
  gap: var(--space-md);
}

.fiche__h {
  margin: 0 0 var(--space-xs);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--faq-accent);
}

.fiche__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--faq-muted);
}

.fiche__list li {
  position: relative;
  padding-left: 1.25rem;
}

/* Puce : petit losange creux, clin d'oeil au logo */
.fiche__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 6px;
  height: 6px;
  border: 1.5px solid var(--faq-accent);
  transform: rotate(45deg);
}

/* Les competences sont l'information principale */
.fiche__block--skills .fiche__list {
  font-size: 1rem;
  color: var(--faq-fg);
}

.fiche__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 var(--space-md);
  margin: 0;
  font-size: 0.875rem;
  color: var(--faq-muted);
}

.fiche__status {
  color: var(--faq-fg);
}

.fiche__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 600;
  color: var(--faq-fg);
  text-decoration: underline;
  text-decoration-color: var(--faq-accent);
  text-underline-offset: 0.3em;
}

.fiche__link:hover {
  color: var(--faq-accent);
}

@media (max-width: 48rem) {
  .espace .nav__inner {
    padding-inline: var(--space-sm);
  }

  .fiche__cta {
    align-self: stretch;
  }
}

/* Tres petit ecran : la marque garde le logo seul (il reste le lien vers l'accueil) pour laisser la place aux liens */
@media (max-width: 30rem) {
  .espace .nav__brand span {
    display: none;
  }
}

/* Menu a gauche (colonnes 1 a 4), fiche a droite (colonnes 5 a 12), deux colonnes de contenu */
@media (min-width: 64rem) {
  .espace .faq__head {
    grid-column: 1 / span 4;
  }

  .espace .faq.is-tabs .faq__tabs {
    grid-column: 1 / span 4;
  }

  .espace .faq__plate {
    grid-column: 5 / span 8;
    padding-inline-start: var(--space-lg);
  }

  .fiche__cols {
    grid-template-columns: 1fr 1fr;
  }
}
```

2. À la fin de `public/css/footer.css`, après la dernière règle, ajouter une ligne vide puis exactement :

```css
/* Variante claire (espace enseignant) : meme aspect que la barre de navigation */
.site-footer--light {
  background: var(--color-platinum);
  border-top-color: var(--color-powder-blue);
  color: var(--color-yale-blue);
}

.site-footer--light .site-footer__brand {
  color: var(--color-ink-black);
}

.site-footer--light .site-footer__links a {
  color: var(--color-yale-blue);
}

.site-footer--light .site-footer__links a:hover {
  color: var(--color-ink-black);
}
```

Le fichier peut être en CRLF : conserver ses fins de ligne.

3. Contrôler que les accolades sont équilibrées dans les deux fichiers (il ne doit afficher que `css ok`) :

```bash
node -e "const fs = require('fs'); for (const f of ['public/css/fiches.css', 'public/css/footer.css']) { const s = fs.readFileSync(f, 'utf8'); const o = (s.match(/{/g) || []).length; const c = (s.match(/}/g) || []).length; if (o !== c) throw new Error(f + ' : ' + o + ' { pour ' + c + ' }'); } if (/espace__bar|espace__links|--espace-bar-h/.test(fs.readFileSync('public/css/fiches.css', 'utf8'))) throw new Error('anciennes regles'); console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `fiches.css`, alors il ne contient plus `espace__bar`, `espace__links` ni `--espace-bar-h`, et contient `.fiche__cta`, `.espace__logout` et `.espace__main`.
- [ ] AC-02 : Étant donné `footer.css`, alors il contient `.site-footer--light` et les règles existantes (`.site-footer`, `.site-footer__inner`) n'ont pas changé.
- [ ] AC-03 : Étant donné les deux fichiers, alors les accolades sont équilibrées (étape 3).

## Vérification

La commande de l'étape 3. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 et AC-02.

Rendu navigateur : à rejouer par moi (1280×720, 1024×768, 390×844).

## Hors périmètre

- Ne pas modifier `faq.css`, `nav.css`, `main.css`, ni de fichier JavaScript.
- Ne pas modifier le balisage (T601) ni les fichiers sous `docs/`.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>

- `fiches.css` remplacé en entier (LF, comme avant) ; contenu identique au bloc de l'étape 1.
- `footer.css` : 19 lignes ajoutées en fin de fichier, CRLF conservé, aucune ligne existante modifiée.
- Étape 3 : `css ok`. AC-01 et AC-02 vérifiés (Grep, `git diff`).
- `npm run build` non lancé : absent de la Vérification ; `scripts/build-index.js` écrit un fichier. `package.json` n'a pas de script `lint`.
- Rendu navigateur (1280×720, 1024×768, 390×844) : non fait, à rejouer.
- Observation : T601 garde la classe `espace__bar` sur le `<header>` ; aucune règle ne la cible (AC-01 l'interdit), donc sans effet.
