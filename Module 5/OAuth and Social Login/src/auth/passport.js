'use strict';
// auth/passport.js — Google OAuth strategy

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

// Resolve a Google profile to an existing or new local user.
async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    // 1. Returning OAuth user: Google's stable ID takes priority.
    const returningUser = users.find((user) => user.googleId === profile.id);
    if (returningUser) {
      return done(null, returningUser);
    }

    const email = profile.emails[0].value;

    // 2. Link an existing local account only when Google verifies the email.
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      if (profile._json.email_verified === true) {
        existingUser.googleId = profile.id;
        return done(null, existingUser);
      }
      return done(null, false);
    }

    // 3. No match: create a least-privileged member account.
    const newUser = {
      id: nextId(),
      googleId: profile.id,
      email,
      name: profile.displayName,
      role: 'member',
    };
    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID     || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL:  '/auth/google/callback',
    },
    verifyCallback,
  ),
);

module.exports = { passport, verifyCallback };
