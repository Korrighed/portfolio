# T1102 — Configuration statique : Permissions-Policy, robots.txt, noindex, meta

Statut : fait
Story : US-04 · Exigences : NF-04, NF-09
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T1101)
Exécutant : executor

## Objectif

Pages statiques : ajouter `Permissions-Policy` aux en-têtes de `netlify.toml`, un `robots.txt` qui écarte l'espace enseignant et l'API, `noindex` sur `login.html`, et deux balises meta (`og:site_name`, `theme-color`) sur l'accueil.

## Fichiers à lire

- `netlify.toml` — bloc `[[headers]]`
- `public/login.html`, `src/index.template.html`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify.toml` | modifier | une ligne d'en-tête |
| `public/robots.txt` | créer | règles d'exploration |
| `public/login.html` | modifier | une balise meta |
| `src/index.template.html` | modifier | deux balises meta |

## Étapes

1. Dans `netlify.toml`, juste après la ligne `    X-Frame-Options = "DENY"`, ajouter :

```toml
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"
```

2. Créer `public/robots.txt` avec exactement :

```
User-agent: *
Disallow: /api/
Disallow: /fiches-reflexives
Disallow: /login.html
```

3. Dans `public/login.html`, juste après la ligne contenant `<meta name="viewport" content="width=device-width, initial-scale=1" />`, ajouter (même indentation) :

```html
<meta name="robots" content="noindex" />
```

4. Dans `src/index.template.html`, juste après la ligne contenant `<meta property="og:description"`, ajouter (même indentation, 2 espaces) :

```html
  <meta property="og:site_name" content="korrighed.dev" />
  <meta name="theme-color" content="#f0f4ef" />
```

5. Ne PAS lancer `npm run build`. Lancer ce contrôle (il ne doit afficher que `statique ok`) :

```bash
node -e "const fs = require('fs'); const need = [['netlify.toml', 'Permissions-Policy = \"camera=(), microphone=(), geolocation=(), payment=()\"'], ['public/robots.txt', 'Disallow: /fiches-reflexives'], ['public/login.html', '<meta name=\"robots\" content=\"noindex\" />'], ['src/index.template.html', 'og:site_name'], ['src/index.template.html', 'theme-color']]; for (const [f, t] of need) if (!fs.readFileSync(f, 'utf8').includes(t)) throw new Error(f + ' : ' + t); console.log('statique ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `netlify.toml`, alors `Permissions-Policy` figure dans le bloc `[[headers]]` de `/*`, sans autre changement.
- [ ] AC-02 : Étant donné `public/`, alors `robots.txt` écarte `/api/`, `/fiches-reflexives` et `/login.html`.
- [ ] AC-03 : Étant donné `login.html` et le gabarit de l'accueil, alors `noindex`, `og:site_name` et `theme-color` sont présents.

## Hors périmètre

- Ne pas modifier `public/index.html` (généré), `netlify/functions/`, ni `docs/`. Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>

- Étapes 1 à 4 appliquées telles quelles. Diff : 4 lignes ajoutées dans 3 fichiers, `public/robots.txt` créé.
- Contrôle de l'étape 5 : `statique ok`. `npm run build` non lancé.
- Point à arbitrer : `robots.txt` interdit `/login.html` alors que `login.html` porte `noindex`. Google Search Central indique qu'une page bloquée par robots.txt ne voit pas sa balise noindex et peut rester indexée si un lien externe la pointe (de mémoire, non revérifié). Appliqué tel quel selon la consigne.
- `public/index.html` apparaît modifié dans git (`og:site_name` et `theme-color`, deux lignes). T1102 ne l'a pas touché. Origine inconnue, à vérifier. Non restauré.
