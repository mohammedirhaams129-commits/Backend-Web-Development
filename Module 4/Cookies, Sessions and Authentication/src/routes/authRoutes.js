const express = require('express');
const { randomBytes } = require('node:crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const { cookieOptions } = require('../session/cookieConfig');
const requireSession = require('../middleware/requireSession');

const router = express.Router();
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 86400000);
const INVALID_CREDENTIALS = { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
const UNAUTHENTICATED = { error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } };

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !password || password.length > 1024) {
      return res.status(401).json(INVALID_CREDENTIALS);
    }

    const user = await userRepository.findByEmail(email);
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, userRepository.dummyPasswordHash);
    if (!user || !passwordMatches) return res.status(401).json(INVALID_CREDENTIALS);

    const sid = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await sessionStore.create(sid, { userId: user.id, expiresAt });
    res.cookie('sid', sid, { ...cookieOptions, maxAge: SESSION_TTL_MS, signed: true });
    return res.status(200).json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({ user: safeUser(req.authUser) });
});

router.post('/logout', async (req, res, next) => {
  try {
    const sid = req.signedCookies?.sid;
    if (typeof sid === 'string' && sid.length > 0) await sessionStore.destroy(sid);
    res.clearCookie('sid', { ...cookieOptions, signed: true });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;