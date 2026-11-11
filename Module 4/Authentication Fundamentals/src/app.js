require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const { HttpError } = require('./services/authService');

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON' },
    });
  }

  if (error instanceof HttpError) {
    if (error.status === 401) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }
    return res.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`API listening on port ${port}`));
}

module.exports = app;
