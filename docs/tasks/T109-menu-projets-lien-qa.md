# T109 — Remplacer « Me contacter » par « QA » dans le menu des projets

Statut : à faire
Story : US-01 · Exigences : F-04
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

Le dernier lien des deux menus des projets (colonne fixe et vue latérale mobile) n'est plus « Me contacter » vers le pied de page : il s'appelle « QA » et défile jusqu'à la section FAQ (`#faq`).

## Fichiers à lire

- `src/sections/projets.html` — les deux lignes `projets-nav__cta` (vers les lignes 209 et 231)
- `public/js/projets-scroll.js` — fonction `goTo` (vers les lignes 287 à 303)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/projets.html` | modifier | 2 liens : libellé, `href` et `data-goto` |
| `public/js/projets-scroll.js` | modifier | la cible spéciale `contact` devient `faq` |

## Étapes

1. Dans `src/sections/projets.html`, remplacer chacune des deux occurrences de

```html
<a class="projets-nav__link" href="#contact" data-goto="contact">Me contacter</a>
```

par

```html
<a class="projets-nav__link" href="#faq" data-goto="faq">QA</a>
```

(garder l'indentation et le `<li class="projets-nav__cta">` autour, ne pas toucher aux autres liens).

2. Dans `public/js/projets-scroll.js`, dans la fonction `goTo`, remplacer le bloc

```js
    if (target === 'contact') {
      const contact = document.querySelector('#contact');
      if (!contact) return;
      top = contact.getBoundingClientRect().top + window.scrollY;
    } else {
```

par

```js
    if (target === 'faq') {
      const faq = document.querySelector('#faq');
      if (!faq) return;
      top = faq.getBoundingClientRect().top + window.scrollY;
    } else {
```

Ne rien changer d'autre dans la fonction.

3. Lancer `npm run build` puis `node --check public/js/projets-scroll.js`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `src/sections/projets.html`, alors il contient 2 occurrences de `data-goto="faq"` avec le libellé `QA`, et plus aucune de `Me contacter` ni de `data-goto="contact"`.
- [ ] AC-02 : Étant donné `public/js/projets-scroll.js`, alors il contient `target === 'faq'` et `#faq`, et plus aucun `'contact'`.
- [ ] AC-03 : Étant donné le build, alors `npm run build` réussit et `node --check` ne signale aucune erreur.

## Vérification

```bash
npm run build
node --check public/js/projets-scroll.js
```

Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 et AC-02.

Parcours navigateur : à rejouer par moi (cliquer « QA » dans le menu des projets : la page défile jusqu'à la FAQ).

## Hors périmètre

- Ne pas modifier `src/sections/footer.html`, `public/css/projets.css` ni les autres liens du menu.
- Ne pas committer.

## Notes d'exécution

- Étape 1 : 2 liens remplacés dans `src/sections/projets.html` (lignes 209 et 231), indentation et `<li class="projets-nav__cta">` conservés.
- Étape 2 : bloc `target === 'contact'` remplacé par `target === 'faq'` dans `goTo` (`public/js/projets-scroll.js`, lignes 291 à 295). Reste de la fonction inchangé.
- Étape 3 : `npm run build` réussi (`public/index.html genere depuis src/`). `node --check public/js/projets-scroll.js` sans erreur.
- `public/index.html` régénéré par le build, non édité à la main. Hors « Fichiers cibles », comme pour T106 à T108. Diff vs HEAD limité aux 2 lignes du menu (2 ajouts, 2 suppressions).
- AC-01 (Grep sur `src/sections/projets.html`) : `data-goto="faq"` et `href="#faq"` présents sur 2 lignes, libellé `QA`. `Me contacter`, `data-goto="contact"` et `href="#contact"` absents.
- AC-02 (Grep sur `public/js/projets-scroll.js`) : `target === 'faq'` et `querySelector('#faq')` présents. `'contact'` et `#contact` absents.
- AC-03 : build et `node --check` OK.
- `npm run lint` non exécuté : pas de script `lint` dans `package.json`.
- Parcours navigateur non joué : à rejouer par l'utilisateur.
- Worktree : `docs/APP-FLOW.md`, `docs/IMPLEMENTATION-PLAN-faq.md` et `docs/PRD.md` étaient déjà modifiés à mon arrivée ou pendant la session, hors de cette tâche. Non touchés par l'exécuteur. Aucun commit.
