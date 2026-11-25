import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getDatabase,
  closeDatabase,
  getUserById,
  getUserByUsername,
  getAdminUser,
  createStudentWithPortfolio,
  initAdmin,
  validateInterests,
  getPortfolioByUserId,
  updateStudentPortfolio,
  updatePortfolioInterests,
  updateUserPassword,
  createSession,
  getSession,
  deleteSession,
  deleteSessionsByUserId,
  getAdminOverview,
  updateUserStatus,
  deleteStudentAccount
} from '../server/db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DATA_FILE = path.resolve(__dirname, '../data/test_json_unit.json');

process.env.DATA_FILE_PATH = TEST_DATA_FILE;

async function runDbTests() {
  console.log('\n--- Testing Phase 08.3.1: JSON File Storage & Model Integrity ---');

  // Clean up any lingering test file
  if (fs.existsSync(TEST_DATA_FILE)) {
    fs.unlinkSync(TEST_DATA_FILE);
  }

  try {
    // 1. Storage initialization & auto-creation
    console.log('1. Testing Storage Initialization & Auto-Creation...');
    const store = getDatabase();
    assert.ok(fs.existsSync(TEST_DATA_FILE), 'Test JSON file must be created automatically on disk');
    assert.ok(Array.isArray(store.users), 'store.users must be an array');
    assert.ok(Array.isArray(store.portfolios), 'store.portfolios must be an array');
    console.log('Storage initialization & auto-creation: PASS');

    // 2. Administrator initialization
    console.log('2. Testing Administrator Account Initialization...');
    const adminUser = await initAdmin('admin_unit_test', 'AdminUnitPass123!');
    assert.ok(adminUser, 'Admin account created');
    assert.equal(adminUser.role, 'admin');
    assert.equal(adminUser.username, 'admin_unit_test');

    const retrievedAdmin = getAdminUser();
    assert.ok(retrievedAdmin);
    assert.equal(retrievedAdmin.username, 'admin_unit_test');
    console.log('Administrator account initialization: PASS');

    // 3. Case-insensitive unique username constraint
    console.log('3. Testing Case-Insensitive Unique Username Constraint...');
    const student1 = createStudentWithPortfolio({
      username: 'alice_smith',
      fullName: 'Alice Smith',
      passwordHash: 'hash1',
      passwordSalt: 'salt1',
      interests: ['Web Development']
    });
    assert.ok(student1.user.id);

    // Attempting duplicate with different casing should throw
    assert.throws(() => {
      createStudentWithPortfolio({
        username: 'ALICE_SMITH',
        fullName: 'Alice Clone',
        passwordHash: 'hash2',
        passwordSalt: 'salt2'
      });
    }, /already taken/i);
    console.log('Case-insensitive unique username constraint: PASS');

    // 4. Student portfolio creation & provisioning
    console.log('4. Testing Student & Portfolio Automatic Provisioning...');
    const portfolio = getPortfolioByUserId(student1.user.id);
    assert.ok(portfolio, 'Portfolio record created');
    assert.equal(portfolio.slug, 'alice_smith');
    assert.equal(portfolio.full_name, 'Alice Smith');
    assert.equal(portfolio.is_published, 0, 'New portfolio starts in draft mode');
    assert.deepEqual(portfolio.interests, ['Web Development']);
    console.log('Student & portfolio automatic provisioning: PASS');

    // 5. Atomic persistence across disk reload
    console.log('5. Testing Persistence Across Disk Reload...');
    closeDatabase();
    // Read raw JSON from disk
    const diskContent = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf8'));
    assert.ok(diskContent.users.find((u) => u.username === 'alice_smith'));
    assert.ok(diskContent.portfolios.find((p) => p.slug === 'alice_smith'));
    console.log('Persistence across disk reload: PASS');

    // 6. Skills, projects and bio updates
    console.log('6. Testing Skills and Projects Updates...');
    const updated = updateStudentPortfolio(student1.user.id, {
      headline: 'Full-Stack Developer',
      bioIntro: 'Building robust applications.',
      skills: ['React', 'Node.js', 'JavaScript'],
      projects: [
        {
          title: 'Project Alpha',
          category: 'Web Application',
          description: 'A responsive full-stack project.',
          technologies: ['React', 'Node.js']
        }
      ]
    });
    assert.equal(updated.headline, 'Full-Stack Developer');
    assert.equal(updated.skills.length, 3);
    assert.equal(updated.projects.length, 1);
    console.log('Skills and projects updates: PASS');

    // 7. Interests validation (max 8)
    console.log('7. Testing Interests Validation Limits...');
    assert.equal(validateInterests('not-array').valid, false);
    assert.equal(validateInterests(Array(9).fill('Topic')).valid, false, 'Max 8 interests limit enforced');
    const validCheck = validateInterests(['Web Development', 'AI / Machine Learning']);
    assert.equal(validCheck.valid, true);
    assert.equal(validCheck.clean.length, 2);
    console.log('Interests validation limits: PASS');

    // 8. In-memory session management
    console.log('8. Testing In-Memory Session Management...');
    createSession({
      id: 'session_token_hash_1',
      userId: student1.user.id,
      csrfTokenHash: 'csrf_hash_1',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
    });
    const session = getSession('session_token_hash_1');
    assert.ok(session, 'Session retrieved');
    assert.equal(session.username, 'alice_smith');

    deleteSession('session_token_hash_1');
    assert.equal(getSession('session_token_hash_1'), null, 'Deleted session returns null');
    console.log('In-memory session management: PASS');

    // 9. Admin overview statistics
    console.log('9. Testing Admin Overview Statistics...');
    const overview = getAdminOverview();
    assert.equal(overview.totalStudents, 1, 'Exactly 1 student recorded');
    assert.equal(overview.totalPortfolios, 1);
    assert.equal(overview.publishedPortfolios, 0);
    assert.equal(overview.draftPortfolios, 1);
    assert.equal(overview.students.length, 1);
    assert.equal(overview.students[0].username, 'alice_smith');
    console.log('Admin overview statistics: PASS');

    // 10. Admin moderation actions (suspend and delete)
    console.log('10. Testing Admin Moderation Actions (Suspend & Delete)...');
    updateUserStatus(student1.user.id, 'suspended');
    const suspendedUser = getUserById(student1.user.id);
    assert.equal(suspendedUser.status, 'suspended', 'Student suspended successfully');

    updateUserStatus(student1.user.id, 'active');
    const activeUser = getUserById(student1.user.id);
    assert.equal(activeUser.status, 'active', 'Student reactivated successfully');

    deleteStudentAccount(student1.user.id);
    assert.equal(getUserById(student1.user.id), null, 'Student deleted');
    assert.equal(getPortfolioByUserId(student1.user.id), null, 'Portfolio deleted with student');
    console.log('Admin moderation actions: PASS');

  } finally {
    closeDatabase();
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
  }

  console.log('\nAll 10 Phase 08.3.1 JSON File Storage unit tests passed successfully!\n');
}

runDbTests().catch((err) => {
  console.error('\nTest failure in tests/db.test.js:');
  console.error(err);
  process.exit(1);
});
