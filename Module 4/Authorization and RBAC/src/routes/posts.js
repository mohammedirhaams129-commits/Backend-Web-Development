const express = require('express');
const { posts } = require('../data');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const PRIVILEGED_ROLES = ['moderator', 'admin'];

// Check existence before authorization. Owners and privileged roles may proceed.
function loadOwnedOrPrivileged(req, res) {
  const post = posts.find((item) => item.id === req.params.id);

  if (!post) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Post not found' },
    });
    return null;
  }

  const isOwner = post.authorId === req.user.id;
  const isPrivileged = PRIVILEGED_ROLES.includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'You do not own this resource' },
    });
    return null;
  }

  return post;
}

// List posts — any authenticated user.
router.get('/', (req, res) => {
  return res.status(200).json(posts);
});

// Create a post — the caller becomes the author.
router.post('/', (req, res) => {
  const post = {
    id: String(posts.length + 1),
    authorId: req.user.id,
    title: req.body?.title ?? 'Untitled',
    hidden: false,
  };
  posts.push(post);
  return res.status(201).json(post);
});

// Update a post — owner or moderator/admin only.
router.patch('/:id', (req, res) => {
  const post = loadOwnedOrPrivileged(req, res);
  if (!post) return;

  post.title = req.body?.title ?? post.title;
  return res.status(200).json(post);
});

// Delete a post — owner or moderator/admin only.
router.delete('/:id', (req, res) => {
  const post = loadOwnedOrPrivileged(req, res);
  if (!post) return;

  const idx = posts.findIndex((item) => item.id === post.id);
  posts.splice(idx, 1);
  return res.status(200).json({ ok: true });
});

// Hide a post — moderator/admin only.
router.post('/:id/hide', requireRole('moderator', 'admin'), (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Post not found' },
    });
  }

  post.hidden = true;
  return res.status(200).json(post);
});

module.exports = router;
