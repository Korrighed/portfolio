# T603 — Menu des projets : retour au hero, lien enseignant sur mobile ; retrait des périodes

Statut : fait
Story : US-01, US-06, US-07 · Exigences : F-04, F-17, F-15, F-21
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T604, T701, T801)
Exécutant : executor

## Objectif

1. Le menu des projets (menu fixe à gauche dès 48rem ET vue latérale mobile) gagne en première position un lien « Accueil » qui remonte au hero, en plus du lien « QA » qui descend à la FAQ.
2. La vue latérale mobile gagne en dernière position un lien « Espace enseignant » qui ferme la vue puis ouvre la fenêtre de connexion (gérée par `login-dialog.js`). Sans JavaScript, le lien mène à `/login.html`.
3. Toute mention de période disparaît des résumés de projet : le texte « [période à préciser] » est retiré.

## Fichiers à lire

- `src/sections/projets.html` — lignes du menu (`projets-nav`, `projets-sheet`) et résumés (`project__synopsis`)
- `public/js/projets-scroll.js` — `goTo`, gestion de la vue latérale, gestionnaires `[data-goto]`
- `public/css/projets.css` — `.projets-nav__cta` et règles de la vue latérale

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/projets.html` | modifier | lien « Accueil » dans les deux menus, lien « Espace enseignant » dans la vue latérale, 5 résumés sans période |
| `public/js/projets-scroll.js` | modifier | `goTo('hero')`, fermeture de la vue au clic sur « Espace enseignant » |
| `public/css/projets.css` | modifier | style du lien « Accueil » en tête de menu |

## Étapes

1. Dans `src/sections/projets.html`, dans le menu de bureau (`<nav class="projets-nav" ...>`), insérer comme première ligne de la liste `<ul>`, juste avant la ligne `<li><a class="projets-nav__link" href="#projet-1" data-goto="0">Vitrine Twitch</a></li>` (en respectant l'indentation de cette ligne) :

```html
<li class="projets-nav__top"><a class="projets-nav__link" href="#hero" data-goto="hero">Accueil</a></li>
```

2. Dans la vue latérale (`<aside class="projets-sheet" ...>`), insérer la même ligne en première position de sa liste `<ul>` (avant `Vitrine Twitch`, indentation de cette ligne). Puis, juste après la ligne `<li class="projets-nav__cta"><a class="projets-nav__link" href="#faq" data-goto="faq">QA</a></li>` de cette vue latérale (la seconde occurrence du fichier, celle dont l'indentation est de 10 espaces), ajouter :

```html
<li><a class="projets-nav__link" href="/login.html">Espace enseignant</a></li>
```

Ne pas ajouter ce lien au menu de bureau.

3. Dans le même fichier, dans les cinq résumés (`class="step project__synopsis"`), remplacer :
   - `Projet personnel — [période à préciser]. ` par `Projet personnel. ` (4 occurrences) ;
   - `Projet de groupe — SAE501, [période à préciser]. ` par `Projet de groupe — SAE501. ` (1 occurrence).

4. Dans `public/js/projets-scroll.js`, dans la fonction `goTo(target)`, remplacer exactement :

```js
    let top;
    if (target === 'faq') {
```

par :

```js
    let top;
    if (target === 'hero') {
      const hero = document.querySelector('#hero');
      if (!hero) return;
      top = hero.getBoundingClientRect().top + window.scrollY;
    } else if (target === 'faq') {
```

5. Dans le même fichier, juste après le bloc qui se termine par les lignes suivantes (gestionnaires `[data-goto]`) :

```js
      if (sheet.contains(element)) closeSheet({ restoreFocus: false });
      goTo(element.getAttribute('data-goto'));
    });
  });
```

ajouter, après une ligne vide :

```js

  // « Espace enseignant » dans la vue laterale : on ferme la vue, login-dialog.js ouvre la fenetre de connexion.
  sheet.querySelectorAll('a:not([data-goto])').forEach((link) => {
    link.addEventListener('click', () => closeSheet({ restoreFocus: false }));
  });
```

6. Dans `public/css/projets.css`, juste avant la règle `.projets-nav__cta {` (ligne vide entre les règles), ajouter :

```css
/* Lien de retour au hero, en tete de menu */
.projets-nav__top {
  margin-bottom: var(--space-xs);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--projets-line);
}

.projets-nav__top .projets-nav__link {
  font-weight: 600;
  color: var(--color-platinum);
}

```

Les fichiers peuvent être en CRLF : conserver leurs fins de ligne.

7. Lancer `node --check public/js/projets-scroll.js`. Ne PAS lancer `npm run build` (je le fais moi-même).

## Critères d'acceptation

- [ ] AC-01 : Étant donné `src/sections/projets.html`, alors `data-goto="hero"` apparaît deux fois (menu de bureau et vue latérale), chacune comme premier élément de sa liste.
- [ ] AC-02 : Étant donné la vue latérale, alors elle se termine par « QA » puis `<a class="projets-nav__link" href="/login.html">Espace enseignant</a>` ; le menu de bureau ne contient pas `/login.html`.
- [ ] AC-03 : Étant donné `src/sections/projets.html`, alors il ne contient plus `période`, ni `[`, et les résumés commencent par `Projet personnel.` (4 fois) et `Projet de groupe — SAE501.` (1 fois).
- [ ] AC-04 : Étant donné `projets-scroll.js`, alors `goTo('hero')` défile vers `#hero` et un clic sur un lien sans `data-goto` de la vue latérale la ferme sans rendre le focus.

## Vérification

`node --check public/js/projets-scroll.js`, puis l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 à AC-04.

Parcours navigateur : à rejouer par moi (menu de bureau, vue latérale à 390 px, ouverture de la fenêtre de connexion).

## Hors périmètre

- Ne pas modifier `src/sections/nav.html`, `footer.html`, `hero.html`, ni les fichiers sous `docs/` et `public/index.html`.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>
