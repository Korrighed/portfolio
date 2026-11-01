import { destroySessionCookieHeader } from './lib/auth.js';
import { secure } from './lib/security-headers.js';

const handle = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  return {
    statusCode: 302,
    headers: {
      Location: '/',
      'Set-Cookie': destroySessionCookieHeader(event),
    },
    body: '',
  };
};

export const handler = async (event) => secure(await handle(event));
