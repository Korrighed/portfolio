# T1401 — Scripts hébergés dans le projet, CSP sans script en ligne, og:image

Statut : fait
Story : US-04 · Exigences : NF-04, NF-05, NF-09, T-08, T-12
Dépend de : aucune (les fichiers `public/vendor/*` et `public/img/og-image.png` sont déjà dans le dépôt)
Parallélisable : non
Exécutant : executor

## Objectif

Three.js et Vanta sont désormais dans `public/vendor/` (copiés depuis jsDelivr). Le site ne charge donc plus aucun script d'un CDN, et les quatre scripts en ligne (drapeau `js`, initialisation de Vanta, deux scripts de `login.html`) passent dans des fichiers : la CSP peut retirer `'unsafe-inline'` de `script-src` et supprimer jsDelivr. Le script de `login.html` qui affichait le message d'erreur est du code mort : `login.html` redirige vers l'accueil dès qu'il y a du JavaScript, et sans JavaScript ce script ne s'exécute pas ; il est supprimé avec le paragraphe qu'il pilotait. En plus : l'image `public/img/og-image.png` (1200×630) devient l'aperçu de partage (`og:image`).

## Fichiers à lire

- `src/index.template.html` — balises `og:*`, scripts de fin de page
- `src/sections/projets.html` — script en ligne en tête de section
- `public/login.html`, `netlify.toml` (bloc `[[headers]]`)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/js/js-flag.js` | créer | pose la classe `js` |
| `public/js/hero-vanta.js` | créer | initialisation de Vanta |
| `public/js/login-redirect.js` | créer | redirection de `login.html` |
| `src/sections/projets.html` | modifier | script en ligne remplacé par un fichier |
| `src/index.template.html` | modifier | scripts locaux, balises `og:image` |
| `public/login.html` | modifier | scripts en ligne retirés |
| `netlify.toml` | modifier | CSP sans `'unsafe-inline'` en `script-src`, sans jsDelivr |

## Étapes

1. Créer `public/js/js-flag.js` avec exactement :

```js
// Pose avant le premier projet : les etapes ne sont masquees que si le JS tourne.
document.documentElement.classList.add('js');
```

2. Créer `public/js/hero-vanta.js` avec exactement :

```js
// Fond du hero : points animes (Vanta « dots »). Charge apres three.min.js et vanta.dots.min.js (public/vendor/).
if (typeof VANTA !== 'undefined') {
  VANTA.DOTS({
    el: '#hero',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0xb4cded, // Powder Blue
    color2: 0x344966, // Yale Blue
    backgroundColor: 0x0d1821, // Ink Black
    size: 6.3,
    spacing: 34.0,
    showLines: false,
  });
}
```

3. Créer `public/js/login-redirect.js` avec exactement :

```js
// Avec JavaScript : la connexion se fait dans la fenetre de l'accueil.
location.replace('/?connexion=1');
```

4. Dans `src/sections/projets.html`, remplacer exactement les deux lignes :

```html
    <!-- Pose avant le premier projet : les etapes ne sont masquees que si le JS tourne. -->
    <script>document.documentElement.classList.add('js');</script>
```

par :

```html
    <script src="/js/js-flag.js"></script>
```

5. Dans `src/index.template.html`, remplacer tout le bloc, de la ligne `<script src="https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js"></script>` jusqu'à la ligne `</script>` qui ferme l'appel `VANTA.DOTS({ ... });` incluse (la dernière balise de script avant `</body>`), par exactement :

```html
  <script src="/vendor/three.min.js"></script>
  <script src="/vendor/vanta.dots.min.js"></script>
  <script src="/js/hero-vanta.js"></script>
```

Puis, juste après la ligne contenant `<meta property="og:url"`, ajouter (indentation de 2 espaces) :

```html
  <meta property="og:image" content="%SITE_URL%/img/og-image.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Alex, développeur full stack : points animés sur fond sombre, « Créateur d'application »" />
