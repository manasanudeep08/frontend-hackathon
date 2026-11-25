import { parseJsonBody } from '../utils/bodyParser.js';
import { sendJson, sendError } from '../utils/response.js';

/**
 * IN-MEMORY INQUIRY STORE
 * 
 * Storage & Delivery Behavior:
 * - Inquiries submitted through POST /api/contact are held in this Node.js process in-memory array.
 * - Max capacity is bounded to 100 entries to prevent memory exhaustion.
 * - Inquiries persist only while the Node.js process is active and reset upon restart.
 * - External database persistence and SMTP/API email delivery are currently NOT configured
 *   to preserve the zero-external-dependency requirement.
 * - API responses accurately report this status and do not claim that an email was sent.
 */
const receivedInquiries = [];
const MAX_STORED_INQUIRIES = 100;

// Standard email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input boundary limits
const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MIN: 5,
  EMAIL_MAX: 120,
  SUBJECT_MAX: 150,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 3000
};

/**
 * Sanitize user text by stripping non-printable control characters
 * @param {any} input
 * @returns {string}
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate contact submission payload
 * @param {object} payload
 * @returns {{ isValid: boolean, errors: Record<string, string>, sanitized: object }}
 */
export function validateContactPayload(payload) {
  const errors = {};

  const rawName = payload.name;
  const rawEmail = payload.email;
  const rawSubject = payload.subject;
  const rawMessage = payload.message;

  const name = sanitizeText(rawName);
  const email = sanitizeText(rawEmail).toLowerCase();
  const subject = sanitizeText(rawSubject);
  const message = sanitizeText(rawMessage);

  // 1. Name validation
  if (!name || name.length < LIMITS.NAME_MIN) {
    errors.name = `Name is required (minimum ${LIMITS.NAME_MIN} characters).`;
  } else if (name.length > LIMITS.NAME_MAX) {
    errors.name = `Name cannot exceed ${LIMITS.NAME_MAX} characters.`;
  }

  // 2. Email validation
  if (!email || email.length < LIMITS.EMAIL_MIN || !EMAIL_REGEX.test(email)) {
    errors.email = 'A valid email address is required.';
  } else if (email.length > LIMITS.EMAIL_MAX) {
    errors.email = `Email cannot exceed ${LIMITS.EMAIL_MAX} characters.`;
  }

  // 3. Subject validation (optional, bounded)
  if (subject && subject.length > LIMITS.SUBJECT_MAX) {
    errors.subject = `Subject cannot exceed ${LIMITS.SUBJECT_MAX} characters.`;
  }

  // 4. Message validation
  if (!message || message.length < LIMITS.MESSAGE_MIN) {
    errors.message = `Message is required (minimum ${LIMITS.MESSAGE_MIN} characters).`;
  } else if (message.length > LIMITS.MESSAGE_MAX) {
    errors.message = `Message cannot exceed ${LIMITS.MESSAGE_MAX} characters.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name,
      email,
      subject: subject || 'Portfolio Inquiry',
      message
    }
  };
}

/**
 * Handle POST /api/contact
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export async function handleContactSubmission(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { website_hp } = body || {};

    // Anti-spam honeypot: if filled by a bot, silently return success without storing
    if (website_hp) {
      return sendJson(res, 200, {
        success: true,
        message: 'Inquiry received.'
      });
    }

    const { isValid, errors, sanitized } = validateContactPayload(body || {});

    if (!isValid) {
      return sendError(res, 400, 'Validation failed. Please correct the highlighted errors.', errors);
    }

    const newInquiry = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: sanitized.name,
      email: sanitized.email,
      subject: sanitized.subject,
      message: sanitized.message,
      receivedAt: new Date().toISOString(),
      status: 'accepted_in_memory_only',
      deliveredToOwner: false
    };

    // Cap in-memory storage to prevent unbounded growth
    if (receivedInquiries.length >= MAX_STORED_INQUIRIES) {
      receivedInquiries.shift();
    }
    receivedInquiries.push(newInquiry);

    console.log(`[Contact] Inquiry accepted in-memory from: ${newInquiry.name} <${newInquiry.email}>: "${newInquiry.subject}"`);

    // Accurate response semantics: distinguishes accepted and stored in memory from delivered to owner
    return sendJson(res, 201, {
      success: true,
      message: 'Message accepted by server and stored temporarily in session memory. Note: Email delivery is not configured; message has not been delivered to the portfolio owner.',
      data: {
        id: newInquiry.id,
        receivedAt: newInquiry.receivedAt,
        status: newInquiry.status,
        deliveredToOwner: false
      }
    });
  } catch (error) {
    console.error('[Contact Error]', error.message);
    const statusCode = error.message.includes('Payload too large') ? 413 : 400;
    // Safe error response: never expose internal stack traces
    return sendError(res, statusCode, error.message.includes('JSON') ? 'Invalid JSON format in request body' : error.message);
  }
}

/**
 * Access in-memory inquiries count (used for testing)
 */
export function getStoredInquiriesCount() {
  return receivedInquiries.length;
}
