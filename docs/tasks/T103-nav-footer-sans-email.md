# T103 — Mettre à jour la navigation (marque korrighed.dev) et retirer l'email du pied de page

Statut : à faire
Story : US-06 · Exigences : F-01, F-09, NF-13
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T101 et T102)
Exécutant : executor

## Objectif

La barre de navigation propose Projets, Questions et Espace enseignant (plus de Compétences ni de CV), et sa marque est « korrighed.dev » (le domaine sera korrighed.dev). Le pied de page ne contient plus aucune adresse email ni lien `mailto:`.

## Fichiers à lire

- `src/sections/nav.html` — liste `ul` du menu
- `src/sections/footer.html` — liens du pied de page

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/nav.html` | modifier | lien Compétences remplacé par Questions, lien CV supprimé, texte de la marque |
| `src/sections/footer.html` | modifier | lien `mailto:` supprimé |

## Étapes

1. Dans `src/sections/nav.html`, remplacer la ligne `<li><a href="#competences">Compétences</a></li>` par `<li><a href="#faq">Questions</a></li>`.
2. Dans `src/sections/nav.html`, supprimer la ligne `<li><a href="#cv">CV</a></li>`. Garder les lignes `Projets` et `Espace enseignant` telles quelles. Conserver la fin de ligne du fichier (il est en CRLF : ne pas le convertir).
3. Dans `src/sections/nav.html`, remplacer `aria-label="Alex.dev, accueil"` par `aria-label="korrighed.dev, accueil"` et `<span>Alex.dev</span>` par `<span>korrighed.dev</span>`. Ne pas toucher à l'image du logo.
4. Dans `src/sections/footer.html`, supprimer la ligne entière qui contient `mailto:` (le lien avec l'adresse). Garder le lien GitHub, le lien Espace enseignant, l'`id="contact"` du `<footer>` et tout le reste.
5. Lancer `npm run build`. Si le build échoue parce qu'une autre tâche modifie `scripts/build-index.js` ou `src/index.template.html`, attendre 20 secondes et relancer une seule fois.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `src/sections/nav.html`, alors il contient `href="#faq"` et ne contient ni `#competences` ni `#cv`.
- [ ] AC-02 : Étant donné `src/` et `public/`, alors la recherche de `mailto:` et de `protonmail` ne renvoie aucun résultat.
- [ ] AC-03 : Étant donné `src/sections/nav.html`, alors il contient `korrighed.dev` deux fois (libellé d'accessibilité et texte) et plus aucun `Alex.dev`.
- [ ] AC-04 : Étant donné `src/sections/footer.html`, alors il contient encore le lien GitHub et le lien `/login.html`.

## Vérification

```bash
npm run build
grep -rn "mailto:\|protonmail" src public --include=*.html --include=*.js --include=*.css
```

Attendu : build réussi ; aucune ligne pour le `grep`.

Parcours navigateur : aucun (je vérifie moi-même après T102).

## Hors périmètre

- Ne pas ajouter de formulaire, de lien de contact ni de nouvelle adresse.
- Ne pas modifier `src/index.template.html`, `public/login.html` ni les fonctions Netlify.
- Ne pas committer.

## Notes d'exécution

- Étapes 1 à 3 appliquées à `src/sections/nav.html` : lien Compétences remplacé par Questions (`#faq`), lien CV supprimé, marque passée à korrighed.dev (aria-label et texte). Image du logo intacte.
- Étape 4 appliquée à `src/sections/footer.html` : ligne `mailto:` supprimée. Lien GitHub, lien `/login.html` et `id="contact"` conservés.
- Écart constaté : la tâche indique que `nav.html` est en CRLF. Il est en LF (`git ls-files --eol` : `i/lf w/lf`). Fin de ligne laissée telle quelle, aucune conversion.
- `footer.html` était en CRLF avant l'édition. Un `sed` a basculé le fichier en LF ; CRLF restauré sur les 9 lignes restantes.
- Build : `npm run build` réussi du premier coup, sans relance. Le build a régénéré `public/index.html` (fichier généré, modifié aussi par d'autres tâches).
- Dépendance : `#faq` ne mène à rien tant que T102 (`id="faq"`) n'est pas appliquée.
- Aucun `CLAUDE.md` à la racine du projet (seul `node_modules/hot-shots/CLAUDE.md` existe). Seul le `CLAUDE.md` global a été appliqué.
- Pas de `npm run lint` dans `package.json` : non exécuté.
- Parcours navigateur : non effectué (prévu par la tâche).
