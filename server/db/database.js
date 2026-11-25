import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { hashPassword, verifyPassword } from '../utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATA_FILE = path.resolve(__dirname, '../../data/portfolio-data.json');

/**
 * Get the path for the JSON data file.
 */
function getDataFilePath(customPath) {
  return customPath || process.env.DATA_FILE_PATH || process.env.DATABASE_PATH || DEFAULT_DATA_FILE;
}

// In-memory cache of store
let cachedStore = null;
let lastLoadedFilePath = null;
let writeQueue = Promise.resolve();

/**
 * Read the store from disk or cache.
 * Ensures the data directory and portfolio-data.json exist.
 * @param {string} [customPath]
 * @returns {{ users: Array, portfolios: Array }}
 */
function readStore(customPath) {
  const filePath = getDataFilePath(customPath);
  if (cachedStore && lastLoadedFilePath === filePath) {
    return cachedStore;
  }

  lastLoadedFilePath = filePath;
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    cachedStore = { users: [], portfolios: [] };
    persistStoreSync(cachedStore, filePath);
    return cachedStore;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      cachedStore = { users: [], portfolios: [] };
    } else {
      cachedStore = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        portfolios: Array.isArray(parsed.portfolios) ? parsed.portfolios : []
      };
    }
  } catch (err) {
    console.error('[JSON Store] Error parsing data file. Initializing clean store:', err.message);
    cachedStore = { users: [], portfolios: [] };
    persistStoreSync(cachedStore, filePath);
  }

  return cachedStore;
}

/**
 * Synchronous atomic persist using temporary file and rename.
 * @param {object} data
 * @param {string} [customPath]
 */
function persistStoreSync(data, customPath) {
  const filePath = getDataFilePath(customPath);
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  const content = JSON.stringify(data, null, 2);

  try {
    fs.writeFileSync(tmpPath, content, 'utf8');
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }
    fs.renameSync(tmpPath, filePath);
  } catch {
    // Windows fallback if rename is blocked
    fs.writeFileSync(filePath, content, 'utf8');
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
  }
}

/**
 * Serialized atomic write queue.
 * @param {object} data
 * @returns {Promise<void>}
 */
function queuePersist(data) {
  cachedStore = data;
  writeQueue = writeQueue.then(() => {
    try {
      persistStoreSync(data);
    } catch (err) {
      console.error('[JSON Store] Atomic write failure:', err);
    }
  });
  return writeQueue;
}

/**
 * In-memory server sessions map.
 * Key: sessionTokenHash -> { id, userId, role, csrfTokenHash, expiresAt }
 */
const inMemorySessions = new Map();

/**
 * In-memory login attempt logs for rate-limiting.
 */
const loginAttemptLogs = [];

/* ==========================================================================
   PUBLIC STORAGE API (Compatible with existing controllers, zero SQLite)
   ========================================================================== */

/**
 * Get or initialize the store.
 */
export function getDatabase(customPath) {
  return readStore(customPath);
}

/**
 * Close database / flush store.
 */
export function closeDatabase() {
  if (cachedStore) {
    persistStoreSync(cachedStore);
  }
  cachedStore = null;
  lastLoadedFilePath = null;
}

/**
 * Compatibility no-op for migrations (JSON file is self-managing).
 */
export function applyMigrations() {
  return true;
}

/**
 * Get user by UUID.
 * @param {string} id
 * @returns {object | null}
 */
export function getUserById(id) {
  if (!id) return null;
  const store = readStore();
  const u = store.users.find((x) => x.id === id);
  return u ? { ...u } : null;
}

/**
 * Get user by username (case-insensitive).
 * @param {string} username
 * @returns {object | null}
 */
export function getUserByUsername(username) {
  if (!username || typeof username !== 'string') return null;
  const clean = username.trim().toLowerCase();
  const store = readStore();
  const u = store.users.find((x) => x.username && x.username.toLowerCase() === clean);
  return u ? { ...u } : null;
}

/**
 * Get the single administrator user.
 * @returns {object | null}
 */
export function getAdminUser() {
  const store = readStore();
  const u = store.users.find((x) => x.role === 'admin');
  return u ? { ...u } : null;
}

/* ==========================================================================
   VALIDATION HELPERS
   ========================================================================== */

