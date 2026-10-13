const prisma = require('../lib/prisma');
const { translateDatabaseError } = require('./repositoryErrors');

function toId(id) {
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  const numericId = toId(id);
  if (numericId === null) return null;
  return prisma.post.findUnique({ where: { id: numericId } });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        // Optional author preserves the starter's accepted create shape.
        ...(fields.authorId === undefined || fields.authorId === null
          ? {}
          : { authorId: Number(fields.authorId) }),
      },
    });
  } catch (error) {
    throw translateDatabaseError(error);
  }
}

async function update(id, patch) {
  const numericId = toId(id);
  if (numericId === null) return null;

  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  try {
    const result = await prisma.post.updateMany({
      where: { id: numericId },
      data,
    });
    if (result.count === 0) return null;
    return prisma.post.findUnique({ where: { id: numericId } });
  } catch (error) {
    throw translateDatabaseError(error);
  }
}

async function remove(id) {
  const numericId = toId(id);
  if (numericId === null) return false;

  const result = await prisma.post.deleteMany({ where: { id: numericId } });
  return result.count > 0;
}

module.exports = { findAll, findById, create, update, remove };
