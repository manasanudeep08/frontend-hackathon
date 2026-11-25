import { sendJson } from '../utils/response.js';

const startTime = Date.now();

/**
 * Handle GET /api/health
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export function handleHealthCheck(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  sendJson(res, 200, {
    status: 'healthy',
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    runtime: {
      node: process.version,
      platform: process.platform,
      memoryRssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100
    }
  });
}

/**
 * Handle GET /api/info
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export function handleServerInfo(req, res) {
  sendJson(res, 200, {
    service: 'Portfolio Native HTTP Server',
    architecture: 'Native Node.js without external frameworks',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/api/health', description: 'System health and uptime' },
      { method: 'GET', path: '/api/info', description: 'Service information' },
      { method: 'POST', path: '/api/contact', description: 'Contact form submissions' },
      { method: 'GET', path: '/api/github/profile', description: 'GitHub user profile integration' },
      { method: 'GET', path: '/api/github/repos', description: 'GitHub public repositories' }
    ]
  });
}
