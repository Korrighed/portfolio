# T402 — Limiter les tentatives de connexion

Statut : fait
Story : US-07 · Exigences : NF-03, F-10, F-21, T-04
Dépend de : T401
Parallélisable : non
Exécutant : executor

## Objectif

Après 5 échecs de connexion depuis la même adresse IP, `/api/login` refuse toute tentative (même avec le bon code) pendant 15 minutes à partir du premier échec de la série : réponse 302 vers `/login.html?error=2`. Les échecs sont comptés dans un store Netlify Blobs `login-attempts`, clé = adresse IP. Un succès remet le compteur à zéro. Si Blobs est indisponible, la connexion reste possible et l'erreur est journalisée (on ne bloque pas l'enseignant). La fenêtre de connexion et `login.html` affichent « Trop de tentatives. Réessayez dans quelques minutes. » pour `error=2`.

## Fichiers à lire

- `netlify/functions/login.js`
- `netlify/functions/lib/storage.js` — usage de `connectLambda` et `getStore`
- `public/js/login-dialog.js`, `public/login.html`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/rate-limit.js` | créer | compteur d'échecs par IP dans Blobs |
| `netlify/functions/login.js` | modifier | blocage avant la vérification, comptage des échecs, remise à zéro au succès |
| `public/js/login-dialog.js` | modifier | message pour `error=2` |
| `public/login.html` | modifier | message pour `error=2` (repli sans JavaScript) |

## Étapes

1. Créer `netlify/functions/lib/rate-limit.js` avec exactement :

```js
// Limite des tentatives de connexion : compteur d'echecs par adresse IP, conserve dans Netlify Blobs.
// Si Blobs est indisponible, la connexion reste possible (on ne bloque pas l'enseignant) et l'erreur est journalisee.
import { connectLambda, getStore } from '@netlify/blobs';

export const MAX_FAILURES = 5;
export const WINDOW_SECONDS = 15 * 60;

// Adresse posee par Netlify, que l'appelant ne peut pas falsifier (contrairement a X-Forwarded-For).
export function clientKey(event) {
  const ip = event?.headers?.['x-nf-client-connection-ip'] || 'inconnue';
  return ip.replace(/[^0-9a-zA-Z.]/g, '_');
}

// Renvoie le store, ou null si Blobs n'est pas disponible.
export function openAttemptsStore(event) {
  try {
    connectLambda(event);
    return getStore('login-attempts');
  } catch (error) {
    console.error('Limite de tentatives indisponible :', error.message);
    return null;
  }
}

async function readEntry(store, key, now) {
  const entry = await store.get(key, { type: 'json' });
  if (!entry || now - entry.first > WINDOW_SECONDS * 1000) return null;
  return entry;
}

// Secondes restantes avant la fin du blocage ; 0 si la connexion est permise.
export async function lockedSeconds(store, key, now = Date.now()) {
  if (!store) return 0;
  try {
    const entry = await readEntry(store, key, now);
    if (!entry || entry.count < MAX_FAILURES) return 0;
    return Math.ceil((entry.first + WINDOW_SECONDS * 1000 - now) / 1000);
  } catch (error) {
    console.error('Lecture du compteur impossible :', error.message);
    return 0;
  }
}

export async function recordFailure(store, key, now = Date.now()) {
  if (!store) return;
  try {
    const entry = (await readEntry(store, key, now)) ?? { count: 0, first: now };
    await store.setJSON(key, { count: entry.count + 1, first: entry.first });
  } catch (error) {
    console.error('Ecriture du compteur impossible :', error.message);
  }
}

export async function clearFailures(store, key) {
  if (!store) return;
  try {
    await store.delete(key);
  } catch (error) {
    console.error('Remise a zero du compteur impossible :', error.message);
  }
}
```

2. Remplacer le contenu entier de `netlify/functions/login.js` par exactement :

```js
import { verifyCode, createSessionCookieHeader } from './lib/auth.js';
import {
  clearFailures,
  clientKey,
  lockedSeconds,
  openAttemptsStore,
  recordFailure,
} from './lib/rate-limit.js';

const redirect = (location) => ({ statusCode: 302, headers: { Location: location }, body: '' });

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const store = openAttemptsStore(event);
  const key = clientKey(event);

  // Trop d'echecs recents : refus, meme avec le bon code.
  if ((await lockedSeconds(store, key)) > 0) {
    return redirect('/login.html?error=2');
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const params = new URLSearchParams(rawBody);
  const code = params.get('code');

  if (await verifyCode(code)) {
    await clearFailures(store, key);
    return {
      statusCode: 302,
      headers: {
        Location: '/fiches-reflexives',
        'Set-Cookie': await createSessionCookieHeader(event),
      },
      body: '',
    };
  }

  await recordFailure(store, key);
  return redirect('/login.html?error=1');
};
```

3. Dans `public/js/login-dialog.js`, remplacer exactement la ligne :

```js
      error.textContent = 'Code incorrect.';
```

par :

```js
      error.textContent =
        new URL(response.url).searchParams.get('error') === '2'
          ? 'Trop de tentatives. Réessayez dans quelques minutes.'
          : 'Code incorrect.';
```

4. Dans `public/login.html`, remplacer exactement le bloc :

```html
    <script>
      if (new URLSearchParams(location.search).has('error')) {
        document.getElementById('error-msg').hidden = false;
      }
    </script>
```

par :

```html
    <script>
      const error = new URLSearchParams(location.search).get('error');
      if (error) {
        const message = document.getElementById('error-msg');
        if (error === '2') message.textContent = 'Trop de tentatives. Réessayez dans quelques minutes.';
        message.hidden = false;
      }
    </script>
