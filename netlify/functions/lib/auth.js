import { sealData, unsealData } from 'iron-session';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'session';
const TTL_SECONDS = 60 * 60 * 8; // 8h

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET manquant ou trop court (min 32 caracteres).');
  }
  return secret;
}

export function verifyCredentials(username, password) {
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedHash = process.env.AUTH_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) return false;
  if (username !== expectedUsername) return false;

  return bcrypt.compareSync(password, expectedHash);
}

// CONTEXT est une variable de build Netlify, pas du runtime des fonctions :
// on se fie donc au protocole de la requete. En local (http://localhost) le
// cookie reste sans Secure, sinon le navigateur le refuserait.
function secureAttribute(event) {
  const forwarded = event?.headers?.['x-forwarded-proto'];
  const isHttps = forwarded
    ? forwarded.split(',')[0].trim() === 'https'
    : Boolean(event?.rawUrl?.startsWith('https:'));
  return isHttps ? '; Secure' : '';
}

export async function createSessionCookieHeader(event) {
  const seal = await sealData(
    { authenticated: true },
    { password: getSessionSecret(), ttl: TTL_SECONDS }
  );

  return `${SESSION_COOKIE}=${seal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL_SECONDS}${secureAttribute(event)}`;
}

export function destroySessionCookieHeader(event) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureAttribute(event)}`;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export async function isAuthenticated(cookieHeader) {
  const seal = parseCookies(cookieHeader)[SESSION_COOKIE];
  if (!seal) return false;

  try {
    const data = await unsealData(seal, {
      password: getSessionSecret(),
      ttl: TTL_SECONDS,
    });
    return Boolean(data?.authenticated);
  } catch {
    return false;
  }
}

// 'redirect' (defaut) pour les pages HTML, '401' pour les endpoints fetch (ex. PDF).
function unauthorizedResponse(onFail) {
  if (onFail === '401') {
    return { statusCode: 401, body: 'Non autorise' };
  }
  return { statusCode: 302, headers: { Location: '/login.html' }, body: '' };
}

export function withAuth(handler, { onFail = 'redirect' } = {}) {
  return async (event, context) => {
    const authed = await isAuthenticated(event.headers.cookie);
    const response = authed ? await handler(event, context) : unauthorizedResponse(onFail);

    // Les [[headers]] de netlify.toml ne s'appliquent pas aux reponses des
    // fonctions : le cache prive est donc pose ici, pour pages et PDF.
    return {
      ...response,
      headers: { ...response.headers, 'Cache-Control': 'private, no-store' },
    };
  };
}
