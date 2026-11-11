'use strict';

const { randomInt } = require('node:crypto');

const store = new Map();

function generateOTP() {
  return String(randomInt(100000, 1000000));
}

function storeOTP(email, otp) {
  store.set(email, {
    otp: String(otp),
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });
}

function verifyOTP(email, code) {
  const entry = store.get(email);

  if (!entry) {
    return { ok: false, reason: 'not_found' };
  }

  if (Date.now() >= entry.expiresAt) {
    store.delete(email);
    return { ok: false, reason: 'expired' };
  }

  if (entry.attempts >= 3) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (String(code) !== entry.otp) {
    entry.attempts += 1;
    return { ok: false, reason: 'wrong_code' };
  }

  store.delete(email);
  return { ok: true };
}

function markVerified(email) {
  console.log(`Email verified: ${email}`);
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  markVerified,
  _store: store,
};
