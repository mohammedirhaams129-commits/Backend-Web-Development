const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const INVALID_CREDENTIALS = {
  error: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
  },
};

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validateRegistration(input) {
  if (
    !input ||
    !isNonEmptyString(input.name) ||
    !isNonEmptyString(input.email) ||
    !isNonEmptyString(input.password)
  ) {
    throw new HttpError(400, 'INVALID_INPUT', 'Name, email, and password are required');
  }
}

function validateLogin(input) {
  if (!input || !isNonEmptyString(input.email) || !isNonEmptyString(input.password)) {
    throw new HttpError(400, 'INVALID_INPUT', 'Email and password are required');
  }
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register(input) {
  validateRegistration(input);

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const cost = Number.parseInt(process.env.BCRYPT_COST || '12', 10);
  const saltRounds = Number.isInteger(cost) && cost >= 4 && cost <= 31 ? cost : 12;
  const passwordHash = await bcrypt.hash(input.password, saltRounds);

  try {
    const user = await userRepository.createUser({ name, email, passwordHash });
    return toSafeUser(user);
  } catch (error) {
    if (error && error.code === 'P2002') {
      throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists');
    }
    throw error;
  }
}

async function login(input) {
  validateLogin(input);

  const email = normalizeEmail(input.email);
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new HttpError(401, INVALID_CREDENTIALS.error.code, INVALID_CREDENTIALS.error.message);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, INVALID_CREDENTIALS.error.code, INVALID_CREDENTIALS.error.message);
  }

  return toSafeUser(user);
}

module.exports = { register, login, HttpError };
