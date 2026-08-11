# Auth Controller Testing Guide

This document covers how to run integration tests for the auth controller.

## CI/CD Pipeline

Tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Changes in `backend/` directory

**Pipeline Status:** Check `.github/workflows/test-auth.yml`

## Running Tests Locally

### Prerequisites

1. **Backend dependencies installed:**
   ```bash
   cd backend
   npm install
   ```

2. **Prisma client generated:**
   ```bash
   npx prisma generate
   ```

3. **Test database set up:**
   ```bash
   # Create test database
   createdb gymodoro_test
   ```

4. **Backend running:**
   ```bash
   # Terminal 1
   cd backend
   npm run dev
   ```

### Run Tests

```bash
# Terminal 2
cd backend
node tests/auth.test.js
```

**Expected output:**
```
🧪 Starting Auth Controller Tests

Test 1: Register User
✅ PASS

Test 2: Register with duplicate email
✅ PASS

... (all tests)

✨ All tests passed! ✨
```

## What Gets Tested

| Test | Endpoint | Description |
|------|----------|-------------|
| 1 | `POST /register` | Create new user |
| 2 | `POST /register` | Reject duplicate email |
| 3 | `POST /register` | Require all fields |
| 4 | `POST /login` | Reject unverified email |
| 5 | `POST /resend-verification` | Request new verification email |
| 6 | `GET /verify-email` | Verify email (simulated) |
| 7 | `POST /login` | Login with verified email |
| 8 | `POST /login` | Reject wrong password |
| 9 | `POST /login` | Reject non-existent email |
| 10 | `GET /get-me` | Fetch current user with token |
| 11 | `GET /get-me` | Reject missing token |
| 12 | `GET /get-me` | Reject invalid token |
| 13 | `POST /refresh-token` | Reject refresh without cookie |
| 14 | `POST /logout` | Log out user |

## Test Environment Variables

The CI pipeline sets these automatically:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gymodoro_test
JWT_SECRET=test-secret-key-this-is-a-very-long-secret-for-testing
GOOGLE_CLIENT_ID=test-google-client-id
CLIENT_URL=http://localhost:3000
```

For local testing with `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gymodoro_test
JWT_SECRET=test-secret-key-this-is-a-very-long-secret-for-testing
GOOGLE_CLIENT_ID=test-google-client-id
CLIENT_URL=http://localhost:3000
```

## Troubleshooting

### "Connection refused" error

**Solution:** Ensure PostgreSQL is running and database exists:
```bash
createdb gymodoro_test
```

### "ECONNREFUSED 127.0.0.1:3000"

**Solution:** Backend server not running. Start it in another terminal:
```bash
npm run dev
```

### "Cannot find module '@prisma/client'"

**Solution:** Generate Prisma client:
```bash
npx prisma generate
```

### "User verification token not found"

Tests manually verify emails in the DB for CI purposes. In production, users click email links.

## Test Structure

Tests use simple `http` module (no external test frameworks) to:
1. Make HTTP requests to running server
2. Verify response status codes
3. Validate response body
4. Check error messages

No external test framework means:
- ✅ Minimal dependencies
- ✅ Tests work in CI easily
- ✅ Can be run manually
- ❌ No mocking (integration tests only)
- ❌ No snapshots or fixtures

## Adding New Tests

1. Add test case to `backend/tests/auth.test.js`
2. Use `makeRequest()` helper to call endpoints
3. Use `assert()` or `assertEquals()` to verify results
4. Run locally: `node tests/auth.test.js`
5. Push and CI will run automatically

Example:
```javascript
console.log('Test X: Your test name');
const res = await makeRequest('POST', '/endpoint', { body });
assertEquals(res.status, 200, 'Your assertion message');
console.log('✅ PASS\n');
```

## CI/CD Pipeline Details

### Pipeline Stages

1. **Setup**
   - Checkout code
   - Setup Node.js v18
   - Start PostgreSQL service

2. **Build**
   - Install dependencies
   - Generate Prisma client
   - Run migrations

3. **Test**
   - Start backend server
   - Run integration tests
   - Check server logs on failure

4. **Lint** (parallel job)
   - Run ESLint if configured

### Pipeline Files

- **Workflow:** `.github/workflows/test-auth.yml`
- **Tests:** `backend/tests/auth.test.js`

### Viewing Results

1. Push to GitHub
2. Go to repo → Actions tab
3. Click workflow run
4. View logs for each job

## Performance

Tests take ~30-60 seconds total in CI:
- Database setup: ~5s
- Server startup: ~3s
- Tests: ~10-15s
- Cleanup: ~5s

## Notes

- Tests create a unique test user (email contains timestamp) to avoid conflicts
- Email verification is simulated (not actually sent) in CI
- Google OAuth tests are skipped (requires real token)
- All tests run against a temporary test database
- Database is cleaned up after tests

## Future Improvements

- [ ] Add Jest or Vitest for unit tests
- [ ] Add test database seeding
- [ ] Add Google OAuth mock tests
- [ ] Add load/stress tests
- [ ] Add end-to-end frontend tests
