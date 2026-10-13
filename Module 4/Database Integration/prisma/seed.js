require('dotenv').config();
const prisma = require('../src/lib/prisma');

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: { name: 'Demo User' },
    create: { id: 1, name: 'Demo User', email: 'demo@example.test' },
  });

  await prisma.post.upsert({
    where: { id: 1 },
    update: { title: 'First post', body: 'The contract survives storage changes.', authorId: user.id },
    create: { id: 1, title: 'First post', body: 'The contract survives storage changes.', authorId: user.id },
  });

  await prisma.post.upsert({
    where: { id: 2 },
    update: { title: 'Second post', body: 'Migrations record database design.', authorId: user.id },
    create: { id: 2, title: 'Second post', body: 'Migrations record database design.', authorId: user.id },
  });

  console.log('Seed data is ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed. Check DATABASE_URL and apply migrations first.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
