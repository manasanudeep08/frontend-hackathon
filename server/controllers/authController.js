import { sendJson, sendError } from '../utils/response.js';
import { parseJsonBody } from '../utils/bodyParser.js';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateStudentUsername
} from '../utils/password.js';
import {
  getDatabase,
  getUserByUsername,
  createStudentWithPortfolio,
  getPortfolioByUserId,
  createSession,
  deleteSession,
  deleteSessionsByUserId,
  recordLoginAttempt,
  getRecentLoginAttempts,
  cleanupOldLoginAttempts,
  clearLoginAttempts
} from '../db/database.js';
import {
  generateToken,
  hashToken,
  deriveCsrfToken,
  serializeSessionCookie,
  serializeClearCookie,
  getSessionFromRequest,
  getClientIp
} from '../middleware/auth.js';

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS, 10) || 24;

/**
 * Handle Student Registration: POST /api/auth/register
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleRegister(req, res, dbInstance) {
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return sendError(res, 400, err.message || 'Malformed JSON in request body.');
  }

  const { username, password, fullName, interests } = body || {};

  // 1. Validate full name
  if (typeof fullName !== 'string' || fullName.trim().length < 2) {
    return sendError(res, 400, 'Full name is required (minimum 2 characters).');
  }
  if (fullName.trim().length > 100) {
    return sendError(res, 400, 'Full name must not exceed 100 characters.');
  }

  // 2. Validate username
  const usernameValidation = validateStudentUsername(username);
  if (!usernameValidation.valid) {
    return sendError(res, 400, usernameValidation.message);
  }
  const cleanUsername = usernameValidation.clean;

  // 3. Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return sendError(res, 400, passwordValidation.message);
  }

  const db = dbInstance || getDatabase();

  // 4. Enforce username uniqueness
  const existing = getUserByUsername(cleanUsername, db);
  if (existing) {
    return sendError(res, 409, 'Username is already taken. Please choose another username.');
  }

  // 5. Hash password
  const { hash, salt } = await hashPassword(password);

  // 6. Create student and draft portfolio atomically in SQLite
  let created;
  try {
    created = createStudentWithPortfolio(
      {
        username: cleanUsername,
        fullName: fullName.trim(),
        passwordHash: hash,
        passwordSalt: salt,
        interests: Array.isArray(interests) ? interests : []
      },
      db
    );
  } catch (err) {
    console.error('[Registration Error]', err);
    return sendError(res, 500, 'Failed to complete student registration. Please try again.');
  }

  // 7. Provision authenticated session
  const rawSessionToken = generateToken(32);
  const sessionTokenHash = hashToken(rawSessionToken);
  const rawCsrfToken = deriveCsrfToken(rawSessionToken);
  const csrfTokenHash = hashToken(rawCsrfToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();

  createSession(
    {
      id: sessionTokenHash,
      userId: created.user.id,
      csrfTokenHash,
      expiresAt
    },
    db
  );

  // Set-Cookie header
  res.setHeader(
    'Set-Cookie',
    serializeSessionCookie(rawSessionToken, SESSION_TTL_HOURS * 3600)
  );

  return sendJson(res, 201, {
    success: true,
    message: 'Registration successful.',
    user: {
      id: created.user.id,
      username: created.user.username,
      fullName: created.user.full_name,
      role: created.user.role,
      status: created.user.status
    },
    csrfToken: rawCsrfToken
  });
}

/**
 * Handle Login: POST /api/auth/login
 * Supports students and administrator. Applies rate limiting and generic error messages.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleLogin(req, res, dbInstance) {
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return sendError(res, 400, err.message || 'Malformed JSON in request body.');
  }

  const { username, password } = body || {};
  const clientIp = getClientIp(req);
  const db = dbInstance || getDatabase();

  // Periodic cleanup of stale attempt records
  try {
    cleanupOldLoginAttempts(24 * 3600 * 1000, db);
  } catch {
    // Non-blocking cleanup
  }

  const cleanUser = typeof username === 'string' ? username.trim() : '';
  const adminEnvUser = (process.env.ADMIN_USERNAME || 'admin_1234').trim().toLowerCase();
  const isAdminTarget = cleanUser.toLowerCase() === adminEnvUser || cleanUser.toLowerCase() === 'admin_1234';

  // 1. Rate limiting check (5 attempts / 15 minutes) - student accounts only; administrator is exempt
  if (!isAdminTarget) {
    const recentAttempts = getRecentLoginAttempts(clientIp, cleanUser, 15 * 60 * 1000, db);
    if (recentAttempts >= 5) {
      return sendError(res, 429, 'Too many login attempts. Please try again in 15 minutes.');
    }
  }

  // 2. Validate input presence
  if (!cleanUser || !password || typeof password !== 'string') {
    if (!isAdminTarget) {
      recordLoginAttempt(clientIp, cleanUser, db);
    }
    return sendError(res, 401, 'Invalid username or password.');
  }

  // 3. User lookup
  const user = getUserByUsername(cleanUser, db);
  if (!user) {
    if (!isAdminTarget) {
      recordLoginAttempt(clientIp, cleanUser, db);
    }
    return sendError(res, 401, 'Invalid username or password.');
  }

  const isActualAdmin = user.role === 'admin';

  // 4. Check account status
  if (user.status === 'suspended') {
    return sendError(res, 403, 'Account is suspended. Please contact an administrator.');
  }

  // 5. Verify password in constant time
  const passwordMatch = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!passwordMatch) {
    if (!isAdminTarget && !isActualAdmin) {
      recordLoginAttempt(clientIp, cleanUser, db);
    }
    return sendError(res, 401, 'Invalid username or password.');
  }

  // 6. Session rotation: rotate the current connection's session if one was already active
  // Does not destroy legitimate sessions from other devices/browsers
  const existingAuth = getSessionFromRequest(req, db);
  if (existingAuth) {
    deleteSession(hashToken(existingAuth.rawToken), db);
  }

  // Clear failed login attempts on successful authentication
  clearLoginAttempts(cleanUser);

  // 7. Issue new session tokens
  const rawSessionToken = generateToken(32);
  const sessionTokenHash = hashToken(rawSessionToken);
  const rawCsrfToken = deriveCsrfToken(rawSessionToken);
  const csrfTokenHash = hashToken(rawCsrfToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();

  createSession(
    {
      id: sessionTokenHash,
      userId: user.id,
      csrfTokenHash,
      expiresAt
    },
    db
  );

  // Set-Cookie header
  res.setHeader(
    'Set-Cookie',
    serializeSessionCookie(rawSessionToken, SESSION_TTL_HOURS * 3600)
  );

  return sendJson(res, 200, {
    success: true,
    message: 'Login successful.',
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      status: user.status
    },
    csrfToken: rawCsrfToken
  });
}

/**
 * Handle Logout: POST /api/auth/logout
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleLogout(req, res, dbInstance) {
  const db = dbInstance || getDatabase();
  const authContext = getSessionFromRequest(req, db);

  if (authContext) {
    const tokenHash = hashToken(authContext.rawToken);
    deleteSession(tokenHash, db);
  }

  // Clear cookie in browser
  res.setHeader('Set-Cookie', serializeClearCookie());

  return sendJson(res, 200, {
    success: true,
    message: 'Logged out successfully.'
  });
}

/**
 * Handle Session Inspection: GET /api/auth/me
 * Returns authenticated user details and active CSRF token. Never leaks hashes or raw session tokens.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleMe(req, res, dbInstance) {
  const db = dbInstance || getDatabase();
  const authContext = getSessionFromRequest(req, db);

  if (!authContext) {
    return sendJson(res, 401, {
      success: false,
      user: null,
      message: 'Not authenticated.'
    });
  }

  const portfolio =
    authContext.user.role === 'student' ? getPortfolioByUserId(authContext.user.id, db) : null;

  return sendJson(res, 200, {
    success: true,
    user: {
      id: authContext.user.id,
      username: authContext.user.username,
      fullName: authContext.user.fullName,
      role: authContext.user.role,
      status: authContext.user.status,
      portfolio: portfolio
        ? {
            slug: portfolio.slug,
            isPublished: portfolio.is_published === 1,
            interests: portfolio.interests || []
          }
        : null
    },
    csrfToken: authContext.csrfToken
  });
}
