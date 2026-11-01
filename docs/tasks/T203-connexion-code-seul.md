# T203 — Passer la connexion enseignant à un code d'accès seul

Statut : à faire
Story : US-07 · Exigences : F-10, NF-02, T-02, T-03
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

Le formulaire de connexion n'a plus qu'un champ : un code d'accès. Le serveur compare ce code au hash bcrypt de `AUTH_PASSWORD_HASH` ; plus d'identifiant, plus de variable `AUTH_USERNAME`. Un corps de requête sans code ne produit pas d'erreur 500 : il redirige vers `/login.html?error=1`. La comparaison devient asynchrone (elle ne bloque plus la boucle d'événements).

## Fichiers à lire

- `netlify/functions/lib/auth.js` — `verifyCredentials`, `createSessionCookieHeader`
- `netlify/functions/login.js` — lecture du corps du formulaire
- `public/login.html` — formulaire actuel
- `.env.example`, `README.md` (ligne sur `bcryptjs`)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/auth.js` | modifier | `verifyCredentials` remplacée par `verifyCode` |
| `netlify/functions/login.js` | modifier | lit `code`, attend `verifyCode` |
| `public/login.html` | modifier | un seul champ « Code d'accès » |
| `.env.example` | modifier | `AUTH_USERNAME` retirée, commentaires mis à jour |
| `README.md` | modifier | une ligne |

## Étapes

1. Dans `netlify/functions/lib/auth.js`, remplacer toute la fonction `verifyCredentials` (de `export function verifyCredentials(username, password) {` jusqu'à son `}` fermant inclus) par exactement :

```js
// Code d'acces unique : seul le hash bcrypt (AUTH_PASSWORD_HASH) est stocke, jamais le code en clair.
export async function verifyCode(code) {
  const expectedHash = process.env.AUTH_PASSWORD_HASH;
  if (!expectedHash) return false;
  if (typeof code !== 'string' || code.length === 0) return false;

  return bcrypt.compare(code, expectedHash);
}
```

2. Dans `netlify/functions/login.js`, remplacer la première ligne par `import { verifyCode, createSessionCookieHeader } from './lib/auth.js';`, puis remplacer exactement ces lignes :

```js
  const username = params.get('username');
  const password = params.get('password');

  if (verifyCredentials(username, password)) {
```

par :

```js
  const code = params.get('code');

  if (await verifyCode(code)) {
```

3. Dans `public/login.html`, remplacer exactement le bloc :

```html
      <p class="error" id="error-msg" hidden>Identifiants incorrects.</p>
      <form method="post" action="/api/login">
        <label for="username">Identifiant</label>
        <input type="text" id="username" name="username" required autocomplete="username" />

        <label for="password">Mot de passe</label>
        <input type="password" id="password" name="password" required autocomplete="current-password" />

        <button type="submit">Se connecter</button>
      </form>
```

par :

```html
      <p class="error" id="error-msg" hidden>Code incorrect.</p>
      <form method="post" action="/api/login">
        <label for="code">Code d'accès</label>
        <input type="password" id="code" name="code" required autocomplete="current-password" />

        <button type="submit">Se connecter</button>
      </form>
```

Le fichier peut être en CRLF : conserver ses fins de ligne.

4. Dans `.env.example`, remplacer exactement :

```
# Compte unique enseignant
AUTH_USERNAME=enseignant-LPMIAW
# Hash bcrypt du mot de passe (jamais le mot de passe en clair)
# Generer avec : node scripts/hash-password.js "mon-mot-de-passe"
AUTH_PASSWORD_HASH=
```

par :

```
# Code d'acces enseignant (un seul code, pas d'identifiant)
# Hash bcrypt du code (jamais le code en clair)
# Generer avec : node scripts/hash-password.js "mon-code"
AUTH_PASSWORD_HASH=
```

5. Dans `README.md`, remplacer `hash du mot de passe du compte enseignant` par `hash du code d'accès enseignant`.
6. Lancer `node --check netlify/functions/lib/auth.js` et `node --check netlify/functions/login.js`.
7. Lancer ce contrôle (il ne doit afficher que `connexion ok`) :

```bash
node --input-type=module -e "const bcrypt = (await import('bcryptjs')).default; process.env.SESSION_SECRET='x'.repeat(40); process.env.AUTH_PASSWORD_HASH = bcrypt.hashSync('code-de-test-123', 4); const { handler } = await import('./netlify/functions/login.js'); const post = (body) => handler({ httpMethod: 'POST', headers: {}, body }); const ok = await post('code=code-de-test-123'); const bad = await post('code=mauvais'); const empty = await post(''); const old = await post('username=a&password=code-de-test-123'); if (ok.statusCode !== 302 || ok.headers.Location !== '/fiches-reflexives' || !ok.headers['Set-Cookie']) throw new Error('ok ' + JSON.stringify(ok.headers)); for (const [n, r] of [['bad', bad], ['empty', empty], ['old', old]]) if (r.statusCode !== 302 || r.headers.Location !== '/login.html?error=1' || r.headers['Set-Cookie']) throw new Error(n); console.log('connexion ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné le bon code, quand je valide le formulaire, alors la réponse est 302 vers `/fiches-reflexives` avec un cookie de session.
- [ ] AC-02 : Étant donné un mauvais code, un corps vide ou l'ancien format `username` et `password`, alors la réponse est 302 vers `/login.html?error=1`, sans cookie et sans erreur 500.
- [ ] AC-03 : Étant donné `public/login.html`, alors il ne contient plus qu'un champ de saisie (`name="code"`) et plus aucun `username` ni `password`.
- [ ] AC-04 : Étant donné le dépôt, alors `verifyCredentials` et `AUTH_USERNAME` n'apparaissent plus dans `netlify/`, `public/`, `.env.example` ni `README.md`.

## Vérification

Les commandes des étapes 6 et 7. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-03 et AC-04.

Parcours navigateur : à rejouer par moi (page de connexion à un champ).

## Hors périmètre

- Ne pas modifier `scripts/hash-password.js`, `logout.js`, `pdf.js`, ni le reste de `auth.js` (cookie, session, `withAuth`).
- Ne pas ajouter de limite de tentatives (hors lot).
- Ne jamais écrire un vrai code ou un vrai hash dans le dépôt.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>