```

Le fichier peut être en CRLF : conserver ses fins de ligne.

5. Lancer `node --check` sur `netlify/functions/lib/rate-limit.js`, `netlify/functions/login.js` et `public/js/login-dialog.js`.
6. Lancer ce contrôle du compteur avec un store simulé (il ne doit afficher que `compteur ok`) :

```bash
node --input-type=module -e "const { lockedSeconds, recordFailure, clearFailures, clientKey, MAX_FAILURES, WINDOW_SECONDS } = await import('./netlify/functions/lib/rate-limit.js'); const m = new Map(); const store = { get: async (k) => (m.has(k) ? JSON.parse(m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); }, delete: async (k) => { m.delete(k); } }; const t0 = 1000000; const eq = (a, b, n) => { if (a !== b) throw new Error(n + ' : ' + a + ' au lieu de ' + b); }; eq(MAX_FAILURES, 5, 'seuil'); for (let i = 0; i < 4; i++) await recordFailure(store, 'a', t0); eq(await lockedSeconds(store, 'a', t0), 0, '4 echecs'); await recordFailure(store, 'a', t0 + 1000); eq(await lockedSeconds(store, 'a', t0 + 1000), WINDOW_SECONDS - 1, '5e echec'); eq(await lockedSeconds(store, 'a', t0 + 899000), 1, 'derniere seconde'); eq(await lockedSeconds(store, 'a', t0 + 901000), 0, 'expire'); eq(await lockedSeconds(store, 'b', t0), 0, 'autre IP'); await clearFailures(store, 'a'); eq(await lockedSeconds(store, 'a', t0 + 1000), 0, 'remise a zero'); eq(await lockedSeconds(null, 'a'), 0, 'sans store'); await recordFailure(null, 'a'); await clearFailures(null, 'a'); eq(clientKey({ headers: { 'x-nf-client-connection-ip': '203.0.113.7' } }), '203.0.113.7', 'ipv4'); eq(clientKey({ headers: { 'x-nf-client-connection-ip': '2001:db8::1' } }), '2001_db8__1', 'ipv6'); eq(clientKey({ headers: {} }), 'inconnue', 'sans en-tete'); console.log('compteur ok')"
```

Si le contrôle échoue sur un calcul de secondes, ne pas modifier la commande : escalader avec la valeur obtenue.

7. Lancer ce contrôle du handler sans Blobs (la connexion doit rester possible ; des lignes `console.error` sur la limite indisponible sont normales ; la dernière ligne doit être `login ok`) :

```bash
node --input-type=module -e "process.env.SESSION_SECRET = 'x'.repeat(40); process.env.AUTH_CODE = 'code-de-test-123'; const { handler } = await import('./netlify/functions/login.js'); const post = (body) => handler({ httpMethod: 'POST', headers: {}, body }); const ok = await post('code=code-de-test-123'); const bad = await post('code=mauvais'); const empty = await post(''); const get = await handler({ httpMethod: 'GET', headers: {} }); if (ok.statusCode !== 302 || ok.headers.Location !== '/fiches-reflexives' || !ok.headers['Set-Cookie']) throw new Error('ok'); for (const [n, r] of [['bad', bad], ['empty', empty]]) if (r.statusCode !== 302 || r.headers.Location !== '/login.html?error=1' || r.headers['Set-Cookie']) throw new Error(n); if (get.statusCode !== 405) throw new Error('get'); console.log('login ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné 4 échecs depuis la même IP, alors `lockedSeconds` renvoie 0 ; au 5e échec, elle renvoie 900 au plus (reste de la fenêtre de 15 minutes) ; passé 15 minutes après le premier échec, elle renvoie 0.
- [ ] AC-02 : Étant donné un blocage actif, alors `/api/login` répond 302 vers `/login.html?error=2`, même avec le bon code, et ne pose aucun cookie.
- [ ] AC-03 : Étant donné une connexion réussie, alors le compteur de l'IP est supprimé.
- [ ] AC-04 : Étant donné Blobs indisponible, alors la connexion reste possible (bon code : 302 vers `/fiches-reflexives` avec cookie ; mauvais code : 302 vers `/login.html?error=1`), sans erreur 500.
- [ ] AC-05 : Étant donné `login-dialog.js` et `login.html`, alors `error=2` affiche « Trop de tentatives. Réessayez dans quelques minutes. » et toute autre erreur « Code incorrect. ».

## Vérification

Les commandes des étapes 5 à 7. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-05.

Parcours navigateur et store Blobs réel : à rejouer par moi (6 codes faux de suite, blocage, message dans la fenêtre).

## Hors périmètre

- Ne pas modifier `auth.js`, `storage.js`, `netlify.toml`, ni les fichiers sous `docs/`.
- Pas de blocage global (tous visiteurs) : seulement par IP.
- Pas de nettoyage des anciennes entrées du store.
- Ne pas committer.

## Notes d'exécution

- Fichiers créés : `netlify/functions/lib/rate-limit.js`. Modifiés : `netlify/functions/login.js`, `public/js/login-dialog.js`, `public/login.html` (LF conservés).
- Contrôles de l'étape 6 (`compteur ok`) et de l'étape 7 (`login ok`, avec trois `console.error` attendus : `event.blobs` absent hors Netlify) : passés ; `node --check` : passé.
- Non testé par l'exécuteur : le compteur dans le handler avec un store qui retient les valeurs. Rejoué ensuite avec un faux `@netlify/blobs` : 5 échecs `error=1`, 6e `error=2` même avec le bon code, autre IP non touchée, succès remet à zéro.
- `public/index.html` : pas de régénération nécessaire (le texte d'erreur de la fenêtre est réécrit par `login-dialog.js`).
