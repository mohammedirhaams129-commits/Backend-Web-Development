const { PrismaClient } = require('@prisma/client');

// One Prisma client per Node.js application process.
const prisma = new PrismaClient();

module.exports = prisma;
