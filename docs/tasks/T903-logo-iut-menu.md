# T903 — Logo de l'IUT à la place du carré du lien « Espace enseignant » dans le menu

Statut : à faire
Story : US-07 · Exigences : F-01, F-21
Dépend de : T901
Parallélisable : non
Exécutant : executor

## Objectif

Dans la barre de navigation de l'accueil (bureau et menu burger mobile), le petit carré creux (`<span></span>` de `.private-link`) placé devant « Espace enseignant » est remplacé par le logo `public/img/logo/LogoIUT.png`. Le pied de page garde son carré (demande limitée à la barre de navigation). Le logo de la page des fiches et de la fenêtre de connexion (T901, T902) reste en place.

## Fichiers à lire

- `src/sections/nav.html` — ligne du lien `private-link`
- `public/css/nav.css`, `public/css/main.css` (règles `.private-link`, `.private-link span`)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/nav.html` | modifier | le `<span></span>` du lien devient une image |
| `public/css/nav.css` | modifier | une règle pour l'image |

## Étapes

1. Dans `src/sections/nav.html`, remplacer exactement :

```html
<a class="private-link" href="/login.html"><span></span>Espace enseignant</a>
```

par :

```html
<a class="private-link" href="/login.html"><img class="private-link__logo" src="/img/logo/LogoIUT.png" alt="" width="375" height="181">Espace enseignant</a>
```

2. À la fin de `public/css/nav.css`, après la dernière règle, ajouter une ligne vide puis :

```css
/* Logo de l'IUT devant « Espace enseignant » (remplace le carre du pied de page) */
.private-link__logo {
  display: block;
  width: auto;
  height: 1.5rem;
}
```

3. Ne PAS lancer `npm run build` (je le fais moi-même). Lancer ce contrôle des accolades (il ne doit afficher que `css ok`) :

```bash
node -e "const s = require('fs').readFileSync('public/css/nav.css', 'utf8'); if ((s.match(/{/g) || []).length !== (s.match(/}/g) || []).length) throw new Error('accolades'); console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `src/sections/nav.html`, alors le lien `private-link` contient `LogoIUT.png` et plus de `<span></span>`.
- [ ] AC-02 : Étant donné `src/sections/footer.html`, alors son lien `private-link` est inchangé (il garde `<span></span>`).
- [ ] AC-03 : Étant donné `nav.css`, alors il contient `.private-link__logo` et ses accolades sont équilibrées.

## Hors périmètre

- Ne modifier aucun autre fichier, ni `main.css`, ni `public/index.html`. Ne pas committer.

## Notes d'exécution

- `src/sections/nav.html` : lien `private-link` de la nav, `<span></span>` remplacé par `img.private-link__logo` (LogoIUT.png, 375×181). Le lien du pied de page est inchangé.
- `public/css/nav.css` : règle `.private-link__logo` ajoutée en fin de fichier. Contrôle des accolades : `css ok`.
- `npm run build` et `npm run lint` non lancés (build interdit par la tâche ; lint absent de la tâche).
- `public/index.html` présente un diff à la ligne 90 (même ligne que la nav) alors qu'il n'est pas dans mes fichiers cibles. Cause inconnue, non touché.
