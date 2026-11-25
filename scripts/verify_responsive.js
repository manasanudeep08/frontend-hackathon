import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dispatchRoute } from '../server/router.js';
import {
  getDatabase,
  closeDatabase,
  createStudentWithPortfolio,
  updateStudentPortfolio,
  publishPortfolio
} from '../server/db/database.js';
import { hashPassword } from '../server/utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DB = path.resolve(__dirname, '../data/responsive_test.json');
const TEST_PORT = 5060;
const CDP_PORT = 9222;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
process.env.DATA_FILE_PATH = TEST_DB;
process.env.SESSION_SECRET = 'responsive_test_secret_64_characters_minimum_string_1234567890abcdef';

async function setupDatabase() {
  const db = getDatabase(TEST_DB);
  const pass = await hashPassword('ResponsivePass123!');
  const student = createStudentWithPortfolio(
    {
      username: 'alex_test',
      fullName: 'Alex Test',
      passwordHash: pass.hash,
      passwordSalt: pass.salt,
      interests: ['Web Development', 'Cloud Computing', 'Artificial Intelligence']
    },
    db
  );

  updateStudentPortfolio(
    student.user.id,
    {
      headline: 'Full-Stack Responsive Developer',
      bioIntro: 'Building highly responsive and accessible web applications across mobile, tablet, and desktop viewports.',
      degree: 'B.Tech in Computer Science',
      institution: 'Premier Institute of Technology',
      academicPeriod: '2023 - 2027',
      location: 'Hyderabad, India',
      skills: ['React', 'TypeScript', 'Node.js', 'CSS3', 'SQLite', 'Docker'],
      projects: [
        {
          title: 'CloudBridge Suite',
          category: 'Cloud Architecture',
          description: 'High-throughput real-time messaging pipeline built with Node.js and WebSockets.',
          technologies: ['Node.js', 'WebSocket', 'Redis'],
          githubUrl: 'https://github.com/alex/cloudbridge',
          liveUrl: 'https://cloudbridge.test'
        },
        {
          title: 'EdgeAnalytics Pro',
          category: 'Web Application',
          description: 'Edge computing metric dashboard with sub-millisecond query visualizations.',
          technologies: ['React', 'Vite', 'Canvas'],
          githubUrl: 'https://github.com/alex/edgeanalytics'
        }
      ],
      showEmailPublicly: true,
      contactEmail: 'alex.public@test.edu',
      githubUrl: 'https://github.com/alex-test',
      linkedinUrl: 'https://linkedin.com/in/alex-test'
    },
    db
  );

  publishPortfolio(student.user.id, db);
  return student;
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      await dispatchRoute(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.end(err.message);
    }
  });
  return new Promise((resolve) => {
    server.listen(TEST_PORT, () => resolve(server));
  });
}

function launchEdge() {
  return spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    'about:blank'
  ]);
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function waitForCdp() {
  for (let i = 0; i < 20; i++) {
    try {
      const list = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (list && list.length > 0) return list[0];
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('CDP target did not respond in time');
}

class CdpSession {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
}

async function runResponsiveCheck() {
  console.log('\n--- Headless Edge CDP Responsive Verification ---');
  await setupDatabase();
  const server = await startServer();
  console.log(`Server started at http://localhost:${TEST_PORT}`);

  const edgeProcess = launchEdge();
  console.log('Edge headless launched with remote debugging port 9222');

  try {
    const target = await waitForCdp();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));
    const cdp = new CdpSession(ws);

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');

    const viewports = [
      { name: 'Mobile (iPhone 14/15)', width: 390, height: 844 },
      { name: 'Tablet (iPad Portrait)', width: 768, height: 1024 },
      { name: 'Desktop (HD Display)', width: 1366, height: 768 }
    ];

    const routes = [
      { path: '/', label: 'Platform Home' },
      { path: '/demo', label: 'Reference Demo Portfolio' },
      { path: '/p/alex_test', label: 'Published Student Portfolio' },
      { path: '/login', label: 'Student Login' },
      { path: '/register', label: 'Student Registration' }
    ];

    let allPassed = true;

    for (const vp of viewports) {
      console.log(`\nTesting Viewport: ${vp.name} [${vp.width}x${vp.height}]`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width <= 768
      });

      for (const route of routes) {
        const targetUrl = `http://localhost:${TEST_PORT}${route.path}`;
        await cdp.send('Page.navigate', { url: targetUrl });
        // Allow rendering
        await new Promise((r) => setTimeout(r, 600));

        // Evaluate layout metrics
        const evalRes = await cdp.send('Runtime.evaluate', {
          expression: `({
            title: document.title,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            innerWidth: window.innerWidth,
            bodyWidth: document.body.getBoundingClientRect().width,
            h1Text: document.querySelector('h1')?.innerText || '',
            hasNav: Boolean(document.querySelector('nav, .navbar-wrapper, header')),
            hasFooter: Boolean(document.querySelector('footer, .footer-wrapper'))
          })`,
          returnByValue: true
        });

        const val = evalRes.result.value;
        const hasHorizontalOverflow = val.scrollWidth > val.innerWidth;

        if (hasHorizontalOverflow) {
          allPassed = false;
          console.error(`  FAIL [${route.label}]: Horizontal overflow detected! (scrollWidth: ${val.scrollWidth} > innerWidth: ${val.innerWidth})`);
        } else {
          console.log(`  PASS [${route.label}]: No overflow (width: ${val.scrollWidth} <= ${val.innerWidth}) | Title: "${val.title || 'OK'}"`);
        }
      }
    }

    if (allPassed) {
      console.log('\nAll responsive viewports and routes verified successfully with ZERO horizontal overflow!');
    } else {
      throw new Error('Responsive check failed with layout overflows.');
    }

    ws.close();
  } finally {
    edgeProcess.kill();
    await new Promise((r) => server.close(r));
    closeDatabase();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  }
}

runResponsiveCheck().catch((err) => {
  console.error('\nResponsive check error:', err);
  process.exit(1);
});
