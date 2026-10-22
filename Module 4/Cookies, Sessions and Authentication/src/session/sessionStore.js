// Learning/local-only store. Use a shared expiring store (for example Redis) in production.
const sessions = new Map();

async function create(sessionId, session) {
  sessions.set(sessionId, { userId: session.userId, expiresAt: new Date(session.expiresAt) });
}

async function get(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return { userId: session.userId, expiresAt: session.expiresAt };
}

async function destroy(sessionId) {
  sessions.delete(sessionId);
}

module.exports = { create, get, destroy };