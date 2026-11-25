import http from 'node:http';
import { dispatchRoute } from './router.js';
import { sendError } from './utils/response.js';
import { getDatabase, initAdmin, closeDatabase } from './db/database.js';
import { getSessionSecret } from './middleware/auth.js';

const PORT = parseInt(process.env.PORT, 10) || 5050;
const HOST = process.env.HOST || '127.0.0.1';
const IS_PROD = process.env.NODE_ENV === 'production';

// Initialize JSON file storage (data/portfolio-data.json)
getDatabase();

// Enforce environment security checks on startup
try {
  // Validate session secret entropy
  getSessionSecret();

  // Idempotently initialize administrator account from environment
  await initAdmin();
} catch (err) {
  if (IS_PROD) {
    console.error('[Production Startup Error]', err.message);
    process.exit(1);
  } else {
    console.warn('[Security/Admin Notice]', err.message);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    await dispatchRoute(req, res);
  } catch (error) {
    console.error('[Unhandled Server Error]', error);
    if (!res.headersSent) {
      sendError(res, 500, 'Internal Server Error', error.message);
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[Native HTTP Server] Running at http://localhost:${PORT}`);
  console.log(`[Native HTTP Server] Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
function handleShutdown(signal) {
  console.log(`\n[Native HTTP Server] Received ${signal}. Closing HTTP server...`);
  closeDatabase();
  server.close(() => {
    console.log('[Native HTTP Server] Server closed cleanly.');
    process.exit(0);
  });

  // Force exit if close hangs
  setTimeout(() => {
    console.error('[Native HTTP Server] Forcefully shutting down.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default server;
