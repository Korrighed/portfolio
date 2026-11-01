import { verifyCode, createSessionCookieHeader } from './lib/auth.js';
import {
  clearFailures,
  clientKey,
  lockedSeconds,
  openAttemptsStore,
  recordFailure,
} from './lib/rate-limit.js';
import { secure } from './lib/security-headers.js';

const redirect = (location) => ({ statusCode: 302, headers: { Location: location }, body: '' });

const handle = async (event) => {
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

export const handler = async (event) => secure(await handle(event));
