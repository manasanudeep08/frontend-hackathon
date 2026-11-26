const ALLOWED_ORIGIN = 'https://manasanudeep08.github.io';

function getCorsHeaders(res) {
  const origin = res.__request?.headers?.origin;

  return {
    ...(origin === ALLOWED_ORIGIN ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

export function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, getCorsHeaders(res));
  res.end(JSON.stringify(data));
}

export function handlePreflight(res) {
  res.writeHead(204, getCorsHeaders(res));
  res.end();
}

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