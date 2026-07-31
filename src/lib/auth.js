import { sealData, unsealData } from 'iron-session';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'session';
const TTL_SECONDS = 60 * 60 * 8; // 8h

function getSessionSecret() {
  const secret = import.meta.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET manquant ou trop court (min 32 caracteres).');
  }
  return secret;
}

export function verifyCredentials(username, password) {
  const expectedUsername = import.meta.env.AUTH_USERNAME;
  const expectedHash = import.meta.env.AUTH_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) return false;
  if (username !== expectedUsername) return false;

  return bcrypt.compareSync(password, expectedHash);
}

export async function createSessionCookie(cookies) {
  const seal = await sealData(
    { authenticated: true },
    { password: getSessionSecret(), ttl: TTL_SECONDS }
  );

  cookies.set(SESSION_COOKIE, seal, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: TTL_SECONDS,
  });
}

export function destroySessionCookie(cookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function isAuthenticated(cookies) {
  const seal = cookies.get(SESSION_COOKIE)?.value;
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
