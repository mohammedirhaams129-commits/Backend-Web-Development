'use strict';

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { transporter } = require('./email');

const worker = new Worker(
  'email',
  async (job) => {
    if (job.name !== 'otp') {
      throw new Error(`Unsupported email job: ${job.name}`);
    }

    const { to, otp } = job.data;
    if (!to || !otp) {
      throw new Error('OTP email job is missing its recipient or code');
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com',
      to,
      subject: 'Your email verification code',
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
  },
  {
    connection,
    // Queue-level defaultJobOptions supplies the retry policy for every job.
    // Keep the same policy visible on the worker configuration as required.
    settings: {
      backoffStrategy: (attemptsMade, type, delay) => {
        if (type === 'exponential') return delay * (2 ** (attemptsMade - 1));
        return delay;
      },
    },
  }
);

worker.on('completed', (job) => {
  console.log(`completed: ${job.id}`);
});

worker.on('failed', (job, error) => {
  console.error(`failed: ${job?.id}`, error.message);
});

module.exports = { worker };
