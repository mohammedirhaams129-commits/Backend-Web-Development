// Storage boundary for posts. A future Prisma adapter can replace this Map and
// the five method implementations; services, controllers, routes, API responses,
// and business rules stay unchanged as long as this contract is preserved.
const posts = new Map([
  [1, { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 }],
  [2, { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 }],
]);

let nextId = 3;

function findAll() {
  // Return a fresh array so callers cannot add/remove repository records by
  // mutating the returned collection.
  return Array.from(posts.values());
}

function findById(id) {
  return posts.get(Number(id)) || null;
}

function create(fields) {
  const record = { id: nextId++, ...fields };
  posts.set(record.id, record);
  return record;
}

function update(id, patch) {
  const key = Number(id);
  const current = posts.get(key);
  if (!current) return null;

  const updated = { ...current, ...patch, id: current.id };
  posts.set(key, updated);
  return updated;
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };
