# T501 — Renommer la fiche yozora en twitch

Statut : fait
Story : US-08 · Exigences : F-12, F-18
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

La troisième fiche réflexive s'appelle `twitch` et non plus `yozora` : identifiant `twitch`, fichier PDF `fiche-twitch.pdf` (donc lien `/api/pdf/twitch`). Titre, sous-titre, compétences, livrables, liens et dates ne changent pas.

## Fichiers à lire

- `netlify/functions/lib/fiche-repository.js`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/fiche-repository.js` | modifier | `id` et `file` de la troisième fiche |

## Étapes

1. Dans `netlify/functions/lib/fiche-repository.js`, remplacer exactement ces deux lignes :

```js
    id: 'yozora',
    file: 'fiche-yozora.pdf',
```

par :

```js
    id: 'twitch',
    file: 'fiche-twitch.pdf',
```

Ne rien changer d'autre : les liens `https://github.com/Korrighed/Yozora_Site/` et `https://yozoravtfan.netlify.app` et le titre `Site yozoravtfan.netlify.app` restent tels quels.

2. Lancer `node --check netlify/functions/lib/fiche-repository.js`.
3. Lancer ce contrôle (il ne doit afficher que `fiches ok`) :

```bash
node --input-type=module -e "const { fiches, findFiche } = await import('./netlify/functions/lib/fiche-repository.js'); const ids = fiches.map((f) => f.id).join(','); if (ids !== 'affmar,hotfix-ci-cd,twitch') throw new Error(ids); const files = fiches.map((f) => f.file).join(','); if (files !== 'fiche-affmar.pdf,fiche-hotfix-ci-cd.pdf,fiche-twitch.pdf') throw new Error(files); if (!findFiche({ queryStringParameters: { id: 'twitch' } })) throw new Error('twitch'); if (findFiche({ queryStringParameters: { id: 'yozora' } })) throw new Error('yozora'); console.log('fiches ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné le dépôt des fiches, alors les identifiants sont `affmar`, `hotfix-ci-cd`, `twitch` et les fichiers `fiche-affmar.pdf`, `fiche-hotfix-ci-cd.pdf`, `fiche-twitch.pdf`.
- [ ] AC-02 : Étant donné `findFiche`, alors `id=twitch` renvoie la fiche et `id=yozora` ne renvoie rien.
- [ ] AC-03 : Étant donné `netlify/`, alors `fiche-yozora` et `'yozora'` n'y apparaissent plus ; les liens vers `yozoravtfan.netlify.app` et `Yozora_Site` y restent.

## Vérification

Les commandes des étapes 2 et 3. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-03.

## Hors périmètre

- Ne pas modifier les fichiers sous `docs/`, ni `src/sections/projets.html` (liens du projet Twitch).
- Ne pas committer.

## Notes d'exécution

- Fichier modifié : `netlify/functions/lib/fiche-repository.js` (2 lignes). Contrôles `node --check` et `fiches ok` passés ; Grep AC-03 sans occurrence de `fiche-yozora` ni `'yozora'` dans `netlify/`.
- Le PDF doit exister sous la clé `fiche-twitch.pdf` dans le store Blobs.
- `docs/tasks/T201-fiches-donnees-rendu.md` garde l'ancien nom : c'est le relevé d'exécution de T201, laissé tel quel.
