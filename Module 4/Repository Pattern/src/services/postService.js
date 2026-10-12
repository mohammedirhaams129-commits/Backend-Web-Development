const postRepository = require('../repositories/postRepository');

function listPosts() {
  return postRepository.findAll();
}

function getPost(id) {
  return postRepository.findById(id);
}

function createPost(fields) {
  if (!fields || !fields.title) {
    const error = new Error('Title is required');
    error.statusCode = 422;
    throw error;
  }

  // Keep the existing business defaults and accepted fields in the service.
  return postRepository.create({
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  });
}

function updatePost(id, patch) {
  // Preserve the existing rule: only title and body may be updated.
  const allowedPatch = {};
  if (patch.title !== undefined) allowedPatch.title = patch.title;
  if (patch.body !== undefined) allowedPatch.body = patch.body;
  return postRepository.update(id, allowedPatch);
}

function removePost(id) {
  return postRepository.remove(id);
}

module.exports = { listPosts, getPost, createPost, updatePost, removePost };