export function validateInterests(interests) {
  if (!Array.isArray(interests)) {
    return { valid: false, clean: [], message: 'Interests must be an array of strings.' };
  }
  if (interests.length > 8) {
    return { valid: false, clean: [], message: 'A maximum of 8 interests may be selected.' };
  }
  const clean = [];
  const seen = new Set();
  for (const item of interests) {
    if (typeof item !== 'string') {
      return { valid: false, clean: [], message: 'Each interest must be a text string.' };
    }
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > 50) {
      return { valid: false, clean: [], message: 'Interests must be between 1 and 50 characters.' };
    }
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      clean.push(trimmed);
    }
  }
  return { valid: true, clean };
}

export function parseInterests(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isValidHttpUrl(string) {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseJsonArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function validateSkills(skills) {
  if (!Array.isArray(skills)) {
    return { valid: false, clean: [], message: 'Skills must be an array of strings.' };
  }
  if (skills.length > 30) {
    return { valid: false, clean: [], message: 'A maximum of 30 skills may be selected.' };
  }
  const clean = [];
  const seen = new Set();
  for (const item of skills) {
    if (typeof item !== 'string') {
      return { valid: false, clean: [], message: 'Each skill must be a text string.' };
    }
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > 40) {
      return { valid: false, clean: [], message: 'Skills must be between 1 and 40 characters.' };
    }
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      clean.push(trimmed);
    }
  }
  return { valid: true, clean };
}

export function validateProjects(projects) {
  if (!Array.isArray(projects)) {
    return { valid: false, clean: [], message: 'Projects must be an array.' };
  }
  if (projects.length > 15) {
    return { valid: false, clean: [], message: 'A maximum of 15 projects may be added.' };
  }
  const clean = [];
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (!p || typeof p !== 'object') {
      return { valid: false, clean: [], message: `Project ${i + 1} is invalid.` };
    }
    const name = (p.name || p.title || '').trim();
    if (!name || name.length < 2) {
      return { valid: false, clean: [], message: `Project ${i + 1}: Name is required (minimum 2 characters).` };
    }
    if (name.length > 100) {
      return { valid: false, clean: [], message: `Project ${i + 1}: Name must not exceed 100 characters.` };
    }
    const category = (p.category || 'Other').trim().slice(0, 50);
    const description = (p.description || '').trim().slice(0, 500);

    let technologies = [];
    if (Array.isArray(p.technologies)) {
      technologies = p.technologies.map((t) => String(t || '').trim()).filter(Boolean).slice(0, 10);
    } else if (typeof p.technologies === 'string') {
      technologies = p.technologies.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10);
    }

    const githubUrl = (p.githubUrl || '').trim();
    if (githubUrl && !isValidHttpUrl(githubUrl)) {
      return { valid: false, clean: [], message: `Project "${name}": GitHub URL must be a valid HTTP or HTTPS URL.` };
    }

    const liveUrl = (p.liveUrl || p.demoUrl || '').trim();
    if (liveUrl && !isValidHttpUrl(liveUrl)) {
      return { valid: false, clean: [], message: `Project "${name}": Demo URL must be a valid HTTP or HTTPS URL.` };
    }

    clean.push({
      id: p.id || crypto.randomUUID(),
      title: name,
      category,
      description,
      technologies,
      githubUrl: githubUrl.slice(0, 255),
      liveUrl: liveUrl.slice(0, 255)
    });
  }
  return { valid: true, clean };
}

/* ==========================================================================
   STUDENT & PORTFOLIO CREATION AND UPDATES
   ========================================================================== */

/**
 * Atomically create a new student account and default draft portfolio in JSON storage.
 * @param {{ username: string, fullName: string, passwordHash: string, passwordSalt: string, interests?: string[] }} data
 * @returns {{ user: object, portfolio: object }}
 */
