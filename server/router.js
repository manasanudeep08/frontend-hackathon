import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleHealthCheck, handleServerInfo } from './controllers/dataController.js';
import { handleContactSubmission } from './controllers/contactController.js';
import { handleGitHubProfile, handleGitHubRepos } from './controllers/githubController.js';
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleMe
} from './controllers/authController.js';
import {
  handleGetStudentPortfolio,
  handleUpdateStudentPortfolio,
  handlePublishPortfolio,
  handleUnpublishPortfolio,
  handleGetPublicPortfolio
} from './controllers/portfolioController.js';
import {
  handleAdminOverview,
  handleUpdateStudentStatus,
  handleAdminTogglePublish,
  handleDeleteStudent
} from './controllers/adminController.js';
import { handlePreflight, sendError } from './utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf'
};

/**
 * Native Static File Streamer for Built Client Assets
 * Features strict path traversal prevention, encoded attack rejection,
 * and distribution boundary enforcement.
 * 
 * @param {string} rawPathname
 * @param {import('node:http').ServerResponse} res
 */
function serveStaticFile(rawPathname, res) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPathname);
  } catch {
    return sendError(res, 400, 'Bad Request: Malformed URI sequence');
  }

  // Reject null bytes
  if (decodedPath.includes('\0')) {
    return sendError(res, 400, 'Bad Request: Null byte detected');
  }

  // Reject directory traversal patterns
  if (decodedPath.includes('..') || rawPathname.includes('%2e') || rawPathname.includes('%2E')) {
    return sendError(res, 403, 'Forbidden: Path traversal attempt blocked');
  }

  // Strip leading slashes and backslashes to ensure relative path resolution
  const relativeTarget = decodedPath.replace(/^[/\\]+/, '');
  const targetName = relativeTarget === '' ? 'index.html' : relativeTarget;

  // Resolve absolute path against DIST_DIR
  const resolvedPath = path.resolve(DIST_DIR, targetName);

  // Strictly verify the final resolved path is inside DIST_DIR
  const isInsideDist = resolvedPath === DIST_DIR || resolvedPath.startsWith(DIST_DIR + path.sep);
  if (!isInsideDist) {
    return sendError(res, 403, 'Forbidden: Access outside distribution directory denied');
  }

  let finalPath = resolvedPath;
  if (!fs.existsSync(finalPath) || fs.statSync(finalPath).isDirectory()) {
    // If request has an explicit file extension or is a dotfile (.env, .git, .json, etc.), return 404
    // Do NOT fall back to index.html for missing asset requests or protected file probes
    const ext = path.extname(finalPath);
    const baseName = path.basename(finalPath);
    if (ext || baseName.startsWith('.')) {
      return sendError(res, 404, 'Static asset not found');
    }
    // Only extensionless SPA routes fallback to index.html
    finalPath = path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(finalPath)) {
    return sendError(res, 404, 'Static asset not found. Please run `npm run build` first.');
  }

  // Double check distribution directory boundary
  if (finalPath !== DIST_DIR && !finalPath.startsWith(DIST_DIR + path.sep)) {
    return sendError(res, 403, 'Forbidden');
  }

  const ext = path.extname(finalPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff'
  });

  const stream = fs.createReadStream(finalPath);
  stream.on('error', (err) => {
    console.error('[Static Stream Error]', err);
    if (!res.headersSent) {
      sendError(res, 500, 'Error streaming file');
    }
  });
  stream.pipe(res);
}

/**
 * Native Request Dispatcher
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export async function dispatchRoute(req, res) {
res.__request = req;
  // Reject directory traversal or null byte attempts on the raw request URL
  if (req.url.includes('..') || /%2e/i.test(req.url) || /%5c/i.test(req.url)) {
    return sendError(res, 403, 'Forbidden: Path traversal attempt blocked');
  }

  if (req.url.includes('\0') || req.url.includes('%00')) {
    return sendError(res, 400, 'Bad Request: Null byte detected');
  }

  const method = req.method.toUpperCase();
  const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return handlePreflight(res);
  }

  // API Routing Table
  if (pathname === '/api/health') {
    if (method !== 'GET') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}`);
    return handleHealthCheck(req, res);
  }

  if (pathname === '/api/info') {
    if (method !== 'GET') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}`);
    return handleServerInfo(req, res);
  }

  if (pathname === '/api/contact') {
    if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use POST.`);
    return handleContactSubmission(req, res);
  }

  if (pathname === '/api/github/profile') {
    if (method !== 'GET') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}`);
    return handleGitHubProfile(req, res);
  }

  if (pathname === '/api/github/repos') {
    if (method !== 'GET') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}`);
    return handleGitHubRepos(req, res);
  }

  // Authentication API Endpoints
  if (pathname === '/api/auth/register') {
    if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use POST.`);
    return handleRegister(req, res);
  }

  if (pathname === '/api/auth/login') {
    if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use POST.`);
    return handleLogin(req, res);
  }

  if (pathname === '/api/auth/logout') {
    if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use POST.`);
    return handleLogout(req, res);
  }

  if (pathname === '/api/auth/me') {
    if (method !== 'GET') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use GET.`);
    return handleMe(req, res);
  }

  // Student Portfolio Management Endpoints
  if (pathname === '/api/student/portfolio') {
    if (method === 'GET') {
      return handleGetStudentPortfolio(req, res);
    }
    if (method === 'PUT') {
      return handleUpdateStudentPortfolio(req, res);
    }
    return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use GET or PUT.`);
  }

  if (pathname === '/api/student/portfolio/publish') {
    if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use POST.`);
    return handlePublishPortfolio(req, res);
  }

  if (pathname === '/api/student/portfolio/unpublish') {
    if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use POST.`);
    return handleUnpublishPortfolio(req, res);
  }

  // Administrator Endpoints
  if (pathname === '/api/admin/overview') {
    if (method !== 'GET') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use GET.`);
    return handleAdminOverview(req, res);
  }

  if (pathname.startsWith('/api/admin/students/')) {
    const subPath = pathname.slice('/api/admin/students/'.length);
    const parts = subPath.split('/');
    const studentId = parts[0];
    const action = parts[1];

    if (action === 'status') {
      if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed. Use POST.`);
      return handleUpdateStudentStatus(req, res, studentId);
    }

    if (parts.length >= 2 && parts[1] === 'portfolio' && parts[2] === 'toggle-publish') {
      if (method !== 'POST') return sendError(res, 405, `Method ${method} Not Allowed. Use POST.`);
      return handleAdminTogglePublish(req, res, studentId);
    }

    if (method === 'DELETE' && parts.length === 1) {
      return handleDeleteStudent(req, res, studentId);
    }

    return sendError(res, 404, `Admin student action ${subPath} not found`);
  }

  // Public Student Portfolio Inspection Endpoint: GET /api/p/:username
  if (pathname.startsWith('/api/p/')) {
    if (method !== 'GET') return sendError(res, 405, `Method ${method} Not Allowed on ${pathname}. Use GET.`);
    const username = pathname.slice('/api/p/'.length).replace(/\/.*$/, '');
    return handleGetPublicPortfolio(req, res, username);
  }

  // 404 for unmatched /api routes
  if (pathname.startsWith('/api')) {
    return sendError(res, 404, `Endpoint ${pathname} not found`);
  }

  // Serve Built Frontend Assets for Non-API Requests
  if (method === 'GET' || method === 'HEAD') {
    return serveStaticFile(pathname, res);
  }

  return sendError(res, 405, `Method ${method} Not Allowed`);
}
