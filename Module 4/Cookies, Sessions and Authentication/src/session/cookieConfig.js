const isProduction = process.env.NODE_ENV === 'production';
const secureSetting = process.env.COOKIE_SECURE;

if (secureSetting !== undefined && !['true', 'false'].includes(secureSetting.toLowerCase())) {
  throw new Error('COOKIE_SECURE must be true or false');
}

const secure = secureSetting === undefined ? isProduction : secureSetting.toLowerCase() === 'true';
if (isProduction && !secure) {
  throw new Error('Secure cookies are required in production');
}

module.exports.cookieOptions = Object.freeze({
  httpOnly: true,
  sameSite: 'lax',
  secure,
  path: '/',
  maxAge: Number(process.env.SESSION_TTL_MS || 86400000),
});