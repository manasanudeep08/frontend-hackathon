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
  getUserByUsername,
  updateUserStatus,
  expireAllSessions,
  createSession,
  getSession,
  deleteStudentAccount
} from '../server/db/database.js';
import { hashPassword } from '../server/utils/password.js';
import { requireRole, getSessionSecret } from '../server/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_AUTH_DB = path.resolve(__dirname, '../data/test_auth_suite.json');
const TEST_PORT = 5058;

process.env.DATA_FILE_PATH = TEST_AUTH_DB;
process.env.SESSION_SECRET = 'test_secret_for_auth_suite_64_characters_long_1234567890abcdef1234';
process.env.ADMIN_USERNAME = 'admin_unit_test';
process.env.ADMIN_PASSWORD = 'AdminTest123!Password';

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
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

async function runAuthTests() {
  console.log('\n--- Testing Phase 08.2: Authentication & Authorization ---');

  if (fs.existsSync(TEST_AUTH_DB)) fs.unlinkSync(TEST_AUTH_DB);

  // Initialize DB and Admin
  const db = getDatabase(TEST_AUTH_DB);
  await initAdmin(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, db);

  // Start HTTP server dispatching routes with a custom test endpoint for admin verification
  const server = http.createServer(async (req, res) => {
    // Add test route to verify admin-only protection
    const parsedUrl = new URL(req.url, 'http://127.0.0.1');
    if (parsedUrl.pathname === '/api/test/admin-only') {
      const auth = requireRole(req, res, 'admin', db);
      if (auth) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Welcome Admin' }));
      }
      return;
    }

    if (parsedUrl.pathname === '/api/test/state-changing') {
      const auth = requireRole(req, res, 'student', db);
      if (auth) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'State changed' }));
      }
      return;
    }

    await dispatchRoute(req, res);
  });

  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));

  try {
    let studentCookie = null;
    let studentCsrf = null;
    let adminCookie = null;

    // 1. Successful student registration
    console.log('1. Testing Student Registration (POST /api/auth/register)...');
    const regRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'student_bob',
        password: 'Password123!',
        fullName: 'Bob The Student'
      }
    );

    assert.equal(regRes.statusCode, 201);
    assert.equal(regRes.body.success, true);
    assert.equal(regRes.body.user.username, 'student_bob');
    assert.equal(regRes.body.user.role, 'student');
    assert.ok(regRes.body.csrfToken, 'Should return csrfToken');
    studentCookie = extractCookie(regRes);
    studentCsrf = regRes.body.csrfToken;
    assert.ok(studentCookie, 'Should set session_id cookie');
    console.log('Student registration: PASS');

    // 2. Duplicate username rejection
    console.log('2. Testing Duplicate Username Rejection...');
    const dupRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'STUDENT_BOB',
        password: 'Password123!',
        fullName: 'Duplicate Bob'
      }
    );
    assert.equal(dupRes.statusCode, 409);
    assert.equal(dupRes.body.success, false);
    console.log('Duplicate username rejection: PASS');

    // 3. Student role forced server-side
    console.log('3. Testing Server-Enforced Student Role...');
    const tamperRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'student_mallory',
        password: 'Password123!',
        fullName: 'Mallory Hacker',
        role: 'admin' // Attempted role elevation
      }
    );
    assert.equal(tamperRes.statusCode, 201);
    assert.equal(tamperRes.body.user.role, 'student', 'Role must remain student');
    console.log('Server-enforced student role: PASS');

    // 4. Successful student login
    console.log('4. Testing Student Login (POST /api/auth/login)...');
    const loginStudentRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'student_bob',
        password: 'Password123!'
      }
    );
    assert.equal(loginStudentRes.statusCode, 200);
    assert.equal(loginStudentRes.body.user.role, 'student');
    studentCookie = extractCookie(loginStudentRes);
    studentCsrf = loginStudentRes.body.csrfToken;
    console.log('Student login: PASS');

    // 5. Successful admin login
    console.log('5. Testing Administrator Login (POST /api/auth/login)...');
    const loginAdminRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
      }
    );
    assert.equal(loginAdminRes.statusCode, 200);
    assert.equal(loginAdminRes.body.user.role, 'admin');
    adminCookie = extractCookie(loginAdminRes);
    console.log('Administrator login: PASS');

    // 6. Invalid credentials (generic error)
    console.log('6. Testing Invalid Credentials Generic Error Handling...');
    const invalidPassRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'student_bob',
        password: 'WrongPassword999!'
      }
    );
    assert.equal(invalidPassRes.statusCode, 401);
    assert.equal(invalidPassRes.body.error.message, 'Invalid username or password.');

    const invalidUserRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'non_existent_user_99',
        password: 'SomePassword123!'
      }
    );
    assert.equal(invalidUserRes.statusCode, 401);
    assert.equal(invalidUserRes.body.error.message, 'Invalid username or password.');
    console.log('Invalid credentials generic errors: PASS');

    // 7. Suspended account rejection
    console.log('7. Testing Suspended Account Rejection...');
    const mallory = getUserByUsername('student_mallory');
    updateUserStatus(mallory.id, 'suspended');
    const suspendedRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'student_mallory',
        password: 'Password123!'
      }
    );
    assert.equal(suspendedRes.statusCode, 403);
    assert.ok(suspendedRes.body.error.message.includes('suspended'));
    console.log('Suspended account rejection: PASS');

    // 8. Session creation and verification (GET /api/auth/me)
    console.log('8. Testing Session Verification (GET /api/auth/me)...');
    const meRes = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${studentCookie}` }
    });
    assert.equal(meRes.statusCode, 200);
    assert.equal(meRes.body.user.username, 'student_bob');
    assert.equal(meRes.body.csrfToken, studentCsrf);
    console.log('Session verification: PASS');

    // 9. Session rotation
    console.log('9. Testing Session Rotation on Re-Login...');
    const oldCookie = studentCookie;
    const reLoginRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `session_id=${oldCookie}`
        }
      },
      {
        username: 'student_bob',
        password: 'Password123!'
      }
    );
    const newCookie = extractCookie(reLoginRes);
    assert.notEqual(oldCookie, newCookie, 'New session cookie must be generated');

    // Old cookie must now be invalidated
    const oldCookieCheck = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${oldCookie}` }
    });
    assert.equal(oldCookieCheck.statusCode, 401, 'Old session cookie must be invalid after rotation');
    studentCookie = newCookie;
    studentCsrf = reLoginRes.body.csrfToken;
    console.log('Session rotation: PASS');

    // 10. Logout invalidation
    console.log('10. Testing Logout Invalidation...');
    const logoutRes = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        Cookie: `session_id=${studentCookie}`,
        'X-CSRF-Token': studentCsrf
      }
    });
    assert.equal(logoutRes.statusCode, 200);
    assert.ok(logoutRes.headers['set-cookie'][0].includes('Max-Age=0'));

    const loggedOutCheck = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${studentCookie}` }
    });
    assert.equal(loggedOutCheck.statusCode, 401, 'Logged out session must return 401');
    console.log('Logout invalidation: PASS');

    // Log back in to test expiration and CSRF
    const reLogRes2 = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'student_bob',
        password: 'Password123!'
      }
    );
    studentCookie = extractCookie(reLogRes2);
    studentCsrf = reLogRes2.body.csrfToken;

    // 11. Session expiration
    console.log('11. Testing Session Expiration...');
    expireAllSessions();
    const expiredCheck = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${studentCookie}` }
    });
    assert.equal(expiredCheck.statusCode, 401, 'Expired session must return 401');
    console.log('Session expiration: PASS');

    // Re-login for CSRF and Route tests
    const reLogRes3 = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'student_bob',
        password: 'Password123!'
      }
    );
    studentCookie = extractCookie(reLogRes3);
    studentCsrf = reLogRes3.body.csrfToken;

    // 12. CSRF rejection on state-changing requests
    console.log('12. Testing CSRF Rejection on State-Changing Requests...');
    const csrfMissingRes = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/test/state-changing',
      method: 'POST',
      headers: {
        Cookie: `session_id=${studentCookie}`
        // Missing X-CSRF-Token header
      }
    });
    assert.equal(csrfMissingRes.statusCode, 403, 'Missing CSRF token must return 403');

    const csrfInvalidRes = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/test/state-changing',
      method: 'POST',
      headers: {
        Cookie: `session_id=${studentCookie}`,
        'X-CSRF-Token': 'invalid_forged_csrf_token_value_here'
      }
    });
    assert.equal(csrfInvalidRes.statusCode, 403, 'Invalid CSRF token must return 403');

    const csrfValidRes = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/test/state-changing',
      method: 'POST',
      headers: {
        Cookie: `session_id=${studentCookie}`,
        'X-CSRF-Token': studentCsrf
      }
    });
    assert.equal(csrfValidRes.statusCode, 200, 'Valid CSRF token must succeed');
    console.log('CSRF rejection & verification: PASS');

    // 13. Login rate limiting
    console.log('13. Testing Login Rate Limiting (5 failures cap)...');
    for (let i = 0; i < 5; i++) {
      await request(
        {
          hostname: '127.0.0.1',
          port: TEST_PORT,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          username: 'rate_limited_user',
          password: 'WrongPassword!'
        }
      );
    }
    const rateLimitedRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'rate_limited_user',
        password: 'WrongPassword!'
      }
    );
    assert.equal(rateLimitedRes.statusCode, 429, '6th attempt must be blocked with 429');
    console.log('Login rate limiting: PASS');

    // 14. Password hashes never returned
    console.log('14. Testing Password Hash Non-Exposure...');
    const jsonResponses = [regRes.body, loginStudentRes.body, loginAdminRes.body, meRes.body];
    for (const body of jsonResponses) {
      const serialized = JSON.stringify(body);
      assert.ok(!serialized.includes('password_hash'), 'Response must not contain password_hash');
      assert.ok(!serialized.includes('password_salt'), 'Response must not contain password_salt');
      assert.ok(!serialized.includes('hash_'), 'Response must not contain raw hash substring');
    }
    console.log('Password hash non-exposure: PASS');

    // 15. Student cannot access protected admin routes
    console.log('15. Testing Student Blocked from Admin-Only Routes...');
    const studentAccessAdmin = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/test/admin-only',
      method: 'GET',
      headers: { Cookie: `session_id=${studentCookie}` }
    });
    assert.equal(studentAccessAdmin.statusCode, 403, 'Student accessing admin route must be 403');

    // Re-authenticate admin (since test 11 expired previous sessions)
    const adminRelog = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
      }
    );
    adminCookie = extractCookie(adminRelog);

    // Admin accessing admin route must succeed
    const adminAccessAdmin = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/test/admin-only',
      method: 'GET',
      headers: { Cookie: `session_id=${adminCookie}` }
    });
    assert.equal(adminAccessAdmin.statusCode, 200, 'Admin accessing admin route must be 200');
    console.log('Role separation & admin protection: PASS');

    // 16. Public registration cannot create admin users
    console.log('16. Testing Public Registration Cannot Create Admin Users...');
    const adminAttemptRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'admin_imposter',
        password: 'Password123!',
        fullName: 'Imposter Admin',
        role: 'admin'
      }
    );
    assert.equal(adminAttemptRes.statusCode, 201);
    assert.equal(adminAttemptRes.body.user.role, 'student', 'Role must remain student');

    const adminCheck = getUserByUsername('admin_imposter');
    assert.equal(adminCheck.role, 'student', 'Database record must have role student');
    console.log('Public registration cannot create admin users: PASS');

    // 17. Multi-browser session concurrency (independent devices)
    console.log('17. Testing Multi-Browser Session Concurrency...');
    // Login session 1 (Browser A)
    const browserARes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { username: 'student_bob', password: 'Password123!' }
    );
    const cookieA = extractCookie(browserARes);

    // Login session 2 (Browser B - same user, separate device/window)
    const browserBRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { username: 'student_bob', password: 'Password123!' }
    );
    const cookieB = extractCookie(browserBRes);
    assert.notEqual(cookieA, cookieB, 'Second browser session token must be distinct');

    // Both sessions must be concurrently valid
    const meA = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${cookieA}` }
    });
    assert.equal(meA.statusCode, 200, 'Browser A session must remain valid');

    const meB = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${cookieB}` }
    });
    assert.equal(meB.statusCode, 200, 'Browser B session must remain valid');

    // Logout from Browser A only
    await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Cookie: `session_id=${cookieA}` }
    });

    // Browser A is now invalidated, while Browser B remains active
    const meAAfter = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${cookieA}` }
    });
    assert.equal(meAAfter.statusCode, 401, 'Browser A session must be invalidated');

    const meBAfter = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `session_id=${cookieB}` }
    });
    assert.equal(meBAfter.statusCode, 200, 'Browser B session must remain functional after Browser A logout');
    console.log('Multi-browser session concurrency: PASS');

    // 18. Cascading Deletion of User
    console.log('18. Testing Cascading Deletion of User Sessions...');
    const userToDelete = createStudentWithPortfolio(
      {
        username: 'to_be_deleted',
        fullName: 'Delete Me',
        passwordHash: 'hash_del',
        passwordSalt: 'salt_del'
      },
      db
    );
    const delLoginRes = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { username: 'to_be_deleted', password: 'Password123!' }
    );
    // Directly inject session to simulate active login
    const delTokenHash = 'del_user_session_hash';
    const expiresFuture = new Date(Date.now() + 3600 * 1000).toISOString();
    createSession({
      id: delTokenHash,
      userId: userToDelete.user.id,
      csrfTokenHash: 'csrf_del',
      expiresAt: expiresFuture
    });

    // Verify session exists
    assert.ok(getSession(delTokenHash));

    // Delete user
    deleteStudentAccount(userToDelete.user.id);

    // Cascading delete must wipe sessions
    assert.equal(
      getSession(delTokenHash),
      null,
      'Sessions must cascade-delete when user is deleted'
    );
    console.log('Cascading user session deletion: PASS');

    // 19. CSRF Token Rejection After Session Invalidation
    console.log('19. Testing CSRF Rejection After Session Invalidation...');
    const regCsrfUser = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'csrf_test_user',
        password: 'Password123!',
        fullName: 'CSRF Test'
      }
    );
    const csrfCookie = extractCookie(regCsrfUser);
    const csrfToken = regCsrfUser.body.csrfToken;

    // Logout to invalidate session
    await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Cookie: `session_id=${csrfCookie}` }
    });

    // Attempt state-changing request with old CSRF token and cookie -> must fail with 401
    const invalidCsrfRes = await request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/test/state-changing',
      method: 'POST',
      headers: {
        Cookie: `session_id=${csrfCookie}`,
        'X-CSRF-Token': csrfToken
      }
    });
    assert.equal(invalidCsrfRes.statusCode, 401, 'Request with invalidated session must be 401');
    console.log('CSRF rejection after session invalidation: PASS');

    // 20. Production Startup Fail-Closed Guarantees
    console.log('20. Testing Production Startup Fail-Closed Guarantees...');
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.SESSION_SECRET;

    try {
      process.env.NODE_ENV = 'production';
      process.env.SESSION_SECRET = 'short'; // Invalid: < 32 chars

      assert.throws(
        () => {
          getSessionSecret();
        },
        (err) => err.message.includes('Production startup halted') && err.message.includes('SESSION_SECRET'),
        'Must fail closed in production when SESSION_SECRET is too short or missing'
      );

      // Restore secret, test admin provisioning fail-closed in fresh DB with no admin
      process.env.SESSION_SECRET = 'valid_production_secret_with_more_than_32_characters_12345';
      await assert.rejects(
        async () => {
          await initAdmin('', '');
        },
        (err) => err.message.includes('Production startup halted') && err.message.includes('ADMIN_USERNAME'),
        'Must fail closed in production when admin cannot be provisioned'
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.SESSION_SECRET = originalSecret;
    }
    console.log('Production startup fail-closed guarantees: PASS');

    console.log('\nAll 20 Phase 08.2 Authentication tests passed successfully!');
  } finally {
    server.close();
    closeDatabase();
    try {
      if (fs.existsSync(TEST_AUTH_DB)) fs.unlinkSync(TEST_AUTH_DB);
      if (fs.existsSync(`${TEST_AUTH_DB}-wal`)) fs.unlinkSync(`${TEST_AUTH_DB}-wal`);
      if (fs.existsSync(`${TEST_AUTH_DB}-shm`)) fs.unlinkSync(`${TEST_AUTH_DB}-shm`);
    } catch {
      // Cleanup best effort
    }
  }
}

runAuthTests().catch((err) => {
  console.error('Auth tests failed with error:', err);
  process.exit(1);
});
