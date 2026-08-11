# Auth Endpoints Testing Guide

Complete Postman testing guide for all authentication endpoints in Gymodoro.

## Prerequisites

- Backend running: `cd backend && npm run dev` (port 3000)
- Postman installed
- Database configured with `DATABASE_URL` in `.env`
- Email service configured (optional for registration/verification)
- JWT_SECRET and GOOGLE_CLIENT_ID in `.env`

## Base URL
```
http://localhost:3000/api/auth
```

## Common Headers
```
Content-Type: application/json
```

---

## 1. Register User

**Endpoint:** `POST /register`

**Description:** Create a new user account with email and password. Sends verification email (if configured).

### Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Success Response (201)

```json
{
  "message": "User registered successfully. Please check your email to verify your account before logging in.",
  "emailSent": true,
  "user": {
    "id": "user_uuid",
    "email": "john@example.com",
    "emailVerified": false
  }
}
```

### Error Responses

**400 - Missing Fields**
```json
{
  "message": "Name, email, and password are required."
}
```

**400 - Email Already Registered**
```json
{
  "message": "Email already registered."
}
```

**201 - Email Send Failed** (Account still created)
```json
{
  "message": "Account created, but we could not send the verification email. Please use the \"Resend Email\" button to try again.",
  "emailSent": false,
  "user": {
    "id": "user_uuid",
    "email": "john@example.com",
    "emailVerified": false
  }
}
```

**500 - Server Error**
```json
{
  "error": "Registration failed."
}
```

### Testing Steps

1. Create a new POST request to `http://localhost:3000/api/auth/register`
2. Set body (raw JSON):
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "TestPass123"
}
```
3. Send request
4. Verify status is 201 and user is created
5. Check database: `SELECT * FROM "User" WHERE email = 'testuser@example.com';`

---

## 2. Verify Email

**Endpoint:** `GET /verify-email?token=<verification_token>`

**Description:** Verify user's email using the token sent in registration email. **Token is in the email link, not requested separately.**

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Verification token from email link |

### Success Response (200)

```json
{
  "message": "Email verified successfully."
}
```

### Error Responses

**400 - Missing Token**
```json
{
  "message": "Verification token is required."
}
```

**400 - Invalid or Expired Token**
```json
{
  "message": "Invalid or expired verification token."
}
```

**500 - Server Error**
```json
{
  "error": "Email verification failed."
}
```

### Testing Steps

1. Register a new user (step 1) — check your email inbox for verification link
2. Extract the token from the email link (format: `http://localhost:3000/verify-email?token=xyz...`)
3. In Postman, create GET request: `http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN_HERE`
4. Send request
5. Verify status is 200 and message says "Email verified successfully"
6. Check database: `SELECT emailVerified FROM "User" WHERE email = 'testuser@example.com';` (should be true)

**Alternative (if email not received):**
- Use the Resend Verification endpoint (step 3)
- Check backend logs for email errors
- Verify EMAIL_HOST/EMAIL_PORT/.env configuration

---

## 3. Resend Verification Email

**Endpoint:** `POST /resend-verification`

**Description:** Request a new verification email if the original didn't arrive. Has a 1-minute cooldown between resends.

### Request

```json
{
  "email": "john@example.com"
}
```

### Success Response (200) — Generic (anti-enumeration)

```json
{
  "message": "If an account exists for this email and isn't verified yet, a new link has been sent."
}
```

### Error Responses

**400 - Missing Email**
```json
{
  "message": "Email is required."
}
```

**429 - Resend Cooldown** (only revealed if account exists + unverified)
```json
{
  "message": "Please wait before requesting another email."
}
```

**500 - Email Send Error**
```json
{
  "message": "We encountered an issue sending the email. Please try again in a few moments."
}
```

### Testing Steps

1. Create new user via Register (step 1) with email: `resendtest@example.com`
2. Create POST request to `http://localhost:3000/api/auth/resend-verification`
3. Set body:
```json
{
  "email": "resendtest@example.com"
}
```
4. Send request
5. Verify status is 200
6. Check email inbox for new verification link
7. Try immediately again → should get 429 (Please wait...) response
8. Wait 60+ seconds and try again → should succeed with 200

**Note:** Response is generic for security — can't enumerate registered emails.

---

## 4. Login

**Endpoint:** `POST /login`

