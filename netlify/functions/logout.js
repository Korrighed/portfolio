import { destroySessionCookieHeader } from './lib/auth.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  return {
    statusCode: 302,
    headers: {
      Location: '/',
      'Set-Cookie': destroySessionCookieHeader(),
    },
    body: '',
  };
};
