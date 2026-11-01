# T902 — Logo de l'IUT : plus grand, sans double cadre

Statut : fait
Story : US-07, US-08 · Exigences : F-21, F-22
Dépend de : T901
Parallélisable : non
Exécutant : executor

## Objectif

Au rendu, le logo de l'IUT est petit (texte « Université de la Nouvelle-Calédonie » illisible) et l'image porte son propre fond blanc, qui forme un double cadre avec la pastille Platinum. On agrandit le logo et on retire le remplissage de la pastille.

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/css/fiches.css` | modifier | règles `.fiches__iut` et `.fiches__iut img` |
| `public/css/login-dialog.css` | modifier | règles `.login__iut` et `.login__iut img` |

## Étapes

1. Dans `public/css/fiches.css`, dans la règle `.fiches__iut { ... }`, remplacer `padding: 0.5rem 0.75rem;` par `padding: 0;`. Dans la règle `.fiches__iut img { ... }`, remplacer `height: 3.25rem;` par `height: 4.5rem;`.
2. Dans `public/css/login-dialog.css`, dans la règle `.login__iut { ... }`, remplacer `padding: 0.5rem 0.75rem;` par `padding: 0;`. Dans la règle `.login__iut img { ... }`, remplacer `height: 2.75rem;` par `height: 3.75rem;`.
3. Mettre à jour le commentaire de chaque règle `.fiches__iut` / `.login__iut` : remplacer `/* Logo de l'IUT : pastille claire, le logo etant bleu sur fond clair */` par `/* Logo de l'IUT : l'image porte son propre fond clair */`.
4. Contrôle des accolades (il ne doit afficher que `css ok`) :

```bash
node -e "const fs = require('fs'); for (const f of ['public/css/fiches.css', 'public/css/login-dialog.css']) { const s = fs.readFileSync(f, 'utf8'); const o = (s.match(/{/g) || []).length; const c = (s.match(/}/g) || []).length; if (o !== c) throw new Error(f); } console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `fiches.css`, alors `.fiches__iut` a `padding: 0` et son image `height: 4.5rem`.
- [ ] AC-02 : Étant donné `login-dialog.css`, alors `.login__iut` a `padding: 0` et son image `height: 3.75rem`.

## Hors périmètre

- Ne modifier aucun autre fichier ni aucune autre règle. Ne pas committer.

## Notes d'exécution

- Étapes 1 à 4 appliquées telles quelles dans `public/css/fiches.css` et `public/css/login-dialog.css`. Contrôle d'accolades : `css ok`.
- Fond de la pastille (`background: var(--color-platinum)`) conservé : les étapes ne le retirent pas. Seul le padding est passé à 0. Si le double cadre persiste au rendu, le fond reste à trancher.
- Dépendance T901 : son fichier indique « à faire », mais son balisage est déjà dans le working tree (`netlify/functions/lib/fiches-view.js`, `src/sections/login-dialog.html`, `public/index.html`, `public/img/logo/LogoIUT.png`). Les sélecteurs ciblés existent.
- Pas de section Vérification dans la tâche : seul le contrôle d'accolades (étape 4) est lancé.
- `npm run build` non lancé : `scripts/build-index.js` réécrit `public/index.html`, hors périmètre. `package.json` n'a pas de script lint.
- Rendu navigateur non vérifié.