**Description:** Log in with email and password. Returns access token + sets refresh token cookie. **Email must be verified first.**

### Request

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Success Response (200)

```json
{
  "message": "Login successful!",
  "user": {
    "id": "user_uuid",
    "email": "john@example.com",
    "emailVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Also sets cookie:**
```
refreshToken: <jwt_token> [httpOnly, Secure, SameSite=Strict, maxAge=7d]
```

### Error Responses

**400 - Missing Email/Password**
```json
{
  "message": "Email and password are required."
}
```

**401 - Invalid Email**
```json
{
  "message": "Invalid email or password."
}
```

**401 - Wrong Password**
```json
{
  "message": "Invalid email or password."
}
```

**400 - Google Sign-In Account** (no password)
```json
{
  "message": "This account uses Google Sign-In. Please log in with Google."
}
```

**403 - Email Not Verified**
```json
{
  "message": "Please verify your email before logging in. Check your inbox for the verification link.",
  "emailVerified": false
}
```

**500 - Server Error**
```json
{
  "error": "Login failed."
}
```

### Testing Steps

1. Register and verify a user (steps 1-2)
2. Create POST request to `http://localhost:3000/api/auth/login`
3. Set body:
```json
{
  "email": "testuser@example.com",
  "password": "TestPass123"
}
```
4. Send request
5. Verify status is 200
6. **Copy the accessToken** for use in authenticated endpoints
7. Check **Cookies** tab in Postman → should see `refreshToken` cookie
8. Test error case: Try wrong password → should get 401

---

## 5. Get Current User (Get Me)

**Endpoint:** `GET /get-me`

**Description:** Fetch current user details using access token. **Requires valid access token in Authorization header.**

### Headers

```
Authorization: Bearer <access_token>
```

### Success Response (200)

```json
{
  "user": {
    "id": "user_uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

### Error Responses

**401 - Missing Token**
```json
{
  "message": "Token not found/provided."
}
```

**401 - Invalid Token**
```json
{
  "message": "Invalid token."
}
```

**401 - Token Expired**
```json
{
  "message": "Access token expired."
}
```

**404 - User Not Found**
```json
{
  "message": "User not found."
}
```

**500 - Server Error**
```json
{
  "error": "Failed to fetch user."
}
```

### Testing Steps

1. Login (step 4) and copy the accessToken
2. Create GET request to `http://localhost:3000/api/auth/get-me`
3. Set header:
```
Authorization: Bearer <paste_your_token_here>
```
4. Send request
5. Verify status is 200 and user data is returned
6. Test error case: Remove token → should get 401

---

## 6. Refresh Token

**Endpoint:** `POST /refresh-token`

**Description:** Get a new access token using the refresh token cookie. **Refresh token is automatically sent as a cookie.** Old refresh token is revoked and new one is issued.

### Request Body

None (refresh token comes from cookie)

### Success Response (200)

```json
{
  "message": "Access token refreshed successfully.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Also sets new cookie:**
```
refreshToken: <new_jwt_token> [httpOnly, Secure, SameSite=Strict, maxAge=7d]
```

### Error Responses

**401 - No Refresh Token**
```json
{
  "message": "Refresh token not found."
}
```

**401 - Invalid Refresh Token**
```json
{
  "message": "Invalid refresh token."
}
```

**401 - Refresh Token Expired**
```json
{
  "message": "Refresh token expired. Please log in again."
}
```

**401 - Token Reuse Detected** (security: all user sessions logged out)
```json
{
  "message": "Refresh token reuse detected. All sessions have been logged out — please log in again."
}
```

**401 - Token Not Recognized**
```json
{
  "message": "Refresh token not recognized."
}
```

**500 - Server Error**
```json
{
  "error": "Token refresh failed."
}
```

### Testing Steps

1. Login (step 4) — Postman automatically captures refreshToken cookie
2. Wait for access token to expire or manually test refresh
3. Create POST request to `http://localhost:3000/api/auth/refresh-token`
4. **Do NOT add body**
5. Postman will auto-send refreshToken cookie
6. Send request
7. Verify status is 200
8. **Copy new accessToken** from response
9. Check Cookies → refreshToken should be updated

**To test reuse detection:**
1. Login and get refreshToken
2. Call /refresh-token → get newAccessToken + newRefreshToken
3. Call /refresh-token again with **old refreshToken** → get 401 "Refresh token reuse detected"
4. All sessions for user are now logged out (security feature)

