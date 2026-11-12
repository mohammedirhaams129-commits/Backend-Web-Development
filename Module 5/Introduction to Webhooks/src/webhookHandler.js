'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // Reject missing, malformed, or incorrectly sized signatures before
  // calling timingSafeEqual, which requires buffers of equal length.
  if (
    typeof signature !== 'string' ||
    !signature.startsWith('sha256=') ||
    typeof secret !== 'string' ||
    secret.length === 0
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const receivedHex = signature.slice('sha256='.length);
  if (!/^[a-fA-F0-9]{64}$/.test(receivedHex)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedHex, 'hex');
  const receivedBuffer = Buffer.from(receivedHex, 'hex');

  if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // Record the id before scheduling any work so concurrent retries are ignored.
  _processedIds.add(event.id);

  // Acknowledge immediately; event processing happens after the response.
  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    Promise.resolve(handleEvent(event)).catch((error) => {
      console.error('Webhook event processing failed:', error);
    });
  });
}

module.exports = { handleWebhook, _processedIds };