export function createStudentWithPortfolio({ username, fullName, passwordHash, passwordSalt, interests = [] }) {
  const store = readStore();
  const cleanUsername = username.trim();
  const now = new Date().toISOString();

  // Enforce username uniqueness
  const existing = store.users.find(
    (u) => u.username && u.username.toLowerCase() === cleanUsername.toLowerCase()
  );
  if (existing) {
    throw new Error('Username is already taken. Please choose another username.');
  }

  const interestsValidation = validateInterests(interests);
  const cleanInterests = interestsValidation.valid ? interestsValidation.clean : [];

  const userId = crypto.randomUUID();
  const portfolioId = crypto.randomUUID();

  const user = {
    id: userId,
    username: cleanUsername,
    full_name: fullName.trim(),
    password_hash: passwordHash,
    password_salt: passwordSalt,
    role: 'student',
    status: 'active',
    created_at: now,
    updated_at: now
  };

  const portfolio = {
    id: portfolioId,
    user_id: userId,
    slug: cleanUsername.toLowerCase(),
    is_published: 0,
    full_name: fullName.trim(),
    headline: '',
    bio_intro: '',
    degree: '',
    institution: '',
    academic_period: '',
    location: '',
    interests: cleanInterests,
    skills: [],
    projects: [],
    experience: [],
    services: [],
    contact_email: '',
    show_email_publicly: 0,
    github_url: '',
    linkedin_url: '',
    created_at: now,
    updated_at: now
  };

  store.users.push(user);
  store.portfolios.push(portfolio);

  persistStoreSync(store);

  return {
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    },
    portfolio: {
      id: portfolio.id,
      slug: portfolio.slug,
      is_published: 0
    }
  };
}

/**
 * Retrieve portfolio by user ID with associated user details.
 * @param {string} userId
 * @returns {object | null}
 */
export function getPortfolioByUserId(userId) {
  if (!userId) return null;
  const store = readStore();
  const portfolio = store.portfolios.find((p) => p.user_id === userId);
  if (!portfolio) return null;

  const user = store.users.find((u) => u.id === userId);

  return {
    ...portfolio,
    username: user ? user.username : portfolio.slug,
    full_name: portfolio.full_name || (user ? user.full_name : ''),
    user_full_name: user ? user.full_name : '',
    status: user ? user.status : 'active',
    interests: parseInterests(portfolio.interests),
    skills: parseJsonArray(portfolio.skills),
    projects: parseJsonArray(portfolio.projects),
    show_email_publicly: portfolio.show_email_publicly === 1 || portfolio.show_email_publicly === true
  };
}

/**
 * Update student portfolio fields with whitelist validation.
 * @param {string} userId
 * @param {object} fields
 * @returns {object}
 */
export function updateStudentPortfolio(userId, fields = {}) {
  const store = readStore();
  const portfolio = store.portfolios.find((p) => p.user_id === userId);
  if (!portfolio) {
    throw new Error('Portfolio record not found.');
  }

  const user = store.users.find((u) => u.id === userId);
  const now = new Date().toISOString();

  if (fields.fullName !== undefined) {
    const v = String(fields.fullName || '').trim().slice(0, 100);
    if (v.length < 2) throw new Error('Full name must be at least 2 characters.');
    portfolio.full_name = v;
    if (user) user.full_name = v;
  }

  if (fields.headline !== undefined) {
    portfolio.headline = String(fields.headline || '').trim().slice(0, 150);
  }

  if (fields.bioIntro !== undefined) {
    portfolio.bio_intro = String(fields.bioIntro || '').trim().slice(0, 1000);
  }

  if (fields.degree !== undefined) {
    portfolio.degree = String(fields.degree || '').trim().slice(0, 120);
  }

  if (fields.institution !== undefined) {
    portfolio.institution = String(fields.institution || '').trim().slice(0, 150);
  }

  if (fields.academicPeriod !== undefined) {
    portfolio.academic_period = String(fields.academicPeriod || '').trim().slice(0, 50);
  }

  if (fields.location !== undefined) {
    portfolio.location = String(fields.location || '').trim().slice(0, 100);
  }

  if (fields.interests !== undefined) {
    const validation = validateInterests(fields.interests);
    if (!validation.valid) throw new Error(validation.message);
    portfolio.interests = validation.clean;
  }

  if (fields.skills !== undefined) {
    const validation = validateSkills(fields.skills);
    if (!validation.valid) throw new Error(validation.message);
    portfolio.skills = validation.clean;
  }

  if (fields.projects !== undefined) {
    const validation = validateProjects(fields.projects);
    if (!validation.valid) throw new Error(validation.message);
    portfolio.projects = validation.clean;
  }

  if (fields.contactEmail !== undefined) {
    portfolio.contact_email = String(fields.contactEmail || '').trim().slice(0, 120);
  }

  if (fields.showEmailPublicly !== undefined) {
    portfolio.show_email_publicly = fields.showEmailPublicly ? 1 : 0;
  }

  if (fields.githubUrl !== undefined) {
    const v = String(fields.githubUrl || '').trim();
    if (v && !isValidHttpUrl(v)) throw new Error('GitHub URL must be a valid HTTP or HTTPS URL.');
    portfolio.github_url = v.slice(0, 255);
  }

  if (fields.linkedinUrl !== undefined) {
    const v = String(fields.linkedinUrl || '').trim();
    if (v && !isValidHttpUrl(v)) throw new Error('LinkedIn URL must be a valid HTTP or HTTPS URL.');
    portfolio.linkedin_url = v.slice(0, 255);
  }

  portfolio.updated_at = now;
  if (user) user.updated_at = now;

  persistStoreSync(store);
  return getPortfolioByUserId(userId);
}

