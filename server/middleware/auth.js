import crypto from 'node:crypto';
import { getSession, deleteSession } from '../db/database.js';
import { sendError } from '../utils/response.js';

const COOKIE_NAME = 'session_id';
const DEFAULT_TTL_HOURS = 24;
let ephemeralDevSecret = null;

/**
 * Get active session secret.
 * Enforces strict 32+ character entropy in production; fails closed if absent or placeholder.
 * In development/test, generates an in-memory random secret if unconfigured.
 * Never uses hardcoded reusable secrets.
 * @returns {string}
 */
export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!secret || typeof secret !== 'string' || secret.trim().length < 32 || secret.includes('replace_with_')) {
      throw new Error(
        'FATAL [Security]: Production startup halted. SESSION_SECRET must be configured with at least 32 cryptographically secure characters.'
      );
    }
    return secret.trim();
  }

  if (secret && typeof secret === 'string' && secret.trim().length >= 16) {
    return secret.trim();
  }

  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(32).toString('hex');
  }
  return ephemeralDevSecret;
}

/**
 * Generate a random cryptographically secure token.
 * @param {number} [bytes]
 * @returns {string}
 */
export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Derive deterministic, tamper-proof CSRF token from raw session token and secret.
 * @param {string} rawSessionToken
 * @param {string} [secret]
 * @returns {string}
 */
export function deriveCsrfToken(rawSessionToken, secret = getSessionSecret()) {
  return crypto.createHmac('sha256', secret).update(`csrf:${rawSessionToken}`).digest('hex');
}

/**
 * Hash a session or CSRF token for safe database persistence.
 * @param {string} token
 * @returns {string}
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

/**
 * Parse HTTP Cookie header and extract values into a dictionary.
 * @param {string} [cookieHeader]
 * @returns {Record<string, string>}
 */
export function parseCookies(cookieHeader = '') {
  const list = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') {
    return list;
  }

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('=').trim());
    }
  });

  return list;
}

/**
 * Serialize a session cookie with security flags.
 * @param {string} token
 * @param {number} [maxAgeSeconds]
 * @returns {string}
 */
export function serializeSessionCookie(token, maxAgeSeconds = DEFAULT_TTL_HOURS * 3600) {
  const isProd = process.env.NODE_ENV === 'production';
  let cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
  if (isProd) {
    cookie += '; Secure';
  }
  return cookie;
}

/**
 * Serialize an expired session cookie to remove it from the browser.
 * @returns {string}
 */
export function serializeClearCookie() {
  const isProd = process.env.NODE_ENV === 'production';
  let cookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  if (isProd) {
    cookie += '; Secure';
  }
  return cookie;
}

/**
 * Extract client IP from headers or socket.
 * @param {import('node:http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Authenticate incoming HTTP request by inspecting session cookie.
 * @param {import('node:http').IncomingMessage} req
 * @param {DatabaseSync} [db]
 * @returns {object | null} Returns session & user context or null
 */
export function getSessionFromRequest(req, db) {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[COOKIE_NAME];
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const sessionRow = getSession(tokenHash, db);
  if (!sessionRow) return null;

  return {
    rawToken,
    csrfToken: deriveCsrfToken(rawToken),
    session: {
      id: sessionRow.id,
      userId: sessionRow.user_id,
      csrfTokenHash: sessionRow.csrf_token_hash,
      expiresAt: sessionRow.expires_at
    },
    user: {
      id: sessionRow.user_id,
      username: sessionRow.username,
      fullName: sessionRow.full_name,
      role: sessionRow.role,
      status: sessionRow.status
    }
  };
}

/**
 * Verify CSRF token on state-changing authenticated requests.
 * @param {import('node:http').IncomingMessage} req
 * @param {string} storedCsrfHash
 * @returns {boolean}
 */
export function verifyCsrf(req, storedCsrfHash) {
  const method = req.method.toUpperCase();
  // Safe HTTP verbs do not require CSRF token
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const rawHeaderToken = req.headers['x-csrf-token'];
  if (!rawHeaderToken || typeof rawHeaderToken !== 'string') {
    return false;
  }

  const candidateHash = hashToken(rawHeaderToken);
  const storedBuffer = Buffer.from(storedCsrfHash, 'hex');
  const candidateBuffer = Buffer.from(candidateHash, 'hex');

  if (storedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, candidateBuffer);
}

/**
 * Middleware ensuring caller is authenticated.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [db]
 * @returns {object | null}
 */
export function requireAuth(req, res, db) {
  const authContext = getSessionFromRequest(req, db);
  if (!authContext) {
    sendError(res, 401, 'Authentication required. Please log in.');
    return null;
  }

  // Verify CSRF on state-changing requests
  if (!verifyCsrf(req, authContext.session.csrfTokenHash)) {
    sendError(res, 403, 'Invalid or missing CSRF token.');
    return null;
  }

  return authContext;
}

/**
 * Middleware ensuring caller has the required role.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} requiredRole 'student' | 'admin'
 * @param {DatabaseSync} [db]
 * @returns {object | null}
 */
export function requireRole(req, res, requiredRole, db) {
  const authContext = requireAuth(req, res, db);
  if (!authContext) return null;

  if (authContext.user.role !== requiredRole) {
    sendError(res, 403, 'Access denied. You do not have permission to access this resource.');
    return null;
  }

  return authContext;
}
