const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');

module.exports = async function requireSession(req, res, next) {
  try {
    const sid = req.signedCookies?.sid;
    if (typeof sid !== 'string' || !sid) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }
    const session = await sessionStore.get(sid);
    if (!session) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }
    const user = await userRepository.findById(session.userId);
    if (!user) {
      await sessionStore.destroy(sid);
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }
    req.authUser = user;
    req.sessionId = sid;
    return next();
  } catch (error) {
    return next(error);
  }
};