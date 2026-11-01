# T901 — Logo de l'IUT devant le portail enseignant

Statut : fait
Story : US-07, US-08 · Exigences : F-21, F-22
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T703)
Exécutant : executor

## Objectif

Le logo `public/img/logo/LogoIUT.png` (PNG RGBA 375×181, bleu sur fond clair ou transparent) s'affiche avant la mention « Espace enseignant » à deux endroits : en tête de la page des fiches (colonne de gauche) et en haut de la fenêtre de connexion. Les deux fonds étant sombres, le logo est posé sur une pastille Platinum rectangulaire (pas d'arrondi, comme le reste du site).

## Fichiers à lire

- `netlify/functions/lib/fiches-view.js` — `<header class="faq__head">` de `renderFichesScene`
- `src/sections/login-dialog.html`, `public/css/login-dialog.css`
- `public/css/fiches.css` — règle `.fiches__author` et commentaire `/* Panneau d'une fiche */`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/fiches-view.js` | modifier | pastille + logo avant l'eyebrow de la scène |
| `public/css/fiches.css` | modifier | style de la pastille de la scène |
| `src/sections/login-dialog.html` | modifier | pastille + logo avant l'eyebrow de la fenêtre |
| `public/css/login-dialog.css` | modifier | style de la pastille de la fenêtre |

## Étapes

1. Dans `netlify/functions/lib/fiches-view.js`, juste avant la ligne contenant `<span class="text-eyebrow">Espace enseignant</span>` (dans `<header class="faq__head">`), insérer, avec la même indentation que cette ligne :

```html
<span class="fiches__iut"><img src="/img/logo/LogoIUT.png" alt="IUT, Université de la Nouvelle-Calédonie" width="375" height="181" /></span>
```

2. Dans `public/css/fiches.css`, juste avant le commentaire `/* Panneau d'une fiche */`, ajouter :

```css
/* Logo de l'IUT : pastille claire, le logo etant bleu sur fond clair */
.fiches__iut {
  align-self: flex-start;
  display: inline-flex;
  padding: 0.5rem 0.75rem;
  background: var(--color-platinum);
}

.fiches__iut img {
  display: block;
  width: auto;
  height: 3.25rem;
}

```

3. Dans `src/sections/login-dialog.html`, juste avant la ligne contenant `<span class="text-eyebrow">Espace enseignant</span>`, insérer, avec la même indentation que cette ligne :

```html
<span class="login__iut"><img src="/img/logo/LogoIUT.png" alt="IUT, Université de la Nouvelle-Calédonie" width="375" height="181" /></span>
```

4. À la fin de `public/css/login-dialog.css`, après la dernière règle, ajouter une ligne vide puis :

```css
/* Logo de l'IUT : pastille claire, le logo etant bleu sur fond clair */
.login__iut {
  align-self: flex-start;
  display: inline-flex;
  padding: 0.5rem 0.75rem;
  background: var(--color-platinum);
}

.login__iut img {
  display: block;
  width: auto;
  height: 2.75rem;
}
```

5. Lancer `node --check netlify/functions/lib/fiches-view.js`. Ne PAS lancer `npm run build` (je le fais moi-même).
6. Lancer ce contrôle (il ne doit afficher que `logo ok`) :

```bash
node --input-type=module -e "const { renderFichesScene } = await import('./netlify/functions/lib/fiches-view.js'); const { fiches, author } = await import('./netlify/functions/lib/fiche-repository.js'); const html = renderFichesScene(fiches, author); const n = (html.match(/class=\"fiches__iut\"/g) || []).length; if (n !== 1) throw new Error('pastille : ' + n); if (html.indexOf('fiches__iut') > html.indexOf('text-eyebrow')) throw new Error('ordre'); const css = ['public/css/fiches.css', 'public/css/login-dialog.css'].map((f) => require('fs').readFileSync(f, 'utf8')); console.log('logo ok')" 2>&1 | tail -3
```

Si ce contrôle échoue à cause de `require` (module ES), utiliser à la place `import fs from 'node:fs'` ; ne pas modifier le reste.

## Critères d'acceptation

- [ ] AC-01 : Étant donné la scène des fiches rendue, alors elle contient une seule pastille `fiches__iut` avec `/img/logo/LogoIUT.png`, placée avant `text-eyebrow`.
- [ ] AC-02 : Étant donné `src/sections/login-dialog.html`, alors il contient une pastille `login__iut` avec le logo, placée avant `text-eyebrow`.
- [ ] AC-03 : Étant donné les deux feuilles de style, alors leurs accolades sont équilibrées et aucune autre règle n'a changé.

## Vérification

Étapes 5 et 6, puis l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-02 et AC-03.

Rendu navigateur : à rejouer par moi.

## Hors périmètre

- Ne pas modifier d'autre fichier, ni `docs/`, ni `public/index.html`, ni l'image.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>
