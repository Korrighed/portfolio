# T1601 — PDF « Introuvable » en ligne : lire l'id de la fiche dans l'URL d'origine

Statut : fait
Story : US-08 · Exigences : F-12, F-13
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

En production, `/api/pdf/affmar` répond « Introuvable » alors que les trois PDF sont dans le store `site:fiches-reflexives`. Les journaux montrent une réponse en 2 à 16 ms, donc sans lecture du blob, et aucune erreur : la fonction sort avant la lecture, très probablement parce que `findFiche` ne reçoit pas l'id (paramètre `?id=:id` de la règle de réécriture de `netlify.toml`). Hypothèse non confirmée en ligne.

Correctif en deux volets : (1) `findFiche` lit l'id dans le paramètre `id` s'il est exploitable, sinon dans le dernier segment de l'URL d'origine (`rawUrl`, puis `path`), ce qui rend la route indépendante de la substitution du paramètre ; (2) `pdf.js` journalise la valeur reçue à chaque « Introuvable » pour que la prochaine panne s'explique dans les journaux Netlify.

## Fichiers à lire

- `netlify/functions/lib/fiche-repository.js` — `findFiche`
- `netlify/functions/pdf.js`, `netlify/functions/fiche-detail.js`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/fiche-repository.js` | modifier | `ficheId` exportée, `findFiche` s'en sert |
| `netlify/functions/pdf.js` | modifier | journal de la valeur reçue quand la fiche est inconnue |

## Étapes

1. Dans `netlify/functions/lib/fiche-repository.js`, remplacer exactement :

```js
export function findFiche(event) {
  const id = event.queryStringParameters?.id;
  return fiches.find((f) => f.id === id) || null;
}
```

par :

```js
// L'id arrive par la requete reecrite (?id=...). Si le parametre manque ou n'a pas ete substitue (":id"),
// on le lit dans le dernier segment de l'URL d'origine (/api/pdf/:id, /fiches-reflexives/:id).
export function ficheId(event) {
  const fromQuery = event.queryStringParameters?.id;
  if (fromQuery && !fromQuery.startsWith(':')) return fromQuery;

  let path = event.path || '';
  try {
    if (event.rawUrl) path = new URL(event.rawUrl).pathname;
  } catch {
    // rawUrl illisible : on garde event.path
  }
  const last = path.split('/').filter(Boolean).pop() || '';
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

export function findFiche(event) {
  const id = ficheId(event);
  return fiches.find((f) => f.id === id) || null;
}
```

2. Dans `netlify/functions/pdf.js`, remplacer exactement la ligne :

```js
import { findFiche } from './lib/fiche-repository.js';
```

par :

```js
import { ficheId, findFiche } from './lib/fiche-repository.js';
```

puis remplacer exactement le bloc :

```js
  if (!fiche) {
    return { statusCode: 404, body: 'Introuvable' };
  }
```

par :

```js
  if (!fiche) {
    console.error(
      `Fiche inconnue : id=${JSON.stringify(ficheId(event))} rawUrl=${JSON.stringify(event.rawUrl)} query=${JSON.stringify(event.queryStringParameters)}`
    );
    return { statusCode: 404, body: 'Introuvable' };
  }
```

3. Lancer `node --check` sur les deux fichiers, puis ce contrôle (il ne doit afficher que `id ok`) :

```bash
node --input-type=module -e "const { ficheId, findFiche } = await import('./netlify/functions/lib/fiche-repository.js'); const cases = [['parametre', { queryStringParameters: { id: 'affmar' } }, 'affmar'], ['parametre non substitue + rawUrl', { queryStringParameters: { id: ':id' }, rawUrl: 'https://kaporfolio.netlify.app/api/pdf/affmar' }, 'affmar'], ['sans parametre + rawUrl', { rawUrl: 'https://kaporfolio.netlify.app/api/pdf/hotfix-ci-cd' }, 'hotfix-ci-cd'], ['sans parametre + path', { path: '/api/pdf/twitch' }, 'twitch'], ['fiche detail', { rawUrl: 'https://x.test/fiches-reflexives/twitch?a=1' }, 'twitch'], ['id encode', { path: '/api/pdf/a%20b' }, 'a b']]; for (const [n, ev, want] of cases) if (ficheId(ev) !== want) throw new Error(n + ' : ' + ficheId(ev)); if (!findFiche({ rawUrl: 'https://x.test/api/pdf/affmar' })) throw new Error('findFiche'); if (findFiche({ rawUrl: 'https://x.test/api/pdf/inconnu' })) throw new Error('inconnu'); if (findFiche({ queryStringParameters: { id: 'yozora' } })) throw new Error('ancien id'); if (findFiche({ rawUrl: 'https://x.test/.netlify/functions/pdf' })) throw new Error('chemin de la fonction'); console.log('id ok')"
```

4. Lancer ce second contrôle de la fonction complète avec une session forgée (il ne doit afficher que `pdf ok` ; une ligne `console.error` sur le PDF illisible est normale) :

```bash
node --input-type=module -e "process.env.SESSION_SECRET = 'x'.repeat(40); const auth = await import('./netlify/functions/lib/auth.js'); const { handler } = await import('./netlify/functions/pdf.js'); const cookie = (await auth.createSessionCookieHeader({ headers: {} })).split(';')[0]; const call = (ev) => handler({ httpMethod: 'GET', headers: { cookie }, ...ev }); const sans = await handler({ httpMethod: 'GET', headers: {}, rawUrl: 'https://x.test/api/pdf/affmar' }); if (sans.statusCode !== 401) throw new Error('401'); const inconnu = await call({ rawUrl: 'https://x.test/api/pdf/inconnu', queryStringParameters: { id: ':id' } }); if (inconnu.statusCode !== 404) throw new Error('404 inconnu'); const connu = await call({ rawUrl: 'https://x.test/api/pdf/affmar', queryStringParameters: { id: ':id' } }); if (connu.statusCode !== 404 && connu.statusCode !== 200) throw new Error('statut ' + connu.statusCode); console.log('pdf ok (fiche connue : statut ' + connu.statusCode + ', 404 attendu hors Netlify faute de Blobs)')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `?id=:id` non substitué et l'URL d'origine `/api/pdf/affmar`, alors la fiche `affmar` est trouvée.
- [ ] AC-02 : Étant donné aucun paramètre, alors l'id est lu dans le dernier segment de `rawUrl`, sinon de `path`.
- [ ] AC-03 : Étant donné un id inconnu, alors la réponse reste 404 « Introuvable » et le journal contient l'id reçu, `rawUrl` et les paramètres.
- [ ] AC-04 : Étant donné l'absence de session, alors `/api/pdf/:id` répond toujours 401.

## Hors périmètre

- Ne pas modifier `netlify.toml`, `storage.js`, ni `docs/`. Ne pas committer.

## Notes d'exécution

- Étapes 1 et 2 appliquées telles quelles (textes source trouvés à l'identique, fins de ligne LF).
- Étape 3 : `node --check` OK sur les deux fichiers ; contrôle `id ok`.
- Étape 4 : `pdf ok (fiche connue : statut 404 ...)`. Le `console.error` « Fiche inconnue » s'affiche pour `inconnu` (AC-03). La trace `ERR_INVALID_ARG_TYPE` de `connectLambda` hors Netlify est attendue (pas de Blobs en local).
- `package.json` ne définit pas de script `lint` ; `build` lance `scripts/build-index.js`, hors périmètre, non lancé.
- Point non vérifié : le fallback suppose que `event.rawUrl` contient l'URL d'origine lors d'une réécriture Netlify. Inconnu, à vérifier en ligne (journal de la nouvelle ligne `Fiche inconnue`).
- `fiche-detail.js` utilise aussi `findFiche` et hérite du fallback ; sa règle `/fiches-reflexives/:id` n'a pas changé.
- Aucun commit, aucun changement de `netlify.toml`, `storage.js` ou `docs/` hors cette section.
