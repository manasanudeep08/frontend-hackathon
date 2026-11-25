import crypto from 'node:crypto';

const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024
};

const USERNAME_STUDENT_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const USERNAME_ADMIN_REGEX = /^[a-zA-Z0-9_]{3,40}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

/**
 * Hash a password using crypto.scrypt with a random or provided salt.
 * @param {string} password
 * @param {string} [salt]
 * @returns {Promise<{ hash: string, salt: string }>}
 */
export function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    if (typeof password !== 'string' || password.length === 0) {
      return reject(new Error('Password must be a non-empty string.'));
    }

    const saltToUse = salt || crypto.randomBytes(16).toString('hex');

    crypto.scrypt(password, saltToUse, SCRYPT_KEYLEN, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        hash: derivedKey.toString('hex'),
        salt: saltToUse
      });
    });
  });
}

/**
 * Verify a password against a stored scrypt hash and salt in constant time.
 * @param {string} candidatePassword
 * @param {string} storedHash
 * @param {string} storedSalt
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(candidatePassword, storedHash, storedSalt) {
  if (
    typeof candidatePassword !== 'string' ||
    typeof storedHash !== 'string' ||
    typeof storedSalt !== 'string'
  ) {
    return false;
  }

  try {
    const { hash: candidateHash } = await hashPassword(candidatePassword, storedSalt);
    const storedBuffer = Buffer.from(storedHash, 'hex');
    const candidateBuffer = Buffer.from(candidateHash, 'hex');

    if (storedBuffer.length !== candidateBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(storedBuffer, candidateBuffer);
  } catch {
    return false;
  }
}

/**
 * Validate password requirements.
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePassword(password) {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`
    };
  }
  return { valid: true };
}

/**
 * Validate student username.
 * @param {string} username
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateStudentUsername(username) {
  if (typeof username !== 'string' || !username.trim()) {
    return { valid: false, message: 'Username is required.' };
  }
  const clean = username.trim();
  if (!USERNAME_STUDENT_REGEX.test(clean)) {
    return {
      valid: false,
      message: 'Username must be between 3 and 30 characters and contain only letters, numbers, and underscores.'
    };
  }
  return { valid: true, clean };
}

/**
 * Validate administrator username format.
 * @param {string} username
 * @returns {boolean}
 */
export function isValidAdminUsername(username) {
  return typeof username === 'string' && USERNAME_ADMIN_REGEX.test(username.trim());
}