---

## 7. Logout

**Endpoint:** `POST /logout`

**Description:** Revoke the refresh token cookie and log out the user. **Refresh token sent as cookie.**

### Request Body

None (refresh token comes from cookie)

### Success Response (200)

```json
{
  "message": "Logged out successfully."
}
```

### Error Responses

**500 - Server Error**
```json
{
  "error": "Logout failed."
}
```

### Testing Steps

1. Login (step 4) — Postman captures refreshToken cookie
2. Create POST request to `http://localhost:3000/api/auth/logout`
3. **Do NOT add body**
4. Postman will auto-send refreshToken cookie
5. Send request
6. Verify status is 200
7. Check Cookies → refreshToken should be cleared
8. Try calling /get-me → should fail (no token)
9. Try calling /refresh-token → should fail (no refresh token)

---

## 8. Google Login

**Endpoint:** `POST /google`

**Description:** Log in with Google ID token (from frontend Google Identity Services). Creates account if new user, links Google ID if existing user.

### Request

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6I..."
}
```

**Note:** idToken must be a valid Google ID token (obtained from Google Identity Services on frontend).

### Success Response (200)

```json
{
  "message": "Google login successful!",
  "user": {
    "id": "user_uuid",
    "email": "user@gmail.com",
    "emailVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Also sets cookie:**
```
refreshToken: <jwt_token> [httpOnly, Secure, SameSite=Strict, maxAge=7d]
```

### Error Responses

**400 - Missing ID Token**
```json
{
  "message": "Google ID token is required."
}
```

**401 - Invalid Google Token**
```json
{
  "message": "Invalid Google token."
}
```

**401 - Authentication Failed**
```json
{
  "error": "Google authentication failed."
}
```

### Testing Steps

**Setup (on Frontend):**
1. Get Google ID token from Google Identity Services
2. This requires `GOOGLE_CLIENT_ID` in env and frontend integration

**In Postman (with real token):**
1. Obtain valid Google ID token from frontend
2. Create POST request to `http://localhost:3000/api/auth/google`
3. Set body:
```json
{
  "idToken": "<paste_real_google_id_token_here>"
}
```
4. Send request
5. Verify status is 200
6. Check if new user created or Google ID linked to existing user

**Note:** Cannot easily test without actual Google ID token. For development, frontend must provide this token.

---

## Quick Reference: Testing Workflow

### Full Registration → Login Flow

1. **Register** → POST /register with name, email, password
2. **Check Email** → Get verification token from email
3. **Verify** → GET /verify-email?token=...
4. **Login** → POST /login with email, password → Get accessToken + refreshToken cookie
5. **Get Me** → GET /get-me with Authorization: Bearer {accessToken}
6. **Refresh** → POST /refresh-token (cookie auto-sent) → Get new accessToken
7. **Logout** → POST /logout (cookie auto-sent) → Cleared

### Postman Setup Tips

- **Enable cookies:** Postman → Settings → General → "Automatically follow redirects"
- **Save requests in collection** for reuse
- **Use variables** for base URL and tokens:
  - Set `{{baseUrl}}` = `http://localhost:3000/api/auth`
  - Set `{{token}}` = copy from login response
  - Use `{{baseUrl}}/login` in requests
- **Copy accessToken** after login into Authorization header of /get-me, /refresh-token
- **Test error cases** — try missing fields, wrong credentials, expired tokens

### Token Expiry Times

| Token | Expiry | Notes |
|-------|--------|-------|
| Access Token (JWT) | 15 minutes | Used to authenticate API requests |
| Refresh Token (JWT) | 7 days | Stored hashed in DB for revocation |
| Verification Token | 24 hours | Sent in registration email |

### Security Features

- ✅ Tokens hashed before storage (SHA-256)
- ✅ Refresh token rotation on use
- ✅ Reuse detection → all user sessions logged out
- ✅ httpOnly, Secure, SameSite=Strict cookies
- ✅ Hard email verification wall (no tokens until verified)
- ✅ Anti-enumeration on email endpoints
- ✅ Cooldown on verification resends
- ✅ Google account password lockout

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Email already registered" | Use new email or delete user from DB |
| "Email and password are required" | Check request body has both fields |
| "Please verify your email" | Run verify endpoint with token from email |
| "Invalid email or password" | Double-check credentials |
| "Refresh token not found" | Ensure refreshToken cookie is sent (check Cookies tab) |
| "Access token expired" | Call /refresh-token to get new token |
| "Verification token is required" | Check URL has ?token=... parameter |

---

## Database Queries for Testing

### View all users
```sql
SELECT id, name, email, "emailVerified", "googleId", "password" FROM "User";
```

### Check user email verification
```sql
SELECT email, "emailVerified", "verificationToken", "verificationTokenExpiry" FROM "User" WHERE email = 'test@example.com';
```

### View refresh tokens (active)
```sql
SELECT "userId", "hashedToken", revoked, "expireAt" FROM "RefreshToken" WHERE revoked = false;
```

### Delete test user (to re-test registration)
```sql
DELETE FROM "User" WHERE email = 'test@example.com';
```

---

## Automated Testing (CI/CD Pipeline)

### Overview

In addition to manual testing, there's an automated test suite that runs:
- **On GitHub:** Automatically on every push/PR to `main` or `develop`
- **Locally:** Before pushing to verify tests pass

### Run Tests Locally

**Prerequisites:**
- Backend running: `npm run dev` (in another terminal)
- Test database created: `createdb gymodoro_test`
- Prisma generated: `npx prisma generate`

**Command:**
```bash
cd backend
node tests/auth.test.js
```

**Expected Output:**
```
🧪 Starting Auth Controller Tests

Test 1: Register User
✅ PASS

Test 2: Register with duplicate email
✅ PASS

... (all tests)

✨ All tests passed! ✨
```

### What Automated Tests Cover

14 integration tests covering:
1. ✅ User registration (success + errors)
2. ✅ Email verification
3. ✅ Email resend with cooldown
4. ✅ Login validation (verified email required)
5. ✅ Login success & failure scenarios
6. ✅ Get current user (token validation)
7. ✅ Token refresh mechanism
8. ✅ Logout & session revocation

### CI/CD Pipeline

**Triggered on:**
- Push to `main` or `develop`
- Pull request to `main` or `develop`
- Changes in `backend/` directory

**Pipeline stages:**
1. Setup Node.js v18 + PostgreSQL
2. Install dependencies
3. Generate Prisma client
4. Run database migrations
5. Start backend server
6. Run integration tests
7. Report results

**View results:**
1. Go to GitHub → Actions tab
2. Click workflow run
3. View logs for detailed output

### Test Database

Tests use a separate `gymodoro_test` database to avoid affecting development data.

**Create test database:**
```bash
createdb gymodoro_test
```

**Test environment variables (auto-set in CI):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gymodoro_test
JWT_SECRET=test-secret-key-this-is-a-very-long-secret-for-testing
GOOGLE_CLIENT_ID=test-google-client-id
CLIENT_URL=http://localhost:3000
```

### Testing Workflow

**Manual Development:**
1. Make code changes
2. Run manual Postman tests (this guide)
3. Verify UI works in browser

**Before Pushing:**
1. Run automated tests: `node tests/auth.test.js`
2. Ensure all tests pass
3. Push to GitHub

**After Pushing:**
1. GitHub Actions runs automatically
2. See results in Actions tab
3. PR will show ✅ or ❌ based on test results

### Troubleshooting Automated Tests

| Issue | Solution |
|-------|----------|
| "Connection refused" | Create test DB: `createdb gymodoro_test` |
| "ECONNREFUSED 3000" | Start backend: `npm run dev` in another terminal |
| "Cannot find module '@prisma/client'" | Run `npx prisma generate` |
| Tests pass locally but fail in CI | Check `.env` matches CI environment variables |
| "User not found" error | Tests create unique users (timestamp in email) |

### For More Details

See `backend/TESTING.md` for:
- Detailed test setup instructions
- How to add new tests
- CI/CD pipeline configuration details
- Performance metrics

---

## Running the Backend

```bash
cd backend
npm run dev
```

Should start on `http://localhost:3000` and show:
```
✓ Database connected
Server listening on port 3000
```

If startup fails, check:
- `JWT_SECRET` in `.env`
- `DATABASE_URL` in `.env`
- `GOOGLE_CLIENT_ID` in `.env`
- PostgreSQL is running
