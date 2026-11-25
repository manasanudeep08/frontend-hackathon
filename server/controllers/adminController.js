import { sendJson, sendError } from '../utils/response.js';
import { parseJsonBody } from '../utils/bodyParser.js';
import { requireRole } from '../middleware/auth.js';
import {
  getAdminOverview,
  updateUserStatus,
  deleteStudentAccount,
  getPortfolioByUserId,
  publishPortfolio,
  unpublishPortfolio
} from '../db/database.js';

/**
 * Handle GET /api/admin/overview
 * Returns dashboard statistics and real student list.
 */
export async function handleAdminOverview(req, res) {
  const auth = requireRole(req, res, 'admin');
  if (!auth) return;

  try {
    const data = getAdminOverview();
    return sendJson(res, 200, {
      success: true,
      ...data
    });
  } catch (err) {
    return sendError(res, 500, err.message || 'Failed to retrieve admin overview.');
  }
}

/**
 * Handle POST /api/admin/students/:id/status
 * Updates student account status: 'active' or 'suspended'.
 */
export async function handleUpdateStudentStatus(req, res, studentId) {
  const auth = requireRole(req, res, 'admin');
  if (!auth) return;

  if (!studentId) {
    return sendError(res, 400, 'Student ID is required.');
  }

  let body;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return sendError(res, 400, err.message || 'Malformed JSON in request body.');
  }

  const { status } = body || {};
  if (status !== 'active' && status !== 'suspended') {
    return sendError(res, 400, "Status must be either 'active' or 'suspended'.");
  }

  try {
    const result = updateUserStatus(studentId, status);
    return sendJson(res, 200, {
      success: true,
      message: `Student account ${status === 'active' ? 'activated' : 'suspended'} successfully.`,
      user: result
    });
  } catch (err) {
    return sendError(res, 400, err.message);
  }
}

/**
 * Handle POST /api/admin/students/:id/portfolio/toggle-publish
 * Toggles student's portfolio between published and draft.
 */
export async function handleAdminTogglePublish(req, res, studentId) {
  const auth = requireRole(req, res, 'admin');
  if (!auth) return;

  if (!studentId) {
    return sendError(res, 400, 'Student ID is required.');
  }

  const portfolio = getPortfolioByUserId(studentId);
  if (!portfolio) {
    return sendError(res, 404, 'Portfolio not found for this student.');
  }

  try {
    if (portfolio.is_published === 1) {
      unpublishPortfolio(studentId);
      return sendJson(res, 200, {
        success: true,
        isPublished: false,
        message: 'Student portfolio returned to draft mode.'
      });
    } else {
      const pub = publishPortfolio(studentId);
      return sendJson(res, 200, {
        success: true,
        isPublished: true,
        message: 'Student portfolio published successfully.',
        publicUrl: pub.publicUrl
      });
    }
  } catch (err) {
    return sendError(res, 400, err.message);
  }
}

/**
 * Handle DELETE /api/admin/students/:id
 * Permanently removes a student account and their associated portfolio.
 */
export async function handleDeleteStudent(req, res, studentId) {
  const auth = requireRole(req, res, 'admin');
  if (!auth) return;

  if (!studentId) {
    return sendError(res, 400, 'Student ID is required.');
  }

  try {
    deleteStudentAccount(studentId);
    return sendJson(res, 200, {
      success: true,
      message: 'Student account and portfolio deleted successfully.'
    });
  } catch (err) {
    return sendError(res, 400, err.message);
  }
}
