const bcrypt = require('bcryptjs');
const prisma = require('../db/prisma');

// Valid bcrypt hash used to perform a comparison for unknown email addresses,
// reducing the timing difference between unknown-user and wrong-password cases.
const dummyPasswordHash = '$2a$10$N9qo8uLOickgz2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = { findByEmail, findById, dummyPasswordHash };