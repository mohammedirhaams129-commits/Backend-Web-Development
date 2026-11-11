'use strict';

const { rateLimit } = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res, _next, options) => {
    // express-rate-limit tracks the reset time; expose it as Retry-After in seconds.
    const resetTime = req.rateLimit && req.rateLimit.resetTime;
    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : Math.ceil(options.windowMs / 1000);

    res.set('Retry-After', String(retryAfter));
    res.status(options.statusCode).send('Too many requests, please try again later.');
  },
});

// In a multi-instance deployment, replace the default in-memory store with a
// shared Redis store (for example, rate-limit-redis configured with RedisStore
// and a Redis client sendCommand function). Each app instance then reads and
// updates the same counters. The in-memory store is process-local, so instances
// behind a load balancer keep separate counters and an attacker can spread
// attempts across them, bypassing the intended per-IP limit.

module.exports = authLimiter;
