import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dispatchRoute } from '../server/router.js';
import {
  getDatabase,
  closeDatabase,
  createStudentWithPortfolio,
  getPortfolioByUserId,
  updateStudentPortfolio,
  publishPortfolio,
  unpublishPortfolio,
  getPublicPortfolioByUsername,
  validateSkills,
  validateProjects,
  isValidHttpUrl,
  getUserById,
  updateUserStatus
} from '../server/db/database.js';
import { hashPassword } from '../server/utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_PORTFOLIO_DB = path.resolve(__dirname, '../data/test_portfolio_suite.json');
const TEST_PORT = 5059;

process.env.DATA_FILE_PATH = TEST_PORTFOLIO_DB;
process.env.SESSION_SECRET = 'test_secret_for_portfolio_suite_64_characters_long_1234567890abcdef';

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

async function runPortfolioTests() {
  console.log('\n--- Testing Phase 08.3: Portfolio Builder, Security & Dynamic Rendering ---');

  if (fs.existsSync(TEST_PORTFOLIO_DB)) fs.unlinkSync(TEST_PORTFOLIO_DB);

  // Initialize DB
  const db = getDatabase(TEST_PORTFOLIO_DB);

  // 1. Database & Persistence Tests
  console.log('1. Testing JSON File Storage and Schema Structure...');
  assert.ok(fs.existsSync(TEST_PORTFOLIO_DB), 'JSON store file must exist on disk');
  const initialData = JSON.parse(fs.readFileSync(TEST_PORTFOLIO_DB, 'utf8'));
  assert.ok(Array.isArray(initialData.users), 'users array must exist in JSON storage');
  assert.ok(Array.isArray(initialData.portfolios), 'portfolios array must exist in JSON storage');
  console.log('JSON file storage structure: PASS');

  console.log('2. Testing Student Creation and Automatic Portfolio Provisioning...');
  const alicePass = await hashPassword('StudentAlicePass123!');
  const studentA = createStudentWithPortfolio(
    {
      username: 'student_alice',
      fullName: 'Alice Smith',
      passwordHash: alicePass.hash,
      passwordSalt: alicePass.salt,
      interests: ['Cloud Computing', 'Web Development']
    },
    db
  );
  assert.ok(studentA.user.id, 'Student A user ID returned');
  const portfolioA = getPortfolioByUserId(studentA.user.id, db);
  assert.ok(portfolioA, 'Student A portfolio must exist');
  assert.equal(portfolioA.slug, 'student_alice', 'Portfolio slug matches username');
  assert.equal(portfolioA.full_name, 'Alice Smith', 'Portfolio full_name matches registration name');
  assert.equal(portfolioA.show_email_publicly, false, 'show_email_publicly defaults to false');
  const rawDataAfterCreate = JSON.parse(fs.readFileSync(TEST_PORTFOLIO_DB, 'utf8'));
  const rawP = rawDataAfterCreate.portfolios.find((p) => p.user_id === studentA.user.id);
  assert.equal(rawP.show_email_publicly, 0, 'raw show_email_publicly in JSON defaults to 0');
  assert.equal(portfolioA.is_published, 0, 'New portfolio defaults to draft (is_published = 0)');
  assert.deepEqual(portfolioA.interests, ['Cloud Computing', 'Web Development'], 'Interests array parsed');
  console.log('Student creation and default portfolio provisioning: PASS');

  console.log('3. Testing Skills and Projects Validation and Round-Trip Persistence...');
  const validSkills = ['React', 'Node.js', 'PostgreSQL', 'TypeScript'];
  const validProjects = [
    {
      title: 'DevPortal',
      category: 'Web Application',
      description: 'A comprehensive developer portal built with modern web technologies.',
      technologies: ['React', 'Node.js'],
      githubUrl: 'https://github.com/alice/devportal',
      liveUrl: 'https://devportal.example.org'
    }
  ];

  const updateResult = updateStudentPortfolio(
    studentA.user.id,
    {
      fullName: 'Alice M. Smith',
      headline: 'Full-Stack Software Engineer',
      bioIntro: 'Passionate about distributed cloud systems and frontend performance.',
      degree: 'B.Tech in Computer Science',
      institution: 'Tech University',
      academicPeriod: '2023 - 2027',
      location: 'Bangalore, India',
      interests: ['Cloud Computing', 'Web Development', 'Artificial Intelligence'],
      skills: validSkills,
      projects: validProjects,
      contactEmail: 'alice.public@example.edu',
      showEmailPublicly: true,
      githubUrl: 'https://github.com/student-alice',
      linkedinUrl: 'https://linkedin.com/in/student-alice'
    },
    db
  );

  assert.equal(updateResult.full_name, 'Alice M. Smith', 'Updated full_name in portfolios');
  // Verify users store was also updated synchronously
  const userARow = getUserById(studentA.user.id);
  assert.equal(userARow.full_name, 'Alice M. Smith', 'Updated full_name synchronized to users record');

  assert.equal(updateResult.show_email_publicly, true, 'show_email_publicly set to true');
  const rawUpdatedRow = JSON.parse(fs.readFileSync(TEST_PORTFOLIO_DB, 'utf8')).portfolios.find(p => p.user_id === studentA.user.id);
  assert.equal(rawUpdatedRow.show_email_publicly, 1, 'raw show_email_publicly in JSON set to 1');
  assert.deepEqual(updateResult.skills, validSkills, 'Skills stored and retrieved properly');
  assert.equal(updateResult.projects.length, 1, 'Projects stored properly');
  assert.equal(updateResult.projects[0].title, 'DevPortal', 'Project title matches');
  console.log('Skills and projects validation & round-trip persistence: PASS');

  console.log('4. Testing Persistence Across Database Close and Reopen...');
  closeDatabase();
  const reopenedDb = getDatabase(TEST_PORTFOLIO_DB);
  const reopenedPortfolio = getPortfolioByUserId(studentA.user.id, reopenedDb);
  assert.equal(reopenedPortfolio.full_name, 'Alice M. Smith', 'full_name persisted across close/reopen');
  assert.equal(reopenedPortfolio.headline, 'Full-Stack Software Engineer', 'headline persisted');
  assert.equal(reopenedPortfolio.show_email_publicly, true, 'show_email_publicly persisted as true');
  assert.deepEqual(reopenedPortfolio.skills, validSkills, 'skills persisted across close/reopen');
  assert.equal(reopenedPortfolio.projects.length, 1, 'projects persisted across close/reopen');
  console.log('Persistence across database close and reopen: PASS');

  console.log('5. Testing Server Enforced Validation Limits (Skills, Projects, Interests, URLs)...');
  // Skills > 30 rejected
  const skillValidation = validateSkills(Array.from({ length: 31 }, (_, i) => `Skill ${i + 1}`));
  assert.equal(skillValidation.valid, false, 'Validation should fail for > 30 skills');
  assert.ok(skillValidation.message.includes('30 skills'), 'Error message mentions 30 skills limit');

  // Projects > 15 rejected
  const projValidation = validateProjects(Array.from({ length: 16 }, (_, i) => ({
    title: `Project ${i + 1}`,
    description: 'Test project description exceeding limit.',
    category: 'Web Application'
  })));
  assert.equal(projValidation.valid, false, 'Validation should fail for > 15 projects');
  assert.ok(projValidation.message.includes('15'), 'Error message mentions 15 projects limit');

  // Project without title rejected
  const projNoTitle = validateProjects([{ category: 'Web Application' }]);
  assert.equal(projNoTitle.valid, false, 'Project without title fails');
  assert.ok(projNoTitle.message.includes('Name is required') || projNoTitle.message.includes('required'), 'Error mentions name/title is required');

  // Invalid URL rejected
  assert.equal(isValidHttpUrl('not-a-url'), false, 'Malformed URL returns false');
  assert.equal(isValidHttpUrl('javascript:alert(1)'), false, 'Non-http protocol returns false');
  assert.equal(isValidHttpUrl('https://valid.com/repo'), true, 'Valid HTTPS URL returns true');
  console.log('Server-enforced validation limits: PASS');

  // Start HTTP Server for API Tests
  const server = http.createServer(async (req, res) => {
    try {
      await dispatchRoute(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: { message: err.message } }));
    }
  });

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));

  try {
    // 2. HTTP API Security & Operations Tests
    console.log('6. Testing Unauthenticated Access Rejection (401)...');
    const unauthGet = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'GET'
    });
    assert.equal(unauthGet.statusCode, 401, 'Unauthenticated GET portfolio must return 401');

    const unauthPut = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { headline: 'New Headline' });
    assert.equal(unauthPut.statusCode, 401, 'Unauthenticated PUT portfolio must return 401');

    const unauthPublish = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio/publish',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.equal(unauthPublish.statusCode, 401, 'Unauthenticated publish must return 401');

    const unauthUnpublish = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio/unpublish',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.equal(unauthUnpublish.statusCode, 401, 'Unauthenticated unpublish must return 401');
    console.log('Unauthenticated access rejection: PASS');

    console.log('7. Testing Student Login and CSRF Acquisition...');
    const loginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'student_alice',
      password: 'StudentAlicePass123!'
    });
    assert.equal(loginRes.statusCode, 200, 'Student login succeeded');
    let sessionId = extractCookie(loginRes);
    let csrfToken = loginRes.body.csrfToken;
    assert.ok(sessionId, 'Session cookie obtained');
    assert.ok(csrfToken, 'CSRF token obtained');
    console.log('Student login and CSRF acquisition: PASS');

    console.log('8. Testing CSRF Protection on State-Changing Portfolio Endpoints...');
    // PUT without CSRF token
    const putNoCsrf = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`
      }
    }, { headline: 'Hacker Headline' });
    assert.equal(putNoCsrf.statusCode, 403, 'PUT without CSRF must return 403');

    // Publish without CSRF token
    const publishNoCsrf = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`
      }
    });
    assert.equal(publishNoCsrf.statusCode, 403, 'Publish without CSRF must return 403');
    console.log('CSRF protection on state-changing endpoints: PASS');

    console.log('9. Testing Authenticated Student GET /api/student/portfolio...');
    const getOwn = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'GET',
      headers: {
        Cookie: `session_id=${sessionId}`
      }
    });
    assert.equal(getOwn.statusCode, 200, 'GET own portfolio returns 200');
    assert.equal(getOwn.body.portfolio.username, 'student_alice');
    assert.equal(getOwn.body.portfolio.fullName, 'Alice M. Smith');
    assert.equal(getOwn.body.portfolio.isPublished, false, 'Initial status is draft');
    console.log('Authenticated GET own portfolio: PASS');

    console.log('10. Testing Student Isolation (Student A Cannot Access/Modify Student B)...');
    const bobPass = await hashPassword('StudentBobPass123!');
    const studentB = createStudentWithPortfolio(
      {
        username: 'student_bob',
        fullName: 'Bob Jones',
        passwordHash: bobPass.hash,
        passwordSalt: bobPass.salt,
        interests: ['Cybersecurity']
      },
      reopenedDb
    );

    // Alice tries to update with injected user_id or username to modify Bob's account
    const maliciousPut = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`,
        'X-CSRF-Token': csrfToken
      }
    }, {
      userId: studentB.user.id,
      username: 'student_bob',
      slug: 'student_bob',
      headline: 'Alice attempts overwrite'
    });
    assert.equal(maliciousPut.statusCode, 200, 'Update handled safely');

    // Verify Bob's portfolio is completely unchanged
    const bPortfolio = getPortfolioByUserId(studentB.user.id, reopenedDb);
    assert.equal(bPortfolio.full_name, 'Bob Jones', 'Bob portfolio unaffected by Alice update');
    assert.equal(bPortfolio.headline, '', 'Bob headline not modified');

    // Verify Alice's own headline was updated (whitelist filtered out userId/username/slug)
    const aPortfolio = getPortfolioByUserId(studentA.user.id, reopenedDb);
    assert.equal(aPortfolio.headline, 'Alice attempts overwrite', 'Alice own headline updated');
    console.log('Student isolation and whitelist validation: PASS');

    console.log('11. Testing Publishing Minimum Requirements Enforcement...');
    // Bob has no headline and empty full_name test
    const loginBobRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'student_bob',
      password: 'StudentBobPass123!'
    });
    const bobSessionId = extractCookie(loginBobRes);
    const bobCsrf = loginBobRes.body.csrfToken;

    // Bob attempts to publish without headline
    const bobPublishFail = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${bobSessionId}`,
        'X-CSRF-Token': bobCsrf
      }
    });
    assert.equal(bobPublishFail.statusCode, 400, 'Publishing without headline must return 400');
    assert.ok(bobPublishFail.body.error.message.includes('headline'), 'Helpful error message returned');
    console.log('Publishing minimum requirements enforcement: PASS');

    console.log('12. Testing Public Access to Draft Portfolio (Must Return 404)...');
    const draftPublicRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/p/student_bob',
      method: 'GET'
    });
    assert.equal(draftPublicRes.statusCode, 404, 'Draft portfolio must not be publicly visible (404)');
    console.log('Draft portfolio returns 404 for public: PASS');

    console.log('13. Testing Successful Publishing of Complete Portfolio...');
    // Alice's portfolio is complete with full_name, headline, bio, skills, projects
    const alicePublishRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`,
        'X-CSRF-Token': csrfToken
      }
    });
    assert.equal(alicePublishRes.statusCode, 200, 'Publishing complete portfolio returns 200');
    assert.equal(alicePublishRes.body.isPublished, true, 'isPublished returned true');
    console.log('Complete portfolio successfully published: PASS');

    console.log('14. Testing Public Access to Published Portfolio (GET /api/p/:username)...');
    const alicePublicRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/p/student_alice',
      method: 'GET'
    });
    assert.equal(alicePublicRes.statusCode, 200, 'Published portfolio returns 200 for public request');
    const pub = alicePublicRes.body.portfolio;
    assert.equal(pub.username, 'student_alice');
    assert.equal(pub.fullName, 'Alice M. Smith');
    assert.equal(pub.headline, 'Alice attempts overwrite');
    assert.equal(pub.contactEmail, 'alice.public@example.edu', 'Email included when show_email_publicly is true');
    assert.deepEqual(pub.skills, validSkills);
    assert.equal(pub.projects.length, 1);

    // Verify zero data leaks: no password, salt, user_id, or internal metadata
    assert.equal(pub.password_hash, undefined, 'password_hash must never leak');
    assert.equal(pub.salt, undefined, 'salt must never leak');
    assert.equal(pub.user_id, undefined, 'user_id must never leak');
    assert.equal(pub.userId, undefined, 'userId must never leak');
    assert.equal(pub.role, undefined, 'role must not leak');
    console.log('Public published portfolio rendering and zero data leakage: PASS');

    console.log('15. Testing Email Privacy Filter (show_email_publicly = false)...');
    // Alice updates showEmailPublicly to false
    await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`,
        'X-CSRF-Token': csrfToken
      }
    }, {
      showEmailPublicly: false
    });

    const alicePublicHiddenEmail = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/p/student_alice',
      method: 'GET'
    });
    assert.equal(alicePublicHiddenEmail.statusCode, 200);
    assert.equal(
      alicePublicHiddenEmail.body.portfolio.contactEmail,
      null,
      'Email must be null when show_email_publicly is false'
    );
    console.log('Email privacy filter: PASS');

    console.log('16. Testing Unpublishing (Returning to Draft)...');
    const unpublishRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio/unpublish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`,
        'X-CSRF-Token': csrfToken
      }
    });
    assert.equal(unpublishRes.statusCode, 200, 'Unpublishing returns 200');
    assert.equal(unpublishRes.body.isPublished, false);

    // Verify public route now returns 404 again
    const alicePublicAfterUnpublish = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/p/student_alice',
      method: 'GET'
    });
    assert.equal(alicePublicAfterUnpublish.statusCode, 404, 'Unpublished portfolio returns 404 to public');
    console.log('Unpublishing portfolio and immediate public 404: PASS');

    console.log('17. Testing Suspended Student Portfolio Inaccessibility...');
    // Re-publish Alice's portfolio
    await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`,
        'X-CSRF-Token': csrfToken
      }
    });

    // Suspend Alice's account in database
    updateUserStatus(studentA.user.id, 'suspended');

    // Public route must now return 404 even though is_published was 1
    const aliceSuspendedPublic = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/p/student_alice',
      method: 'GET'
    });
    assert.equal(aliceSuspendedPublic.statusCode, 404, 'Suspended user portfolio returns 404');
    console.log('Suspended student portfolio inaccessibility: PASS');

    console.log('18. Testing Nonexistent Username Public Lookup (404)...');
    const nonexistentRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/p/nonexistent_student_user_xyz',
      method: 'GET'
    });
    assert.equal(nonexistentRes.statusCode, 404, 'Nonexistent user returns 404');
    console.log('Nonexistent user public lookup: PASS');

    console.log('19. Testing URL Length and Format Validation in PUT /api/student/portfolio...');
    // Reactivate Alice and re-authenticate to obtain fresh session
    updateUserStatus(studentA.user.id, 'active');
    const aliceRelogin = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'student_alice',
      password: 'StudentAlicePass123!'
    });
    sessionId = extractCookie(aliceRelogin);
    csrfToken = aliceRelogin.body.csrfToken;

    const invalidUrlPut = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`,
        'X-CSRF-Token': csrfToken
      }
    }, {
      githubUrl: 'javascript:evil()',
      linkedinUrl: 'bad-url'
    });
    assert.equal(invalidUrlPut.statusCode, 400, 'Invalid URL format must return 400');
    console.log('URL validation in student portfolio updates: PASS');

    console.log('20. Testing Maximum Array Length Enforcement in PUT /api/student/portfolio...');
    const tooManyInterestsPut = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/student/portfolio',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${sessionId}`,
        'X-CSRF-Token': csrfToken
      }
    }, {
      interests: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] // 9 exceeds max 8
    });
    assert.equal(tooManyInterestsPut.statusCode, 400, 'Excessive interests array returns 400');
    console.log('Array length validation in student portfolio updates: PASS');

  } finally {
    await new Promise((resolve) => server.close(resolve));
    closeDatabase();
    if (fs.existsSync(TEST_PORTFOLIO_DB)) fs.unlinkSync(TEST_PORTFOLIO_DB);
  }

  console.log('\nAll 20 Phase 08.3 Portfolio Builder & Security tests passed successfully!');
}

runPortfolioTests().catch((err) => {
  console.error('\nTest failure in tests/portfolio.test.js:');
  console.error(err);
  process.exit(1);
});
