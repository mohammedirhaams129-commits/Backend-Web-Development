const express = require('express');
const postController = require('./controllers/postController');

const app = express();
app.use(express.json());

app.get('/posts', postController.list);
app.get('/posts/:id', postController.get);
app.post('/posts', postController.create);
app.patch('/posts/:id', postController.update);
app.delete('/posts/:id', postController.remove);

app.use((error, req, res, next) => {
  // Repository errors are intentionally safe, application-level messages.
  // Unknown errors (including unhandled database errors) never expose internals.
  const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 500
    ? error.statusCode
    : 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;
  res.status(statusCode).json({ error: message });
});

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => console.log('API listening'));
}

module.exports = app;
