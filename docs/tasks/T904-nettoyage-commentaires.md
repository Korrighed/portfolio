# T904 — Nettoyage des commentaires redondants

Statut : fait
Story : — · Exigences : maintenabilité
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

Retirer les commentaires qui répètent le nom de la fonction, de la classe ou de la constante qu'ils précèdent, et corriger un commentaire devenu faux. Les commentaires qui expliquent un pourquoi (contrainte, piège, choix) restent. Aucune ligne de code ne change.

## Fichiers cibles

`netlify/functions/lib/auth.js`, `netlify/functions/lib/fiches-view.js`, `netlify/functions/lib/page.js`, `netlify/functions/lib/rate-limit.js`, `scripts/build-index.js`, `public/js/faq-ripple.js`, `public/css/faq.css`, `public/css/fiches.css`, `public/css/legal.css`, `public/css/nav.css`.

## Étapes

Chaque modification porte sur le texte indiqué, une seule fois. Conserver les fins de ligne de chaque fichier (CRLF ou LF) : écrire par un script `node` si l'outil mélange les fins de ligne. Quand on « supprime » un commentaire, supprimer aussi la ligne vide en trop qu'il laisse (jamais deux lignes vides de suite).

1. `netlify/functions/lib/auth.js` : supprimer la ligne `// Code d'acces unique, lu en clair dans AUTH_CODE (.env local, variables Netlify).`
2. `netlify/functions/lib/fiches-view.js` : supprimer la ligne `  // Action principale de la page : le PDF de la fiche, en grand bouton sous le sous-titre.`
3. `netlify/functions/lib/page.js` :
   - remplacer les deux premières lignes (`// En-tete commun aux pages protegees (fiches reflexives) : meme marque que l'accueil,` et `// lien(s) de retour + formulaire de deconnexion. Styles : nav.css + fiches.css.`) par la seule ligne `// En-tete commun aux pages protegees : marque de l'accueil, lien(s) de retour et deconnexion.`
   - supprimer la ligne `// Pied de page clair des pages protegees. Styles : footer.css (site-footer--light) + fiches.css.`
4. `netlify/functions/lib/rate-limit.js` : supprimer la ligne `// Renvoie le store, ou null si Blobs n'est pas disponible.`
5. `scripts/build-index.js` :
   - remplacer la ligne `// Boutons des questions (marqueur <!-- faq:tabs -->). Les roles ARIA sont poses par faq.js.` par `// Les roles ARIA des onglets sont poses par faq.js.`
   - supprimer la ligne `// Panneaux de reponse (marqueur <!-- faq:panels -->).`
   - supprimer la ligne `// Donnees structurees schema.org FAQPage (marqueur <!-- faq:jsonld -->).`
6. `public/js/faq-ripple.js` : retirer uniquement le commentaire de fin de ligne de ces deux lignes : `const GAP = 34; // espacement des points` devient `const GAP = 34;` ; `const RING = 40; // largeur de l'anneau` devient `const RING = 40;`.
7. `public/css/faq.css` : supprimer la ligne `/* Panneau de reponse */`.
8. `public/css/fiches.css` : supprimer ces quatre lignes de commentaire : `/* Pied de page clair et compact */`, `/* En-tete de la scene : auteur et formation */`, `/* Panneau d'une fiche */`, `/* Action principale de la page : ouvrir le PDF de la fiche */`.
9. `public/css/legal.css` : supprimer la ligne `/* Page des mentions legales : une colonne de lecture sur fond clair */`.
10. `public/css/nav.css` : remplacer `/* Logo de l'IUT devant « Espace enseignant » (remplace le carre du pied de page) */` par `/* Logo de l'IUT devant « Espace enseignant » */`.
11. Lancer `node --check` sur chaque fichier JS modifié, puis ce contrôle des accolades CSS (il ne doit afficher que `css ok`) :

```bash
node -e "const fs = require('fs'); for (const f of ['public/css/faq.css', 'public/css/fiches.css', 'public/css/legal.css', 'public/css/nav.css']) { const s = fs.readFileSync(f, 'utf8'); if ((s.match(/{/g) || []).length !== (s.match(/}/g) || []).length) throw new Error(f); if (/\n\n\n/.test(s.replace(/\r/g, ''))) throw new Error('double ligne vide ' + f); } console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné les fichiers cibles, alors `git diff --ignore-cr-at-eol` ne montre que des lignes de commentaire supprimées ou remplacées, et aucune ligne de code modifiée.
- [ ] AC-02 : Étant donné les fichiers JS, alors `node --check` ne signale aucune erreur.
- [ ] AC-03 : Étant donné les fichiers CSS, alors le contrôle de l'étape 11 affiche `css ok`.

## Hors périmètre

- Ne supprimer aucun autre commentaire. Ne pas toucher à `public/index.html`, ni à `docs/`. Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>