```

6. Dans `public/login.html` : remplacer exactement le bloc

```html
    <script>
      // Avec JavaScript : la connexion se fait dans la fenetre de l'accueil.
      location.replace('/?connexion=1');
    </script>
```

par :

```html
    <script src="/js/login-redirect.js"></script>
```

puis supprimer la ligne `      <p class="error" id="error-msg" hidden>Code incorrect.</p>` et supprimer en entier le dernier bloc `<script> ... </script>` (celui qui commence par `const error = new URLSearchParams(location.search).get('error');`), en laissant `</body>` à sa place.

7. Dans `netlify.toml` : remplacer exactement le bloc de commentaires qui précède `[[headers]]` (de `# Pages et assets statiques.` jusqu'à `# heberge Three.js et Vanta.` inclus) par :

```
# Pages et assets statiques. Les reponses des fonctions n'heritent pas de ces
# en-tetes (cf. lib/security-headers.js).
# script-src 'self' : aucun script en ligne ni CDN (Three.js et Vanta sont dans public/vendor/).
```

et remplacer, dans la ligne `Content-Security-Policy`, `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;` par `script-src 'self';` (ne rien changer d'autre dans cette ligne).

8. Ne PAS lancer `npm run build` (je le fais moi-même). Lancer `node --check` sur les trois nouveaux fichiers JS, puis ce contrôle (il ne doit afficher que `scripts ok`) :

```bash
node -e "const fs = require('fs'); const fail = (m) => { throw new Error(m); }; for (const f of ['public/js/js-flag.js', 'public/js/hero-vanta.js', 'public/js/login-redirect.js', 'public/vendor/three.min.js', 'public/vendor/vanta.dots.min.js', 'public/img/og-image.png']) if (!fs.existsSync(f)) fail('absent ' + f); const files = ['src/index.template.html', 'src/sections/projets.html', 'public/login.html']; for (const f of files) { const s = fs.readFileSync(f, 'utf8'); if (/<script(?![^>]*\bsrc=)[^>]*>/.test(s)) fail('script en ligne : ' + f); if (s.includes('cdn.jsdelivr')) fail('cdn : ' + f); } const t = fs.readFileSync('src/index.template.html', 'utf8'); for (const k of ['/vendor/three.min.js', '/vendor/vanta.dots.min.js', '/js/hero-vanta.js', 'og:image\" content=\"%SITE_URL%/img/og-image.png', 'og:image:width']) if (!t.includes(k)) fail('template : ' + k); if (t.indexOf('/vendor/three.min.js') > t.indexOf('/vendor/vanta.dots.min.js') || t.indexOf('/vendor/vanta.dots.min.js') > t.indexOf('/js/hero-vanta.js')) fail('ordre des scripts'); const l = fs.readFileSync('public/login.html', 'utf8'); if (l.includes('error-msg')) fail('error-msg'); const toml = fs.readFileSync('netlify.toml', 'utf8'); const csp = toml.match(/Content-Security-Policy = \"([^\"]+)\"/)[1]; if (!csp.includes(\"script-src 'self';\") || csp.includes('jsdelivr')) fail('csp : ' + csp); console.log('scripts ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `src/` et `public/login.html`, alors aucun script en ligne ni référence à `cdn.jsdelivr` ne subsiste, et les scripts de l'accueil se chargent dans l'ordre `three.min.js`, `vanta.dots.min.js`, `hero-vanta.js`.
- [ ] AC-02 : Étant donné `netlify.toml`, alors la CSP contient `script-src 'self';` sans `'unsafe-inline'` ni jsDelivr pour les scripts ; les autres directives sont inchangées.
- [ ] AC-03 : Étant donné le gabarit, alors `og:image` pointe vers `%SITE_URL%/img/og-image.png` avec type, largeur 1200, hauteur 630 et texte alternatif.
- [ ] AC-04 : Étant donné `login.html`, alors il ne contient plus que le script externe `login-redirect.js`.

## Hors périmètre

- Ne pas modifier `public/index.html` (généré), les fichiers de `public/vendor/`, l'image, ni `docs/`. Ne pas toucher à `style-src`. Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>
