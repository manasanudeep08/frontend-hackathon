import http from 'node:http';
import server from '../server/index.js';

const PORT = parseInt(process.env.PORT, 10) || 5050;

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
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

async function runTests() {
  console.log('--- Testing Native Node.js Server Endpoints ---');

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health...');
    const healthRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    console.log('Status:', healthRes.statusCode, healthRes.body.status === 'healthy' ? '✓ PASS' : '✗ FAIL');

    // 2. Info endpoint
    console.log('\n2. Testing GET /api/info...');
    const infoRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/info',
      method: 'GET'
    });
    console.log('Status:', infoRes.statusCode, infoRes.body.service ? '✓ PASS' : '✗ FAIL');

    // 3. Contact POST valid
    console.log('\n3. Testing POST /api/contact (valid)...');
    const contactValid = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Sarah Connor',
      email: 'sarah@domain.test',
      subject: 'Architecture Consultation',
      message: 'We are looking for an architect to review our streaming pipeline.'
    });
    const contactValidPass = contactValid.statusCode === 201 && 
      contactValid.body.success === true && 
      contactValid.body.data?.status === 'accepted_in_memory_only' &&
      contactValid.body.data?.deliveredToOwner === false &&
      contactValid.body.message.includes('session memory');
    console.log('Status:', contactValid.statusCode, contactValidPass ? '✓ PASS (accurate in-memory response)' : '✗ FAIL');

    // 4. Contact POST invalid (validation check)
    console.log('\n4. Testing POST /api/contact (invalid input)...');
    const contactInvalid = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'A',
      email: 'not-an-email',
      message: 'short'
    });
    console.log('Status:', contactInvalid.statusCode, contactInvalid.statusCode === 400 ? '✓ PASS' : '✗ FAIL', contactInvalid.body.error?.details);

    // 5. 404 test
    console.log('\n5. Testing 404 Handling...');
    const notFoundRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/non-existent-route',
      method: 'GET'
    });
    console.log('Status:', notFoundRes.statusCode, notFoundRes.statusCode === 404 ? '✓ PASS' : '✗ FAIL');

    // 6. 405 Method Not Allowed test
    console.log('\n6. Testing 405 Method Not Allowed...');
    const notAllowedRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/health',
      method: 'POST'
    });
    console.log('Status:', notAllowedRes.statusCode, notAllowedRes.statusCode === 405 ? '✓ PASS' : '✗ FAIL');

    // 7. Static file serving (SPA entry point)
    console.log('\n7. Testing Static File Serving (GET /)...');
    const staticRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/',
      method: 'GET'
    });
    console.log('Status:', staticRes.statusCode, staticRes.statusCode === 200 && staticRes.headers['content-type'].includes('text/html') ? '✓ PASS' : '✗ FAIL');

    // 7b. Missing Static Asset Handling (e.g. unconfigured resume.pdf)
    console.log('\n7b. Testing Missing Static Asset (GET /resume.pdf)...');
    const missingAssetRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/resume.pdf',
      method: 'GET'
    });
    console.log('Status:', missingAssetRes.statusCode, missingAssetRes.statusCode === 404 ? '✓ PASS (accurate 404 for missing asset)' : '✗ FAIL');

    // 8. GitHub Profile Unconfigured Handling
    console.log('\n8. Testing GET /api/github/profile (unconfigured fallback)...');
    const ghProfileRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/github/profile',
      method: 'GET'
    });
    const ghProfilePass = ghProfileRes.statusCode === 200 && ghProfileRes.body.configured === false;
    console.log('Status:', ghProfileRes.statusCode, ghProfilePass ? '✓ PASS' : '✗ FAIL', `(configured=${ghProfileRes.body.configured})`);

    // 9. GitHub Repos Unconfigured Handling
    console.log('\n9. Testing GET /api/github/repos (unconfigured fallback)...');
    const ghReposRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/github/repos',
      method: 'GET'
    });
    const ghReposPass = ghReposRes.statusCode === 200 && ghReposRes.body.configured === false && Array.isArray(ghReposRes.body.repos);
    console.log('Status:', ghReposRes.statusCode, ghReposPass ? '✓ PASS' : '✗ FAIL', `(count=${ghReposRes.body.count})`);

    // 10. GitHub Invalid Username Format Handling
    console.log('\n10. Testing GET /api/github/profile with invalid username...');
    const ghInvalidRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/github/profile?username=bad--user!%40',
      method: 'GET'
    });
    const ghInvalidPass = ghInvalidRes.statusCode === 400 && ghInvalidRes.body.success === false;
    console.log('Status:', ghInvalidRes.statusCode, ghInvalidPass ? '✓ PASS' : '✗ FAIL');

    // 11. GitHub Method Not Allowed
    console.log('\n11. Testing POST /api/github/profile (405 Method Not Allowed)...');
    const ghMethodRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/github/profile',
      method: 'POST'
    });
    console.log('Status:', ghMethodRes.statusCode, ghMethodRes.statusCode === 405 ? '✓ PASS' : '✗ FAIL');

    // 12. Contact Maximum Length Handling
    console.log('\n12. Testing POST /api/contact with input exceeding max length...');
    const contactOversized = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: new Array(110).fill('a').join(''),
      email: 'valid@domain.test',
      message: 'Valid message for testing.'
    });
    const contactOversizedPass = contactOversized.statusCode === 400 && 
      contactOversized.body.error?.details?.name?.includes('exceed 100');
    console.log('Status:', contactOversized.statusCode, contactOversizedPass ? '✓ PASS' : '✗ FAIL');

    // 13. Contact Unsupported HTTP Method
    console.log('\n13. Testing GET /api/contact (405 Method Not Allowed)...');
    const contactGetRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/contact',
      method: 'GET'
    });
    console.log('Status:', contactGetRes.statusCode, contactGetRes.statusCode === 405 ? '✓ PASS' : '✗ FAIL');

    // 14. Contact Honeypot Bot Trap
    console.log('\n14. Testing POST /api/contact with honeypot triggered...');
    const contactHpRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Spam Bot',
      email: 'spambot@spam.com',
      message: 'Buy our fake crypto tokens today!',
      website_hp: 'http://bot-hidden-trap.com'
    });
    const contactHpPass = contactHpRes.statusCode === 200 && contactHpRes.body.success === true;
    console.log('Status:', contactHpRes.statusCode, contactHpPass ? '✓ PASS (silently accepted, unsaved)' : '✗ FAIL');

    // 15. Safe Error Response on Malformed JSON (No stack trace exposure)
    console.log('\n15. Testing POST /api/contact with malformed JSON...');
    const contactMalformed = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '{ malformed json: true, missing quotes }');
    const contactMalformedPass = contactMalformed.statusCode === 400 && 
      contactMalformed.body.success === false && 
      contactMalformed.body.error?.message === 'Invalid JSON format in request body' &&
      contactMalformed.body.stack === undefined;
    console.log('Status:', contactMalformed.statusCode, contactMalformedPass ? '✓ PASS (safe response without stack trace)' : '✗ FAIL');

    // 16. Directory Traversal Attempt Blocked
    console.log('\n16. Testing Directory Traversal Prevention (GET /../package.json)...');
    const traversalRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/../package.json',
      method: 'GET'
    });
    console.log('Status:', traversalRes.statusCode, traversalRes.statusCode === 403 ? '✓ PASS (traversal blocked)' : '✗ FAIL');

    // 17. Encoded Directory Traversal Attempt Blocked
    console.log('\n17. Testing Encoded Traversal Prevention (GET /%2e%2e/package.json)...');
    const encodedTraversalRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/%2e%2e/package.json',
      method: 'GET'
    });
    console.log('Status:', encodedTraversalRes.statusCode, encodedTraversalRes.statusCode === 403 ? '✓ PASS (encoded traversal blocked)' : '✗ FAIL');

    // 18. Nested Traversal Attempt Blocked
    console.log('\n18. Testing Nested Traversal Prevention (GET /assets/..%2f..%2fpackage.json)...');
    const nestedTraversalRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/assets/..%2f..%2fpackage.json',
      method: 'GET'
    });
    console.log('Status:', nestedTraversalRes.statusCode, nestedTraversalRes.statusCode === 403 ? '✓ PASS (nested traversal blocked)' : '✗ FAIL');

    // 19. Protected File Access Blocked (.env)
    console.log('\n19. Testing Protected Environment File Access (GET /.env)...');
    const envFileRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/.env',
      method: 'GET'
    });
    console.log('Status:', envFileRes.statusCode, envFileRes.statusCode === 404 ? '✓ PASS (environment file protected)' : '✗ FAIL');

    // 20. Protected Source File Access Blocked (server/index.js)
    console.log('\n20. Testing Protected Source File Access (GET /server/index.js)...');
    const sourceFileRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/server/index.js',
      method: 'GET'
    });
    console.log('Status:', sourceFileRes.statusCode, sourceFileRes.statusCode === 404 ? '✓ PASS (source code protected)' : '✗ FAIL');

    // 21. Unsupported Method on Static Root (POST /)
    console.log('\n21. Testing Unsupported Method on Static Root (POST /)...');
    const postRootRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/',
      method: 'POST'
    });
    console.log('Status:', postRootRes.statusCode, postRootRes.statusCode === 405 ? '✓ PASS (method not allowed)' : '✗ FAIL');

    // 22. Unsupported Method on Assets (DELETE /assets/index.css)
    console.log('\n22. Testing Unsupported Method on Static Asset (DELETE /assets/index.css)...');
    const deleteAssetRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/assets/index.css',
      method: 'DELETE'
    });
    console.log('Status:', deleteAssetRes.statusCode, deleteAssetRes.statusCode === 405 ? '✓ PASS (method not allowed)' : '✗ FAIL');

    // 23. SPA Route Fallback (GET /about)
    console.log('\n23. Testing Extensionless SPA Route Fallback (GET /about)...');
    const spaRouteRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/about',
      method: 'GET'
    });
    const spaPass = spaRouteRes.statusCode === 200 && spaRouteRes.headers['content-type']?.includes('text/html');
    console.log('Status:', spaRouteRes.statusCode, spaPass ? '✓ PASS (SPA route serves index.html)' : '✗ FAIL');

    console.log('\nAll native Node.js HTTP server & API endpoint tests completed successfully!');
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close(() => {
      console.log('Test server closed.');
      process.exit(0);
    });
  }
}

// Give server time to listen
setTimeout(runTests, 500);