/**
 * Publish student portfolio.
 * @param {string} userId
 * @returns {{ success: boolean, isPublished: boolean, slug: string, publicUrl: string }}
 */
export function publishPortfolio(userId) {
  const store = readStore();
  const portfolio = store.portfolios.find((p) => p.user_id === userId);
  if (!portfolio) throw new Error('Portfolio not found.');

  const user = store.users.find((u) => u.id === userId);
  const fullName = (portfolio.full_name || (user ? user.full_name : '')).trim();
  const headline = (portfolio.headline || '').trim();

  if (!fullName || fullName.length < 2) {
    throw new Error('Full name is required before publishing (minimum 2 characters).');
  }

  if (!headline || headline.length < 3) {
    throw new Error('Professional headline is required before publishing (minimum 3 characters).');
  }

  portfolio.is_published = 1;
  portfolio.updated_at = new Date().toISOString();

  persistStoreSync(store);

  return {
    success: true,
    isPublished: true,
    slug: portfolio.slug,
    publicUrl: `/p/${portfolio.slug}`
  };
}

/**
 * Convert student portfolio to draft mode.
 * @param {string} userId
 * @returns {{ success: boolean, isPublished: boolean }}
 */
export function unpublishPortfolio(userId) {
  const store = readStore();
  const portfolio = store.portfolios.find((p) => p.user_id === userId);
  if (!portfolio) throw new Error('Portfolio not found.');

  portfolio.is_published = 0;
  portfolio.updated_at = new Date().toISOString();

  persistStoreSync(store);

  return {
    success: true,
    isPublished: false
  };
}

/**
 * Public portfolio lookup by username slug.
 * Returns public-sanitized portfolio object (drafts & suspended return null).
 * @param {string} username
 * @returns {object | null}
 */
export function getPublicPortfolioByUsername(username) {
  if (!username || typeof username !== 'string') return null;
  const cleanUsername = username.trim().toLowerCase();
  const store = readStore();

  const portfolio = store.portfolios.find(
    (p) => p.slug && p.slug.toLowerCase() === cleanUsername && p.is_published === 1
  );
  if (!portfolio) return null;

  const user = store.users.find((u) => u.id === portfolio.user_id);
  if (!user || user.status !== 'active') return null;

  const email = (portfolio.show_email_publicly === 1 || portfolio.show_email_publicly === true)
    ? (portfolio.contact_email || null)
    : null;

  return {
    slug: portfolio.slug,
    username: user.username,
    fullName: portfolio.full_name || user.full_name || user.username,
    headline: portfolio.headline || '',
    bioIntro: portfolio.bio_intro || '',
    degree: portfolio.degree || '',
    institution: portfolio.institution || '',
    academicPeriod: portfolio.academic_period || '',
    location: portfolio.location || '',
    interests: parseInterests(portfolio.interests),
    skills: parseJsonArray(portfolio.skills),
    projects: parseJsonArray(portfolio.projects),
    contactEmail: email,
    githubUrl: portfolio.github_url || null,
    linkedinUrl: portfolio.linkedin_url || null,
    updatedAt: portfolio.updated_at,
    isPublished: true
  };
}

export function updatePortfolioInterests(portfolioId, interests) {
  const store = readStore();
  const p = store.portfolios.find((x) => x.id === portfolioId);
  if (!p) throw new Error('Portfolio not found.');
  const v = validateInterests(interests);
  if (!v.valid) throw new Error(v.message);
  p.interests = v.clean;
  p.updated_at = new Date().toISOString();
  persistStoreSync(store);
  return v.clean;
}

export async function updateUserPassword(userId, newPassword) {
  const store = readStore();
  const u = store.users.find((x) => x.id === userId);
  if (!u) throw new Error('User not found.');
  const { hash, salt } = await hashPassword(newPassword);
  u.password_hash = hash;
  u.password_salt = salt;
  u.updated_at = new Date().toISOString();
  deleteSessionsByUserId(userId);
  persistStoreSync(store);
}

