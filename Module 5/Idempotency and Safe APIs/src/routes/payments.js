'use strict';
// routes/payments.js
//
// Make POST /payments idempotent using the client-provided Idempotency-Key.

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // A request without a key cannot be safely deduplicated.
  if (typeof key !== 'string' || key.trim() === '') {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'The Idempotency-Key header is required.'
      }
    });
  }

  // Return the exact response saved for a previous request with this key.
  if (idempotency.has(key)) {
    const cachedResponse = idempotency.get(key);
    return res.status(cachedResponse.status).json(cachedResponse.body);
  }

  // A new key represents a new payment operation.
  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);

  const response = {
    status: 201,
    body: { id: charge.id, amount: charge.amount, status: charge.status }
  };

  // Save both status and body so retries receive the identical response.
  idempotency.set(key, response);

  return res.status(response.status).json(response.body);
});

module.exports = router;
