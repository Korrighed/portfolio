# T1201 — URL du site : canonical, og:url, sitemap et robots.txt

Statut : fait
Story : US-04 · Exigences : NF-09
Dépend de : T1102
Parallélisable : non
Exécutant : executor

## Objectif

Le nom de domaine du site est pour l'instant `https://kaporfolio.netlify.app`, et il changera plus tard. Une seule constante `SITE_URL` (variable d'environnement `SITE_URL`, valeur par défaut `https://kaporfolio.netlify.app`, sans barre finale) alimente, à chaque build : `<link rel="canonical">` et `og:url` de l'accueil (via le marqueur `%SITE_URL%` du gabarit), `public/sitemap.xml` (accueil et mentions légales) et la ligne `Sitemap:` de `public/robots.txt`. Le jour du changement de domaine, il suffit de poser `SITE_URL` dans les variables Netlify.

## Fichiers à lire

- `scripts/build-index.js` — `buildIndex`, constantes de chemins
- `src/index.template.html` — balises `og:*`
- `README.md` — section de distribution

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `scripts/build-index.js` | modifier | `SITE_URL`, génération de `sitemap.xml` et `robots.txt`, remplacement de `%SITE_URL%` |
| `src/index.template.html` | modifier | `og:url` et `canonical` |
| `README.md` | modifier | une ligne sur `SITE_URL` |

## Étapes

1. Dans `scripts/build-index.js`, remplacer exactement la ligne :

```js
const faqPath = join(root, 'src', 'data', 'faq.json');
```

par :

```js
const faqPath = join(root, 'src', 'data', 'faq.json');
const sitemapPath = join(root, 'public', 'sitemap.xml');
const robotsPath = join(root, 'public', 'robots.txt');

// Domaine du site : variable SITE_URL (variables Netlify) ; domaine Netlify par defaut, sans barre finale.
const SITE_URL = (process.env.SITE_URL || 'https://kaporfolio.netlify.app').replace(/\/+$/, '');
```

2. Dans le même fichier, juste avant la ligne `// Marqueurs <!-- faq:xxx --> : chacun doit exister dans les sources, une seule fois.`, ajouter (avec une ligne vide après) :

```js
export function renderSitemap(siteUrl) {
  const pages = ['/', '/mentions-legales.html'];
  const urls = pages.map((page) => `  <url><loc>${siteUrl}${page}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobots(siteUrl) {
  return `User-agent: *\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

```

3. Dans `buildIndex`, remplacer exactement :

```js
      return faqSlots[key](faq);
    });
```

par :

```js
      return faqSlots[key](faq);
    })
    .replace(/%SITE_URL%/g, SITE_URL);
```

puis remplacer exactement :

```js
  writeFileSync(outPath, html);
  return outPath;
```

par :

```js
  writeFileSync(outPath, html);
  writeFileSync(sitemapPath, renderSitemap(SITE_URL));
  writeFileSync(robotsPath, renderRobots(SITE_URL));
  return outPath;
```

et remplacer la ligne `  console.log('public/index.html genere depuis src/');` par `  console.log('public/index.html, sitemap.xml et robots.txt generes depuis src/');`.

4. Dans `src/index.template.html`, juste après la ligne contenant `<meta property="og:site_name"`, ajouter (indentation de 2 espaces) :

```html
  <meta property="og:url" content="%SITE_URL%/" />
  <link rel="canonical" href="%SITE_URL%/" />
```

5. Dans `README.md`, dans le tableau de commandes, juste après la ligne de `npm run build` (celle qui commence par `| \`npm run build\``), ajouter une ligne :

```
| `SITE_URL` (variable, optionnelle) | Domaine du site, défaut `https://kaporfolio.netlify.app` : alimente `canonical`, `og:url`, `sitemap.xml` et `robots.txt` à chaque build. À poser dans les variables Netlify quand le domaine change |
```

6. Lancer `node --check scripts/build-index.js`, puis ce contrôle (il ne doit afficher que `url ok`) :

```bash
node -e "const { execSync } = require('child_process'); const fs = require('fs'); const run = (env) => execSync('node scripts/build-index.js', { env: { ...process.env, ...env }, stdio: 'pipe' }); run({ SITE_URL: 'https://exemple.test/' }); let html = fs.readFileSync('public/index.html', 'utf8'); if (!html.includes('<link rel=\"canonical\" href=\"https://exemple.test/\" />') || !html.includes('og:url\" content=\"https://exemple.test/\"')) throw new Error('canonical personnalise'); if (!fs.readFileSync('public/sitemap.xml', 'utf8').includes('<loc>https://exemple.test/mentions-legales.html</loc>')) throw new Error('sitemap personnalise'); if (!fs.readFileSync('public/robots.txt', 'utf8').includes('Sitemap: https://exemple.test/sitemap.xml')) throw new Error('robots personnalise'); run({ SITE_URL: '' }); html = fs.readFileSync('public/index.html', 'utf8'); if (!html.includes('<link rel=\"canonical\" href=\"https://kaporfolio.netlify.app/\" />')) throw new Error('canonical par defaut'); if (html.includes('%SITE_URL%')) throw new Error('marqueur restant'); const robots = fs.readFileSync('public/robots.txt', 'utf8'); if (robots !== 'User-agent: *\nDisallow: /api/\n\nSitemap: https://kaporfolio.netlify.app/sitemap.xml\n') throw new Error('robots par defaut : ' + JSON.stringify(robots)); console.log('url ok')"
```

Le dernier build du contrôle utilise la valeur par défaut : les fichiers générés restent donc ceux du domaine `kaporfolio.netlify.app`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné le build sans variable, alors `public/index.html` contient `<link rel="canonical" href="https://kaporfolio.netlify.app/" />` et `og:url` identique, sans marqueur `%SITE_URL%`.
- [ ] AC-02 : Étant donné `SITE_URL=https://exemple.test/`, alors `index.html`, `sitemap.xml` et `robots.txt` utilisent `https://exemple.test` sans double barre.
- [ ] AC-03 : Étant donné `public/robots.txt`, alors il contient `Disallow: /api/` et la ligne `Sitemap:` du domaine courant.

## Hors périmètre

- Ne pas modifier `public/mentions-legales.html`, `login.html`, `netlify.toml`, ni `docs/`. Ne pas committer.

## Notes d'exécution

- Étapes 1 à 5 appliquées dans l'ordre. Chaque ancre trouvée une seule fois, fins de ligne LF.
- Aucun `CLAUDE.md` à la racine du projet (seul `node_modules/hot-shots/CLAUDE.md` existe) : conventions suivies d'après le code.
- Étape 6 : `node --check scripts/build-index.js` ok ; contrôle `url ok`.
- Effets de bord du build, hors « Fichiers cibles » mais produits par le script : `public/index.html` (+2 lignes), `public/robots.txt` (ligne vide + ligne `Sitemap:`), `public/sitemap.xml` (créé).
- AC-01 à AC-03 : contrôle étape 6, puis inspection de `public/index.html`, `public/sitemap.xml` et `public/robots.txt` après le dernier build (domaine par défaut).
- La tâche n'a pas de section « Vérification » : ni lint ni build supplémentaire.
- Statut laissé à « à faire ». Rien commité.
- `docs/tasks/T1301-lien-github-menu.md` est apparu pendant l'exécution (non créé ni touché par l'exécuteur).
