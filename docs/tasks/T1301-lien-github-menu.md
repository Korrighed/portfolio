# T1301 — Lien GitHub dans le menu principal

Statut : fait
Story : US-06 · Exigences : F-01
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T1201)
Exécutant : executor

## Objectif

Le menu principal (barre de navigation, bureau et menu burger mobile) gagne un lien direct vers le profil GitHub d'Alex (`https://github.com/Korrighed`), précédé du logo GitHub en monochrome. Le logo est un SVG en ligne rempli en `currentColor` : il prend la couleur du lien (Yale Blue) et celle du survol. Ordre du menu : Projets, Questions, GitHub, Espace enseignant. Le lien s'ouvre dans un nouvel onglet.

## Fichiers à lire

- `src/sections/nav.html` — liste `<ul>` du menu
- `public/css/nav.css` — règles `.nav__menu a`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/nav.html` | modifier | un élément de liste |
| `public/css/nav.css` | modifier | une règle pour le lien et son logo |

## Étapes

1. Dans `src/sections/nav.html`, juste avant la ligne contenant `<a class="private-link" href="/login.html">` (l'élément `<li>` « Espace enseignant »), insérer, avec la même indentation que cette ligne :

```html
<li><a class="nav__github" href="https://github.com/Korrighed" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>GitHub</a></li>
```

2. À la fin de `public/css/nav.css`, après la dernière règle, ajouter une ligne vide puis :

```css
/* Lien GitHub : logo monochrome a la couleur du lien */
.nav__github {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.nav__github svg {
  flex: none;
}
```

3. Ne PAS lancer `npm run build`. Lancer ce contrôle (il ne doit afficher que `github ok`) :

```bash
node -e "const fs = require('fs'); const h = fs.readFileSync('src/sections/nav.html', 'utf8'); if ((h.match(/href=\"https:\/\/github.com\/Korrighed\"/g) || []).length !== 1) throw new Error('lien'); if (!h.includes('rel=\"noopener\"')) throw new Error('noopener'); if (h.indexOf('nav__github') > h.indexOf('private-link')) throw new Error('ordre'); const c = fs.readFileSync('public/css/nav.css', 'utf8'); if ((c.match(/{/g) || []).length !== (c.match(/}/g) || []).length) throw new Error('accolades'); console.log('github ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `nav.html`, alors le menu contient un seul lien vers `https://github.com/Korrighed`, avec `target="_blank"` et `rel="noopener"`, placé avant « Espace enseignant ».
- [ ] AC-02 : Étant donné le lien, alors le logo est un SVG `aria-hidden` en `currentColor`, et le texte « GitHub » donne le nom accessible.
- [ ] AC-03 : Étant donné `nav.css`, alors ses accolades sont équilibrées et aucune autre règle n'a changé.

## Hors périmètre

- Ne pas modifier `footer.html`, `public/index.html`, ni `docs/`. Ne pas committer.

## Notes d'exécution

- `src/sections/nav.html` : un `<li>` ajouté avant « Espace enseignant » (1 ligne insérée, 0 supprimée). Lien `nav__github`, `target="_blank"`, `rel="noopener"`, SVG `aria-hidden` en `currentColor`, texte « GitHub ».
- `public/css/nav.css` : `.nav__github` et `.nav__github svg` ajoutés en fin de fichier (11 lignes insérées, 0 supprimée).
- Contrôle de l'étape 3 : `github ok`. Build non lancé. Aucun commit.
- Point d'attention : `public/index.html` contient une copie de la nav. Il est généré par `scripts/build-index.js` (`<!-- include:nav.html -->` dans `src/index.template.html`). Il ne montrera le lien qu'après `npm run build`, hors périmètre de cette tâche.
- Pas de `CLAUDE.md` à la racine du dépôt (seul `node_modules/hot-shots/CLAUDE.md` existe).
