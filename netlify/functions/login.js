import { verifyCredentials, createSessionCookieHeader } from './lib/auth.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const params = new URLSearchParams(rawBody);
  const username = params.get('username');
  const password = params.get('password');

  if (verifyCredentials(username, password)) {
    return {
      statusCode: 302,
      headers: {
        Location: '/fiches-reflexives',
        'Set-Cookie': await createSessionCookieHeader(),
      },
      body: '',
    };
  }

  return {
    statusCode: 302,
    headers: { Location: '/login.html?error=1' },
    body: '',
  };
};