/* ==========================================================================
   ADMIN INITIALIZATION & MANAGEMENT FUNCTIONS
   ========================================================================== */

/**
 * Initialize or synchronize single administrator account from environment configuration.
 * @param {string} [username]
 * @param {string} [password]
 */
export async function initAdmin(
  username = process.env.ADMIN_USERNAME,
  password = process.env.ADMIN_PASSWORD
) {
  if (!username || !password) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production startup halted: ADMIN_USERNAME and ADMIN_PASSWORD must be configured.');
    }
    return null;
  }

  const store = readStore();
  const cleanAdminUser = username.trim();
  const adminUsers = store.users.filter((u) => u.role === 'admin');

  let adminUser;
  if (adminUsers.length === 0) {
    const { hash, salt } = await hashPassword(password);
    adminUser = {
      id: crypto.randomUUID(),
      username: cleanAdminUser,
      full_name: 'Platform Administrator',
      password_hash: hash,
      password_salt: salt,
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.users.unshift(adminUser);
  } else {
    adminUser = adminUsers[0];
    const matches = await verifyPassword(password, adminUser.password_hash, adminUser.password_salt);
    if (!matches || adminUser.username !== cleanAdminUser) {
      const { hash, salt } = await hashPassword(password);
      adminUser.username = cleanAdminUser;
      adminUser.password_hash = hash;
      adminUser.password_salt = salt;
      adminUser.updated_at = new Date().toISOString();
    }

    // Clean up any extraneous admin accounts beyond the single authorized one
    if (adminUsers.length > 1) {
      const redundantIds = new Set(adminUsers.slice(1).map((a) => a.id));
      store.users = store.users.filter((u) => !redundantIds.has(u.id));
    }
  }

  // Clear any existing lockout/attempt records for the admin user
  clearLoginAttempts(cleanAdminUser);
  clearLoginAttempts('admin_1234');

  persistStoreSync(store);
  return adminUser;
}

/**
 * Admin Dashboard summary overview.
 * Returns genuine statistics and student list.
 */
export function getAdminOverview() {
  const store = readStore();
  const students = store.users
    .filter((u) => u.role === 'student')
    .map((student) => {
      const portfolio = store.portfolios.find((p) => p.user_id === student.id);
      return {
        id: student.id,
        username: student.username,
        fullName: student.full_name || student.username,
        status: student.status || 'active',
        createdAt: student.created_at,
        portfolio: portfolio
          ? {
              id: portfolio.id,
              slug: portfolio.slug,
              isPublished: portfolio.is_published === 1,
              skillsCount: Array.isArray(portfolio.skills) ? portfolio.skills.length : 0,
              projectsCount: Array.isArray(portfolio.projects) ? portfolio.projects.length : 0,
              updatedAt: portfolio.updated_at
            }
          : null
      };
    });

  const totalStudents = students.length;
  const totalPortfolios = store.portfolios.length;
  const publishedPortfolios = store.portfolios.filter((p) => p.is_published === 1).length;
  const draftPortfolios = totalPortfolios - publishedPortfolios;

  return {
    totalStudents,
    totalPortfolios,
    publishedPortfolios,
    draftPortfolios,
    students
  };
}

/**
 * Admin action: Update student account status ('active' | 'suspended').
 * @param {string} userId
 * @param {'active' | 'suspended'} status
 */
export function updateUserStatus(userId, status) {
  if (status !== 'active' && status !== 'suspended') {
    throw new Error('Invalid account status.');
  }
  const store = readStore();
  const user = store.users.find((u) => u.id === userId && u.role === 'student');
  if (!user) throw new Error('Student account not found.');

  user.status = status;
  user.updated_at = new Date().toISOString();

  if (status === 'suspended') {
    deleteSessionsByUserId(userId);
  }

  persistStoreSync(store);
  return { id: user.id, username: user.username, status: user.status };
}

/**
 * Admin action: Delete a student account and their portfolio.
 * @param {string} userId
 */
export function deleteStudentAccount(userId) {
  const store = readStore();
  const userIndex = store.users.findIndex((u) => u.id === userId && u.role === 'student');
  if (userIndex === -1) throw new Error('Student account not found.');

  store.users.splice(userIndex, 1);
  const portfolioIndex = store.portfolios.findIndex((p) => p.user_id === userId);
  if (portfolioIndex !== -1) {
    store.portfolios.splice(portfolioIndex, 1);
  }

  deleteSessionsByUserId(userId);
  persistStoreSync(store);
  return { success: true };
}

