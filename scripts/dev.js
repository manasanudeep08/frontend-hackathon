import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VITE_BIN = path.resolve(ROOT_DIR, 'node_modules/vite/bin/vite.js');

console.log('\n=============================================================');
console.log(' Starting Portfolio Platform Development Environment');
console.log('=============================================================');
console.log('-> Backend API Server: http://localhost:5050');
console.log('-> Frontend Dev App:  http://localhost:3000');
console.log('=============================================================\n');

// 1. Spawn native Node.js backend server
const serverProcess = spawn(
  process.execPath,
  ['--env-file-if-exists=.env', 'server/index.js'],
  {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  }
);

// 2. Spawn Vite frontend dev server
const viteProcess = spawn(
  process.execPath,
  [VITE_BIN],
  {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  }
);

function cleanup() {
  console.log('\n[Dev Runner] Shutting down development processes...');
  try {
    serverProcess.kill('SIGINT');
  } catch {}
  try {
    viteProcess.kill('SIGINT');
  } catch {}
  setTimeout(() => process.exit(0), 500);
}

serverProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[Dev Runner] Backend process exited with code ${code}`);
    cleanup();
  }
});

viteProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[Dev Runner] Vite process exited with code ${code}`);
    cleanup();
  }
});

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
