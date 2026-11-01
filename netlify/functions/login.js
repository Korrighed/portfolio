import { verifyCode, createSessionCookieHeader } from './lib/auth.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const params = new URLSearchParams(rawBody);
  const code = params.get('code');

  if (await verifyCode(code)) {
    return {
      statusCode: 302,
      headers: {
        Location: '/fiches-reflexives',
        'Set-Cookie': await createSessionCookieHeader(event),
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
