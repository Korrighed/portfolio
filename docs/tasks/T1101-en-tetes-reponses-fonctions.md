# T1101 — En-têtes de sécurité sur les réponses des fonctions

Statut : fait
Story : US-07, US-08 · Exigences : NF-04, T-05
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T1102)
Exécutant : executor

## Objectif

Les `[[headers]]` de `netlify.toml` ne s'appliquent pas aux réponses des fonctions (cf. le commentaire de `auth.js`). Les pages `/fiches-reflexives`, `/api/pdf/:id`, `/api/login` et `/api/logout` n'ont donc que `Cache-Control`. Toutes leurs réponses (succès, redirection, erreur, 405, 401) reçoivent les mêmes en-têtes de sécurité que les pages statiques, plus `Permissions-Policy`. Un en-tête posé explicitement par une fonction (par exemple `Cache-Control`, `Location`) l'emporte.

## Fichiers à lire

- `netlify/functions/lib/auth.js` — `withAuth`
- `netlify/functions/login.js`, `netlify/functions/logout.js`
- `netlify.toml` — valeur de la CSP actuelle (pour référence ; ne pas la modifier)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/security-headers.js` | créer | jeu d'en-têtes et fonction `secure` |
| `netlify/functions/lib/auth.js` | modifier | `withAuth` passe sa réponse par `secure` |
| `netlify/functions/login.js` | modifier | handler enveloppé par `secure` |
| `netlify/functions/logout.js` | modifier | handler enveloppé par `secure` |

## Étapes

1. Créer `netlify/functions/lib/security-headers.js` avec exactement :

```js
// En-tetes de securite des reponses des fonctions : les [[headers]] de netlify.toml ne s'y appliquent pas.
// Meme jeu que les pages statiques, sans jsDelivr (aucune page de fonction n'y charge de script).
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

// Les en-tetes deja poses par la fonction (Cache-Control, Location, ...) restent prioritaires.
export function secure(response) {
  return { ...response, headers: { ...SECURITY_HEADERS, ...response.headers } };
}
```

2. Dans `netlify/functions/lib/auth.js` : ajouter, juste après la ligne `import { sealData, unsealData } from 'iron-session';`, la ligne `import { secure } from './security-headers.js';`. Puis remplacer exactement :

```js
    return {
      ...response,
      headers: { ...response.headers, 'Cache-Control': 'private, no-store' },
    };
```

par :

```js
    return secure({
      ...response,
      headers: { ...response.headers, 'Cache-Control': 'private, no-store' },
    });
```

3. Dans `netlify/functions/login.js` : ajouter l'import `import { secure } from './lib/security-headers.js';` après les imports existants, remplacer la ligne `export const handler = async (event) => {` par `const handle = async (event) => {`, et ajouter à la toute fin du fichier (après une ligne vide) :

```js
export const handler = async (event) => secure(await handle(event));
```

4. Dans `netlify/functions/logout.js` : même modification : import `import { secure } from './lib/security-headers.js';` après l'import existant, `export const handler = async (event) => {` devient `const handle = async (event) => {`, et ajouter à la fin (après une ligne vide) :

```js
export const handler = async (event) => secure(await handle(event));
```

5. Lancer `node --check` sur les quatre fichiers, puis ce contrôle (il ne doit afficher que `en-tetes ok` ; des lignes `console.error` sur le compteur indisponible sont normales) :

```bash
node --input-type=module -e "process.env.SESSION_SECRET='x'.repeat(40); process.env.AUTH_CODE='code-de-test-123'; const { handler: login } = await import('./netlify/functions/login.js'); const { handler: logout } = await import('./netlify/functions/logout.js'); const { handler: list } = await import('./netlify/functions/fiche-list.js'); const { handler: pdf } = await import('./netlify/functions/pdf.js'); const need = ['X-Content-Type-Options', 'Referrer-Policy', 'X-Frame-Options', 'Permissions-Policy', 'Content-Security-Policy']; const chk = (n, r) => { for (const h of need) if (!r.headers || !r.headers[h]) throw new Error(n + ' sans ' + h); }; chk('login echec', await login({ httpMethod: 'POST', headers: {}, body: 'code=x' })); chk('login 405', await login({ httpMethod: 'GET', headers: {} })); chk('logout', await logout({ httpMethod: 'POST', headers: {} })); chk('logout 405', await logout({ httpMethod: 'GET', headers: {} })); chk('liste sans session', await list({ httpMethod: 'GET', headers: {} })); chk('pdf sans session', await pdf({ httpMethod: 'GET', headers: {}, queryStringParameters: { id: 'affmar' } })); const ok = await login({ httpMethod: 'POST', headers: {}, body: 'code=code-de-test-123' }); chk('login succes', ok); if (!ok.headers['Set-Cookie'] || ok.headers.Location !== '/fiches-reflexives') throw new Error('succes'); const l = await list({ httpMethod: 'GET', headers: { cookie: ok.headers['Set-Cookie'].split(';')[0] } }); chk('liste', l); if (l.statusCode !== 200 || l.headers['Cache-Control'] !== 'private, no-store') throw new Error('liste cache'); console.log('en-tetes ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `login`, `logout`, `fiche-list` et `pdf`, alors chaque réponse (succès, redirection, 405, 401) contient les cinq en-têtes de sécurité.
- [ ] AC-02 : Étant donné une session valide, alors `fiche-list` répond 200 avec `Cache-Control: private, no-store` conservé.
- [ ] AC-03 : Étant donné le comportement de connexion, alors un bon code donne toujours 302 vers `/fiches-reflexives` avec `Set-Cookie`.

## Hors périmètre

- Ne pas modifier `netlify.toml`, ni `fiche-list.js`, `pdf.js`, `fiche-detail.js` (ils passent par `withAuth`). Ne pas committer. Ne pas toucher à `docs/`.

## Notes d'exécution

<Réservé à l'exécuteur.>
