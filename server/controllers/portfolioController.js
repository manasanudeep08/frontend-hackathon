import { sendJson, sendError } from '../utils/response.js';
import { parseJsonBody } from '../utils/bodyParser.js';
import { requireRole } from '../middleware/auth.js';
import {
  getDatabase,
  getPortfolioByUserId,
  updateStudentPortfolio,
  publishPortfolio,
  unpublishPortfolio,
  getPublicPortfolioByUsername
} from '../db/database.js';

/**
 * Handle GET /api/student/portfolio
 * Returns authenticated student's own portfolio.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleGetStudentPortfolio(req, res, dbInstance) {
  const db = dbInstance || getDatabase();
  const auth = requireRole(req, res, 'student', db);
  if (!auth) return;

  const portfolio = getPortfolioByUserId(auth.user.id, db);
  if (!portfolio) {
    return sendError(res, 404, 'Portfolio record not found.');
  }

  return sendJson(res, 200, {
    success: true,
    portfolio: {
      id: portfolio.id,
      userId: portfolio.user_id,
      slug: portfolio.slug,
      username: portfolio.username,
      fullName: portfolio.full_name || auth.user.fullName,
      headline: portfolio.headline || '',
      bioIntro: portfolio.bio_intro || '',
      degree: portfolio.degree || '',
      institution: portfolio.institution || '',
      academicPeriod: portfolio.academic_period || '',
      location: portfolio.location || '',
      interests: portfolio.interests || [],
      skills: portfolio.skills || [],
      projects: portfolio.projects || [],
      contactEmail: portfolio.contact_email || '',
      showEmailPublicly: Boolean(portfolio.show_email_publicly),
      githubUrl: portfolio.github_url || '',
      linkedinUrl: portfolio.linkedin_url || '',
      isPublished: portfolio.is_published === 1,
      createdAt: portfolio.created_at,
      updatedAt: portfolio.updated_at
    }
  });
}

/**
 * Allowed fields for PUT /api/student/portfolio
 */
const ALLOWED_UPDATE_FIELDS = new Set([
  'fullName',
  'headline',
  'bioIntro',
  'degree',
  'institution',
  'academicPeriod',
  'location',
  'interests',
  'skills',
  'projects',
  'contactEmail',
  'showEmailPublicly',
  'githubUrl',
  'linkedinUrl'
]);

/**
 * Handle PUT /api/student/portfolio
 * Validates and updates the authenticated student's own portfolio with debounced autosave.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleUpdateStudentPortfolio(req, res, dbInstance) {
  const db = dbInstance || getDatabase();
  const auth = requireRole(req, res, 'student', db);
  if (!auth) return;

  let body;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return sendError(res, 400, err.message || 'Malformed JSON in request body.');
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return sendError(res, 400, 'Request body must be a JSON object.');
  }

  // Filter against allowed whitelist
  const filtered = {};
  for (const key of Object.keys(body)) {
    if (ALLOWED_UPDATE_FIELDS.has(key)) {
      filtered[key] = body[key];
    }
  }

  try {
    const updated = updateStudentPortfolio(auth.user.id, filtered, db);
    return sendJson(res, 200, {
      success: true,
      message: 'Portfolio updated successfully.',
      portfolio: {
        id: updated.id,
        userId: updated.user_id,
        slug: updated.slug,
        username: updated.username,
        fullName: updated.full_name,
        headline: updated.headline || '',
        bioIntro: updated.bio_intro || '',
        degree: updated.degree || '',
        institution: updated.institution || '',
        academicPeriod: updated.academic_period || '',
        location: updated.location || '',
        interests: updated.interests || [],
        skills: updated.skills || [],
        projects: updated.projects || [],
        contactEmail: updated.contact_email || '',
        showEmailPublicly: Boolean(updated.show_email_publicly),
        githubUrl: updated.github_url || '',
        linkedinUrl: updated.linkedin_url || '',
        isPublished: updated.is_published === 1,
        updatedAt: updated.updated_at
      }
    });
  } catch (err) {
    return sendError(res, 400, err.message);
  }
}

/**
 * Handle POST /api/student/portfolio/publish
 * Validates minimum required fields and publishes the authenticated student's portfolio.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handlePublishPortfolio(req, res, dbInstance) {
  const db = dbInstance || getDatabase();
  const auth = requireRole(req, res, 'student', db);
  if (!auth) return;

  try {
    const result = publishPortfolio(auth.user.id, db);
    return sendJson(res, 200, {
      success: true,
      isPublished: true,
      slug: result.slug,
      publicUrl: result.publicUrl,
      message: 'Portfolio published successfully. It is now publicly accessible.'
    });
  } catch (err) {
    return sendError(res, 400, err.message);
  }
}

/**
 * Handle POST /api/student/portfolio/unpublish
 * Converts the authenticated student's published portfolio back to draft status.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleUnpublishPortfolio(req, res, dbInstance) {
  const db = dbInstance || getDatabase();
  const auth = requireRole(req, res, 'student', db);
  if (!auth) return;

  try {
    const result = unpublishPortfolio(auth.user.id, db);
    return sendJson(res, 200, {
      success: true,
      isPublished: false,
      message: 'Portfolio converted to draft. It is no longer publicly visible.'
    });
  } catch (err) {
    return sendError(res, 400, err.message);
  }
}

/**
 * Handle GET /api/p/:username
 * Publicly retrieves a published student portfolio by its username slug.
 * Strictly sanitizes private fields and returns 404 for drafts or nonexistent accounts.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} username
 * @param {DatabaseSync} [dbInstance]
 */
export async function handleGetPublicPortfolio(req, res, username, dbInstance) {
  const db = dbInstance || getDatabase();

  if (!username || typeof username !== 'string') {
    return sendError(res, 400, 'Username slug is required.');
  }

  const portfolio = getPublicPortfolioByUsername(username, db);
  if (!portfolio) {
    return sendError(res, 404, 'Portfolio not found or is currently private.');
  }

  return sendJson(res, 200, {
    success: true,
    portfolio
  });
}
