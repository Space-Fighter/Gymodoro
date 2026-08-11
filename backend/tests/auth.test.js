/**
 * Auth Controller Integration Tests
 * Tests all authentication endpoints against a running server
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000/api/auth';

// Test utilities
function makeRequest(method, path, body = null, headers = {}) {
  /*
  method — 'GET', 'POST', etc.
  path — the API endpoint like /register
  body — optional request data (default: null)
  headers — optional custom headers (default: empty object)
  */
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    console.error(
      `❌ FAIL: ${message}\n   Expected: ${expected}\n   Got: ${actual}`
    );
    process.exit(1);
  }
}

// Test suite
async function runTests() {
  console.log('🧪 Starting Auth Controller Tests\n');

  let testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
  let accessToken = null;
  let refreshToken = null;
  let verificationToken = null;

  try {
    // Test 1: Register User
    console.log('Test 1: Register User');
    let res = await makeRequest('POST', '/register', testUser);
    assertEquals(res.status, 201, 'Register should return 201');
    assert(res.body.user.id, 'User should have an ID');
    assertEquals(res.body.user.email, testUser.email, 'Email should match');
    assertEquals(res.body.user.emailVerified, false, 'Email should not be verified initially');
    console.log('✅ PASS\n');

    // Test 2: Register with duplicate email
    console.log('Test 2: Register with duplicate email');
    res = await makeRequest('POST', '/register', testUser);
    assertEquals(res.status, 400, 'Should reject duplicate email');
    assert(res.body.message.includes('already registered'), 'Error message should mention duplicate');
    console.log('✅ PASS\n');

    // Test 3: Register with missing fields
    console.log('Test 3: Register with missing fields');
    res = await makeRequest('POST', '/register', { email: 'test@example.com' });
    assertEquals(res.status, 400, 'Should require name, email, password');
    console.log('✅ PASS\n');

    // Test 4: Login without email verification
    console.log('Test 4: Login without email verification');
    res = await makeRequest('POST', '/login', {
      email: testUser.email,
      password: testUser.password,
    });
    assertEquals(res.status, 403, 'Should reject unverified email');
    assertEquals(res.body.emailVerified, false, 'Should indicate email not verified');
    console.log('✅ PASS\n');

    // Test 5: Resend verification email
    console.log('Test 5: Resend verification email');
    res = await makeRequest('POST', '/resend-verification', { email: testUser.email });
    assertEquals(res.status, 200, 'Should accept resend request');
    assert(res.body.message, 'Should have a message');
    console.log('✅ PASS\n');

    // Test 6: Verify email (using database token)
    console.log('Test 6: Verify email');
    // In real scenario, token comes from email. For CI, we'll get it from DB
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const dbUser = await prisma.user.findUnique({ where: { email: testUser.email } });

    if (dbUser && dbUser.verificationToken) {
      // Extract raw token from DB (hash is stored, but for testing we simulate)
      // In production, this comes from email - for CI we skip actual email verification
      // Instead, manually verify the user in DB
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        },
      });
      console.log('✅ PASS (manually verified in DB)\n');
    } else {
      console.error('❌ FAIL: Could not find user in database\n');
      process.exit(1);
    }

    await prisma.$disconnect();

    // Test 7: Login with verified email
    console.log('Test 7: Login with verified email');
    res = await makeRequest('POST', '/login', {
      email: testUser.email,
      password: testUser.password,
    });
    assertEquals(res.status, 200, 'Should allow login after verification');
    assert(res.body.accessToken, 'Should return access token');
    assertEquals(res.body.user.emailVerified, true, 'User should be verified');
    accessToken = res.body.accessToken;
    console.log('✅ PASS\n');

    // Test 8: Login with wrong password
    console.log('Test 8: Login with wrong password');
    res = await makeRequest('POST', '/login', {
      email: testUser.email,
      password: 'WrongPassword123!',
    });
    assertEquals(res.status, 401, 'Should reject wrong password');
    console.log('✅ PASS\n');

    // Test 9: Login with non-existent email
    console.log('Test 9: Login with non-existent email');
    res = await makeRequest('POST', '/login', {
      email: 'nonexistent@example.com',
      password: testUser.password,
    });
    assertEquals(res.status, 401, 'Should reject non-existent email');
    console.log('✅ PASS\n');

    // Test 10: Get current user
    console.log('Test 10: Get current user (Get Me)');
    res = await makeRequest('GET', '/get-me', null, {
      Authorization: `Bearer ${accessToken}`,
    });
    assertEquals(res.status, 200, 'Should return current user');
    assertEquals(res.body.user.email, testUser.email, 'User email should match');
    console.log('✅ PASS\n');

    // Test 11: Get Me without token
    console.log('Test 11: Get Me without token');
    res = await makeRequest('GET', '/get-me');
    assertEquals(res.status, 401, 'Should reject request without token');
    console.log('✅ PASS\n');

    // Test 12: Get Me with invalid token
    console.log('Test 12: Get Me with invalid token');
    res = await makeRequest('GET', '/get-me', null, {
      Authorization: 'Bearer invalid.token.here',
    });
    assertEquals(res.status, 401, 'Should reject invalid token');
    console.log('✅ PASS\n');

    // Test 13: Refresh token
    console.log('Test 13: Refresh token');
    res = await makeRequest('POST', '/refresh-token');
    assertEquals(res.status, 401, 'Should reject refresh without token cookie');
    console.log('✅ PASS\n');

    // Test 14: Logout
    console.log('Test 14: Logout');
    res = await makeRequest('POST', '/logout');
    assertEquals(res.status, 200, 'Should allow logout');
    console.log('✅ PASS\n');

    console.log('\n✨ All tests passed! ✨\n');
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
