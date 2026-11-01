# T1001 — Logos des technologies devant les tags des projets

Statut : fait
Story : US-02 · Exigences : F-05, F-24
Dépend de : aucune (les 17 SVG sont déjà dans `public/img/tech/`)
Parallélisable : non
Exécutant : executor

## Objectif

Chaque tag de technologie des projets reçoit, devant son texte, le logo de la technologie en couleurs d'origine, très petit (14 px) et décoratif. Deux tags n'ont pas de logo : « AG Grid » et « React Three Fiber ». Le texte du tag reste en place (le logo est `aria-hidden` via `alt=""`).

## Fichiers à lire

- `src/sections/projets.html` — les lignes `<span class="tag">…</span>` (22 au total)
- `public/css/projets.css` — règle `.tag`
- `public/mentions-legales.html` — paragraphe « Propriété intellectuelle »

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/projets.html` | modifier | 20 tags reçoivent une image |
| `public/css/projets.css` | modifier | `.tag` en flex, règle `.tag__icon` |
| `public/mentions-legales.html` | modifier | une phrase sur les logos |

## Étapes

1. Dans `src/sections/projets.html`, pour chaque correspondance du tableau, remplacer `<span class="tag">TEXTE</span>` par `<span class="tag"><img class="tag__icon" src="/img/tech/FICHIER.svg" alt="" width="14" height="14">TEXTE</span>` (toutes les occurrences : `Vite` et `TypeScript` apparaissent plusieurs fois) :

| TEXTE du tag | FICHIER |
|---|---|
| Vite | vite |
| Vanilla JS | javascript |
| Netlify Functions | netlify |
| API Twitch Helix | twitch |
| Vue 3 | vue |
| Pinia | pinia |
| Angular 21 | angular |
| TypeScript | typescript |
| RxJS | rxjs |
| Vitest | vitest |
| React 19 | react |
| Three.js | threejs |
| Docker Compose | docker |
| PHP 8.4 / Laravel | laravel |
| Filament | filament |
| Nuxt 4 | nuxt |
| PostgreSQL 17 | postgresql |

Ne rien changer pour `AG Grid` et `React Three Fiber`. Conserver l'indentation et les fins de ligne du fichier (écrire par un script `node` si l'outil mélange les fins de ligne).

2. Dans `public/css/projets.css`, remplacer exactement la règle :

```css
.tag {
  font-family: var(--font-mono);
```

par :

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-mono);
```

puis, juste après l'accolade fermante de la règle `.tag { ... }` (celle qui se termine par `color: var(--color-powder-blue);`), ajouter une ligne vide et :

```css
/* Logo de la technologie, en couleurs d'origine, decoratif */
.tag__icon {
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
}
```

3. Dans `public/mentions-legales.html`, remplacer exactement la ligne :

```html
          Les noms de jeux, de services et de marques cités (Guild Wars 2, Twitch, etc.) appartiennent à leurs propriétaires respectifs.
```

par :

```html
          Les noms de jeux, de services et de marques cités (Guild Wars 2, Twitch, etc.) appartiennent à leurs propriétaires respectifs.
          Il en va de même des logos des technologies affichés dans les projets (source : Simple Icons).
```

4. Ne PAS lancer `npm run build` (je le fais moi-même). Lancer ce contrôle (il ne doit afficher que `tags ok`) :

```bash
node -e "const fs = require('fs'); const s = fs.readFileSync('src/sections/projets.html', 'utf8'); const tags = s.match(/<span class=\"tag\">[\s\S]*?<\/span>/g) || []; if (tags.length !== 22) throw new Error('tags : ' + tags.length); const icons = s.match(/class=\"tag__icon\" src=\"\/img\/tech\/([a-z]+)\.svg\"/g) || []; if (icons.length !== 20) throw new Error('icones : ' + icons.length); for (const m of icons) { const f = 'public/img/tech/' + m.match(/tech\/([a-z]+)\.svg/)[1] + '.svg'; if (!fs.existsSync(f)) throw new Error('fichier absent ' + f); } const sans = tags.filter((t) => !t.includes('tag__icon')).map((t) => t.replace(/<[^>]+>/g, '')); if (sans.join('|') !== 'AG Grid|React Three Fiber') throw new Error(sans.join('|')); const css = fs.readFileSync('public/css/projets.css', 'utf8'); if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) throw new Error('accolades'); if (!css.includes('.tag__icon')) throw new Error('css'); console.log('tags ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `projets.html`, alors 20 des 22 tags portent un `tag__icon` vers un SVG existant de `public/img/tech/`, et seuls « AG Grid » et « React Three Fiber » n'en ont pas.
- [ ] AC-02 : Étant donné `projets.css`, alors `.tag` est en `inline-flex` et `.tag__icon` fait 0.875rem, sans autre règle modifiée.
- [ ] AC-03 : Étant donné `mentions-legales.html`, alors la phrase sur les logos suit celle sur les marques.

## Hors périmètre

- Ne modifier aucun SVG, ni `public/index.html`, ni `docs/`. Ne pas committer.

## Notes d'exécution

- Étapes 1 à 3 exécutées. Tags : script `node` avec compteurs contrôlés (3 × Vite, 2 × TypeScript, 20 remplacements au total). CSS et mentions : Edit, diff de 10 et 1 ligne.
- Contrôle de l'étape 4 : `tags ok`. `npm run build` non lancé.
- Effet de bord : `vite.config.js` (plugin `regenerate-index-on-src-change`) a régénéré `public/index.html` à partir de `src/sections/projets.html`, pendant qu'un serveur Vite tournait. Fichier non édité à la main. Diff de 40 lignes, identique aux tags de la source. À trancher par l'orchestrateur : le garder (artefact généré) ou le restaurer.
- `npm run lint` non lancé : absent de la section Vérification de la tâche.
