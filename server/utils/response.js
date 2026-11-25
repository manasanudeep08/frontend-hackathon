/**
 * Native Node.js Response Utilities
 * Provides standard JSON responses, CORS headers, and error handling.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};

/**
 * Send standard JSON response
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {object} data
 */
export function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, CORS_HEADERS);
  res.end(JSON.stringify(data));
}

/**
 * Handle CORS Preflight (OPTIONS)
 * @param {import('node:http').ServerResponse} res
 */
export function handlePreflight(res) {
  res.writeHead(204, CORS_HEADERS);
  res.end();
}

/**
 * Send error response with standardized payload
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} [details=null]
 */
export function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    success: false,
    error: {
      status: statusCode,
      message,
      ...(details ? { details } : {})
    }
  });
}
