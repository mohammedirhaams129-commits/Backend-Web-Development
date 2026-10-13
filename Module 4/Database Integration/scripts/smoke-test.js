const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  return { status: response.status, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const list = await request('/posts');
  assert(list.status === 200 && Array.isArray(list.body.data), 'GET /posts should return an array');
  console.log('PASS list records');

  const existing = await request('/posts/1');
  assert(existing.status === 200 && existing.body.data.id === 1, 'GET existing post should return it');
  console.log('PASS read existing record');

  const missing = await request('/posts/2147483000');
  assert(missing.status === 404, 'GET missing post should return 404');
  console.log('PASS read missing record');

  const created = await request('/posts', {
    method: 'POST',
    body: JSON.stringify({ title: `Smoke test ${Date.now()}`, body: 'Created by API smoke test' }),
  });
  assert(created.status === 201 && created.body?.data?.id, 'POST /posts should create a record');
  const id = created.body.data.id;
  console.log('PASS create record');

  const updated = await request(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: 'Updated smoke test' }),
  });
  assert(updated.status === 200 && updated.body?.data?.title === 'Updated smoke test', 'PATCH should update the record');
  console.log('PASS update existing record');

  const missingUpdate = await request('/posts/2147483000', {
    method: 'PATCH',
    body: JSON.stringify({ title: 'Should not exist' }),
  });
  assert(missingUpdate.status === 404, 'PATCH missing post should return 404');
  console.log('PASS update missing record');

  const constraint = await request('/posts', {
    method: 'POST',
    body: JSON.stringify({ title: 'Invalid relation test', authorId: 2147483000 }),
  });
  assert(constraint.status === 409 && typeof constraint.body?.error === 'string', 'Invalid author relation should return a safe conflict response');
  assert(!JSON.stringify(constraint.body).includes('P2003'), 'Database error codes must not leak');
  console.log('PASS relational constraint failure is handled safely');

  const removed = await request(`/posts/${id}`, { method: 'DELETE' });
  assert(removed.status === 204, 'DELETE existing post should return 204');
  console.log('PASS remove existing record');

  const missingRemove = await request('/posts/2147483000', { method: 'DELETE' });
  assert(missingRemove.status === 404, 'DELETE missing post should return 404');
  console.log('PASS remove missing record');
  console.log('All API smoke checks passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