/* ==========================================================================
   IN-MEMORY SESSION MANAGEMENT
   ========================================================================== */

export function createSession({ id, userId, csrfTokenHash, expiresAt }) {
  inMemorySessions.set(id, {
    id,
    userId,
    csrfTokenHash,
    expiresAt: expiresAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  });
}

export function getSession(sessionTokenHash) {
  if (!sessionTokenHash) return null;
  const session = inMemorySessions.get(sessionTokenHash);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt) <= new Date()) {
    inMemorySessions.delete(sessionTokenHash);
    return null;
  }

  const user = getUserById(session.userId);
  if (!user) {
    inMemorySessions.delete(sessionTokenHash);
    return null;
  }

  return {
    id: session.id,
    user_id: user.id,
    csrf_token_hash: session.csrfTokenHash,
    expires_at: session.expiresAt,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    status: user.status
  };
}

export function deleteSession(sessionTokenHash) {
  if (!sessionTokenHash) return false;
  return inMemorySessions.delete(sessionTokenHash);
}

export function deleteSessionsByUserId(userId) {
  if (!userId) return 0;
  let count = 0;
  for (const [key, sess] of inMemorySessions.entries()) {
    if (sess.userId === userId) {
      inMemorySessions.delete(key);
      count++;
    }
  }
  return count;
}

export function expireAllSessions() {
  for (const session of inMemorySessions.values()) {
    session.expiresAt = new Date(Date.now() - 3600 * 1000).toISOString();
  }
}

/* ==========================================================================
   RATE LIMITING (IN-MEMORY)
   ========================================================================== */

export function recordLoginAttempt(ip, username) {
  if (!username) return;
  const cleanUser = typeof username === 'string' ? username.trim().toLowerCase() : '';
  const adminUser = (process.env.ADMIN_USERNAME || 'admin_1234').trim().toLowerCase();

  // Administrator login attempts are never recorded to prevent 15-minute lockout
  if (cleanUser === adminUser || cleanUser === 'admin_1234') {
    return;
  }

  loginAttemptLogs.push({
    ip,
    username: cleanUser,
    attempted_at: Date.now()
  });
}

export function getRecentLoginAttempts(ip, username, windowMs = 15 * 60 * 1000) {
  if (!username) return 0;
  const cleanUser = typeof username === 'string' ? username.trim().toLowerCase() : '';
  const adminUser = (process.env.ADMIN_USERNAME || 'admin_1234').trim().toLowerCase();

  // Administrator is never locked out
  if (cleanUser === adminUser || cleanUser === 'admin_1234') {
    return 0;
  }

  const cutoff = Date.now() - (typeof windowMs === 'number' && windowMs > 1000 ? windowMs : 15 * 60 * 1000);
  return loginAttemptLogs.filter(
    (log) => log.attempted_at >= cutoff && (log.ip === ip && cleanUser && log.username === cleanUser)
  ).length;
}

export function clearLoginAttempts(username) {
  if (!username) return;
  const clean = username.trim().toLowerCase();
  let i = loginAttemptLogs.length;
  while (i--) {
    if (loginAttemptLogs[i].username === clean) {
      loginAttemptLogs.splice(i, 1);
    }
  }
}

export function cleanupOldLoginAttempts(olderThanMs = 60 * 60 * 1000) {
  const cutoff = Date.now() - olderThanMs;
  let i = loginAttemptLogs.length;
  while (i--) {
    if (loginAttemptLogs[i].attempted_at < cutoff) {
      loginAttemptLogs.splice(i, 1);
    }
  }
}

export default {
  getDatabase,
  closeDatabase,
  applyMigrations,
  getUserById,
  getUserByUsername,
  getAdminUser,
  validateInterests,
  parseInterests,
  isValidHttpUrl,
  parseJsonArray,
  validateSkills,
  validateProjects,
  createStudentWithPortfolio,
  getPortfolioByUserId,
  updateStudentPortfolio,
  publishPortfolio,
  unpublishPortfolio,
  getPublicPortfolioByUsername,
  updatePortfolioInterests,
  updateUserPassword,
  initAdmin,
  getAdminOverview,
  updateUserStatus,
  deleteStudentAccount,
  createSession,
  getSession,
  deleteSession,
  deleteSessionsByUserId,
  recordLoginAttempt,
  getRecentLoginAttempts,
  clearLoginAttempts,
  cleanupOldLoginAttempts
};
