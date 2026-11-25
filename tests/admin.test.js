import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dispatchRoute } from '../server/router.js';
import {
  getDatabase,
  closeDatabase,
  initAdmin,
  createStudentWithPortfolio,
  updateStudentPortfolio,
  publishPortfolio
} from '../server/db/database.js';
import { hashPassword } from '../server/utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_ADMIN_DB = path.resolve(__dirname, '../data/test_admin_suite.json');
const TEST_PORT = 5061;

process.env.DATA_FILE_PATH = TEST_ADMIN_DB;
process.env.SESSION_SECRET = 'admin_suite_session_secret_at_least_32_characters_long_abcdef123456';
if (!process.env.ADMIN_USERNAME) {
  process.env.ADMIN_USERNAME = 'admin_1234';
}
if (!process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = 'AdminTestFallbackSecret123!';
}

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function extractCookie(res) {
  const cookieHeader = res.headers['set-cookie'];
  if (!cookieHeader) return null;
  const first = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
  const match = first.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}

async function runAdminTests() {
  console.log('\n--- Testing Phase 08.3.1: Admin Module & Platform Moderation ---');

  if (fs.existsSync(TEST_ADMIN_DB)) fs.unlinkSync(TEST_ADMIN_DB);

  // Initialize store and admin credentials
  getDatabase(TEST_ADMIN_DB);
  await initAdmin(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);

  // Create two sample students
  const p1 = await hashPassword('Student1Pass123!');
  const student1 = createStudentWithPortfolio({
    username: 'john_doe',
    fullName: 'John Doe',
    passwordHash: p1.hash,
    passwordSalt: p1.salt,
    interests: ['Web Development', 'AI / Machine Learning']
  });
  updateStudentPortfolio(student1.user.id, {
    headline: 'Frontend Engineer',
    skills: ['React', 'CSS'],
    projects: [{ title: 'Portfolio Pro', category: 'Web Application' }]
  });
  publishPortfolio(student1.user.id);

  const p2 = await hashPassword('Student2Pass123!');
  const student2 = createStudentWithPortfolio({
    username: 'jane_smith',
    fullName: 'Jane Smith',
    passwordHash: p2.hash,
    passwordSalt: p2.salt,
    interests: ['Cybersecurity']
  });

  const server = http.createServer(async (req, res) => {
    try {
      await dispatchRoute(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.end(err.message);
    }
  });

  await new Promise((r) => server.listen(TEST_PORT, r));

  try {
    // 1. Unauthenticated access to /api/admin/overview must return 401
    console.log('1. Testing Unauthenticated Admin Endpoint Protection (401)...');
    const unauthRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/admin/overview',
      method: 'GET'
    });
    assert.equal(unauthRes.statusCode, 401, 'Unauthenticated access must return 401');
    console.log('Unauthenticated access blocked: PASS');

    // 2. Student attempting access to admin endpoints must return 403
    console.log('2. Testing Student Access to Admin Endpoints Blocked (403)...');
    const studentLogin = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'john_doe',
      password: 'Student1Pass123!'
    });
    const studentCookie = extractCookie(studentLogin);

    const studentAdminRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { Cookie: `session_id=${studentCookie}` }
    });
    assert.equal(studentAdminRes.statusCode, 403, 'Student accessing admin endpoints must return 403');
    console.log('Student access to admin blocked: PASS');

    // 3a. Verify incorrect credentials return 401 with no 15-minute lockout even after repeated attempts
    console.log('3a. Testing Admin Lockout Exemption (repeated failed attempts do not trigger 429)...');
    for (let i = 1; i <= 6; i++) {
      const failedRes = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        username: process.env.ADMIN_USERNAME,
        password: 'incorrect_password_attempt_' + i
      });
      assert.equal(failedRes.statusCode, 401, `Attempt ${i} must return 401 Unauthorized, not 429`);
      assert.equal(failedRes.body?.error?.message, 'Invalid username or password.');
    }
    console.log('Admin lockout exemption verified (6 failed attempts returned 401 without 429 lockout): PASS');

    // 3b. Admin Login with configured credentials immediately following failures
    console.log('3b. Testing Admin Login with Configured Demonstration Credentials Immediately After Failures...');
    const adminLogin = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    });
    assert.equal(adminLogin.statusCode, 200, 'Admin login succeeded');
    assert.equal(adminLogin.body.user.role, 'admin');
    const adminCookie = extractCookie(adminLogin);
    const adminCsrf = adminLogin.body.csrfToken;
    assert.ok(adminCookie, 'Admin session cookie set');
    assert.ok(adminCsrf, 'Admin CSRF token returned');
    console.log('Admin login with demonstration credentials: PASS');

    // 4. Admin Overview statistics verification
    console.log('4. Testing Admin Overview Statistics & Student List...');
    const overviewRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { Cookie: `session_id=${adminCookie}` }
    });
    assert.equal(overviewRes.statusCode, 200);
    assert.equal(overviewRes.body.totalStudents, 2, 'Exactly 2 students reported');
    assert.equal(overviewRes.body.totalPortfolios, 2);
    assert.equal(overviewRes.body.publishedPortfolios, 1, 'Exactly 1 published');
    assert.equal(overviewRes.body.draftPortfolios, 1, 'Exactly 1 draft');
    assert.equal(overviewRes.body.students.length, 2);
    console.log('Admin overview statistics verified: PASS');

    // 5. Admin Moderation: Unpublish student 1 portfolio
    console.log('5. Testing Admin Unpublishing Student Portfolio...');
    const unpublishRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api/admin/students/${student1.user.id}/portfolio/toggle-publish`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${adminCookie}`,
        'X-CSRF-Token': adminCsrf
      }
    });
    assert.equal(unpublishRes.statusCode, 200);
    assert.equal(unpublishRes.body.isPublished, false);

    // Verify public route returns 404 now
    const publicCheck = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/p/john_doe',
      method: 'GET'
    });
    assert.equal(publicCheck.statusCode, 404, 'Unpublished student portfolio returns 404');
    console.log('Admin unpublishing verified: PASS');

    // 6. Admin Moderation: Suspend and reactivate student account
    console.log('6. Testing Admin Suspending & Activating Student Account...');
    const suspendRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api/admin/students/${student1.user.id}/status`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${adminCookie}`,
        'X-CSRF-Token': adminCsrf
      }
    }, { status: 'suspended' });
    assert.equal(suspendRes.statusCode, 200);
    assert.equal(suspendRes.body.user.status, 'suspended');

    const activateRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api/admin/students/${student1.user.id}/status`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${adminCookie}`,
        'X-CSRF-Token': adminCsrf
      }
    }, { status: 'active' });
    assert.equal(activateRes.statusCode, 200);
    assert.equal(activateRes.body.user.status, 'active');
    console.log('Admin account suspend/activate actions: PASS');

    // 7. Admin Moderation: Delete student account
    console.log('7. Testing Admin Deleting Student Account...');
    const deleteRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api/admin/students/${student2.user.id}`,
      method: 'DELETE',
      headers: {
        Cookie: `session_id=${adminCookie}`,
        'X-CSRF-Token': adminCsrf
      }
    });
    assert.equal(deleteRes.statusCode, 200);
    assert.equal(deleteRes.body.success, true);

    // Verify student count decreased to 1
    const finalOverview = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { Cookie: `session_id=${adminCookie}` }
    });
    assert.equal(finalOverview.body.totalStudents, 1);
    console.log('Admin delete student action: PASS');

  } finally {
    await new Promise((r) => server.close(r));
    closeDatabase();
    if (fs.existsSync(TEST_ADMIN_DB)) fs.unlinkSync(TEST_ADMIN_DB);
  }

  console.log('\nAll 7 Phase 08.3.1 Admin Module tests passed successfully!\n');
}

runAdminTests().catch((err) => {
  console.error('\nTest failure in tests/admin.test.js:');
  console.error(err);
  process.exit(1);
});
