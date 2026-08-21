/**
 * Track B - Session / Pomodoro Tracking & Analytics Integration Tests
 */

import http from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { server } from '../src/server.js';


const PORT = 3000;
const BASE_ORIGIN = `http://localhost:${PORT}`;

const JWT_SECRET = process.env.JWT_SECRET || 'ESY4QjIraPERY1AwgN955zEIgCIMBX4chL3IPcJNdOo90CxVlmOl8rWG0fBjRtXj';

function signTestToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
    const url = new URL(fullPath, BASE_ORIGIN);

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
    console.error(`❌ FAIL: ${message}\n   Expected: ${expected}\n   Got: ${actual}`);
    process.exit(1);
  }
}

async function runSessionTests() {
  console.log('🧪 Starting Track B - Session & Analytics API Tests\n');

  try {
    // 1. Create 2 test users for ownership verification
    const timestamp = Date.now();
    const userA = await prisma.user.create({
      data: {
        name: 'User A',
        email: `usera_${timestamp}@test.com`,
        emailVerified: true,
      },
    });
    const tokenA = signTestToken(userA.id);

    const userB = await prisma.user.create({
      data: {
        name: 'User B',
        email: `userb_${timestamp}@test.com`,
        emailVerified: true,
      },
    });
    const tokenB = signTestToken(userB.id);

    console.log('✅ Created test users A & B');

    // Test 1: Unauthenticated request should fail (401)
    console.log('\nTest 1: Unauthenticated requests require Bearer token');
    let res = await makeRequest('POST', '/sessions', { workDuration: 25, breakDuration: 5 });
    assertEquals(res.status, 401, 'POST /sessions without auth should return 401');
    res = await makeRequest('GET', '/sessions');
    assertEquals(res.status, 401, 'GET /sessions without auth should return 401');
    res = await makeRequest('GET', '/sessions/stats');
    assertEquals(res.status, 401, 'GET /sessions/stats without auth should return 401');
    console.log('✅ PASS: All unauthenticated requests rejected with 401\n');

    // Test 2: Start a Pomodoro session with defaults
    console.log('Test 2: Start Pomodoro with defaults');
    res = await makeRequest('POST', '/sessions', {}, { Authorization: `Bearer ${tokenA}` });
    assertEquals(res.status, 201, 'POST /sessions should return 201');
    assert(res.body.session, 'Should return created session');
    const defaultSession = res.body.session;
    assertEquals(defaultSession.userId, userA.id, 'Session must belong to user A');
    assertEquals(defaultSession.status, 'in_progress', 'Initial status must be in_progress');
    assertEquals(defaultSession.exerciseId, null, 'exerciseId must be null initially');
    assertEquals(defaultSession.workDuration, 1500, 'Default workDuration should be 1500s (25m)');
    assertEquals(defaultSession.breakDuration, 300, 'Default breakDuration should be 300s (5m)');
    assert(defaultSession.startedAt, 'startedAt must be recorded');
    console.log('✅ PASS: Default session created correctly\n');

    // Test 3: Start a Pomodoro session with custom overrides (in minutes)
    console.log('Test 3: Start Pomodoro with custom duration overrides');
    res = await makeRequest(
      'POST',
      '/sessions',
      { workDuration: 25, breakDuration: 5 },
      { Authorization: `Bearer ${tokenA}` }
    );
    assertEquals(res.status, 201, 'POST /sessions should return 201');
    const customSession = res.body.session;
    assertEquals(customSession.workDuration, 1500, '25 minutes normalized to 1500 seconds');
    assertEquals(customSession.breakDuration, 300, '5 minutes normalized to 300 seconds');
    assertEquals(customSession.exerciseId, null, 'exerciseId must still be null');
    console.log('✅ PASS: Custom session created correctly\n');

    // Test 4: Start Break + Assign Exercise
    console.log('Test 4: Start Break + Assign Exercise (PATCH /api/sessions/:id/start-break)');
    res = await makeRequest(
      'PATCH',
      `/sessions/${customSession.id}/start-break`,
      {},
      { Authorization: `Bearer ${tokenA}` }
    );
    assertEquals(res.status, 200, 'start-break should return 200');
    assert(res.body.session, 'Should return updated session');
    assert(res.body.session.exerciseId, 'Session must now have an assigned exerciseId');
    assertEquals(res.body.session.status, 'break', 'Status should transition to break');
    assert(res.body.session.breakStartedAt, 'breakStartedAt timestamp must be set');
    assert(res.body.exercise, 'Should return exercise details');
    assert(res.body.exercise.name, 'Exercise must have a name');
    assert(res.body.exercise.caloriesBurned > 0, 'Exercise must have estimated calories');
    assert(res.body.exercise.duration > 0, 'Exercise must have duration');
    console.log(`✅ PASS: Break started, assigned exercise "${res.body.exercise.name}" (${res.body.exercise.caloriesBurned} kcal)\n`);

    // Test 5: User Ownership check - User B cannot start break on User A's session
    console.log("Test 5: Ownership enforcement - User B cannot modify User A's session");
    res = await makeRequest(
      'PATCH',
      `/sessions/${customSession.id}/start-break`,
      {},
      { Authorization: `Bearer ${tokenB}` }
    );
    assertEquals(res.status, 403, 'Should reject with 403 Forbidden');
    console.log('✅ PASS: Unauthorized cross-user modification rejected with 403\n');

    // Test 6: Complete session (PATCH /api/sessions/:id)
    console.log('Test 6: Complete session (PATCH /api/sessions/:id)');
    res = await makeRequest(
      'PATCH',
      `/sessions/${customSession.id}`,
      { status: 'completed' },
      { Authorization: `Bearer ${tokenA}` }
    );
    assertEquals(res.status, 200, 'PATCH /sessions/:id should return 200');
    assertEquals(res.body.session.status, 'completed', 'Status should be completed');
    assert(res.body.session.completedAt, 'completedAt timestamp must be set');
    assert(res.body.session.estimatedCaloriesBurned > 0, 'Estimated calories burned should be reported for completed session');
    console.log('✅ PASS: Session successfully completed\n');

    // Test 7: Create additional sessions (skipped, abandoned, completed) to test stats
    console.log('Test 7: Seed multiple sessions for stats calculation');
    // Create & complete 2 more sessions
    for (let i = 0; i < 2; i++) {
      const s = await makeRequest('POST', '/sessions', {}, { Authorization: `Bearer ${tokenA}` });
      await makeRequest('PATCH', `/sessions/${s.body.session.id}/start-break`, {}, { Authorization: `Bearer ${tokenA}` });
      await makeRequest('PATCH', `/sessions/${s.body.session.id}`, { status: 'completed' }, { Authorization: `Bearer ${tokenA}` });
    }
    // Create & skip 1 session
    const sSkip = await makeRequest('POST', '/sessions', {}, { Authorization: `Bearer ${tokenA}` });
    await makeRequest('PATCH', `/sessions/${sSkip.body.session.id}`, { status: 'skipped' }, { Authorization: `Bearer ${tokenA}` });

    // Create & abandon 1 session
    const sAb = await makeRequest('POST', '/sessions', {}, { Authorization: `Bearer ${tokenA}` });
    await makeRequest('PATCH', `/sessions/${sAb.body.session.id}`, { status: 'abandoned' }, { Authorization: `Bearer ${tokenA}` });

    console.log('✅ Seeded: 3 completed, 1 skipped, 1 abandoned, 1 in_progress');

    // Test 8: Get Session History (GET /api/sessions)
    console.log('\nTest 8: Get Session History (GET /api/sessions)');
    res = await makeRequest('GET', '/sessions', null, { Authorization: `Bearer ${tokenA}` });
    assertEquals(res.status, 200, 'GET /sessions should return 200');
    assert(Array.isArray(res.body.sessions), 'sessions must be an array');
    assert(res.body.sessions.length >= 5, 'Should have at least 5 sessions for user A');
    // Verify sorting: newest -> oldest
    const sessions = res.body.sessions;
    for (let i = 0; i < sessions.length - 1; i++) {
      const currTime = new Date(sessions[i].startedAt).getTime();
      const nextTime = new Date(sessions[i + 1].startedAt).getTime();
      assert(currTime >= nextTime, 'Sessions must be ordered newest to oldest');
    }
    // Verify fields in history
    const sample = sessions[0];
    assert(sample.startedAt, 'Must include startedAt');
    assert(typeof sample.workMinutes === 'number', 'Must include workMinutes');
    assert(typeof sample.breakMinutes === 'number', 'Must include breakMinutes');
    assert(sample.status, 'Must include status');
    console.log('✅ PASS: Session history returned correctly with proper ordering and fields\n');

    // Test 9: Session Statistics (GET /api/sessions/stats)
    console.log('Test 9: Session Statistics (GET /api/sessions/stats)');
    res = await makeRequest('GET', '/sessions/stats', null, { Authorization: `Bearer ${tokenA}` });
    assertEquals(res.status, 200, 'GET /sessions/stats should return 200');
    const stats = res.body;

    // Verify summary
    assert(stats.summary, 'Must return summary');
    assertEquals(stats.summary.totalPomodoros, 3, 'Total completed Pomodoros should be 3');
    assert(stats.summary.totalFocusMinutes >= 75, 'Total focus minutes should be at least 75m');
    assert(stats.summary.totalExerciseMinutes >= 15, 'Total exercise minutes should be at least 15m');
    assert(stats.summary.totalCaloriesBurned > 0, 'Total calories burned must be > 0');
    assertEquals(stats.summary.skippedSessions, 1, 'Should have 1 skipped session');
    assertEquals(stats.summary.abandonedSessions, 1, 'Should have 1 abandoned session');

    // Verify Today's Overview
    assert(stats.today, 'Must return today stats');
    assertEquals(stats.today.pomodoros, 3, 'Today completed pomodoros should be 3');
    assert(stats.today.formattedFocusTime, 'Must return formattedFocusTime string');

    // Verify Hourly Distribution (Pomodoro Heatmap)
    assert(Array.isArray(stats.byHour), 'byHour must be an array of 24 hours');
    assertEquals(stats.byHour.length, 24, 'byHour must contain 24 hour slots');

    // Verify Daily breakdown
    assert(Array.isArray(stats.byDay), 'byDay must be an array');
    assert(stats.byDay.length >= 1, 'byDay must have at least 1 entry for today');

    // Verify Day of week
    assert(stats.byDayOfWeek, 'Must return byDayOfWeek stats');

    // Verify Exercise activity breakdown
    assert(stats.exerciseActivity, 'Must return exerciseActivity stats');
    assert(stats.exerciseActivity.totalCaloriesBurned > 0, 'Exercise activity calories must be > 0');
    console.log('✅ PASS: All statistics, analytics, and dashboard metrics verified successfully!\n');

    // Test 10: Clean up test data
    console.log('Test 10: Clean up test data');
    await prisma.session.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    console.log('✅ Test cleanup completed');

    console.log('\n🎉 ALL 10 TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    server.close();
  }
}

runSessionTests();
