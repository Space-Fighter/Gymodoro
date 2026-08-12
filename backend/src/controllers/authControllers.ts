import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../lib/prisma.js';
import { GYMODORO_LOGO_BASE64 } from '../emailAssets.js';

// --- Config -----------------------------------------------------------

// Don't silently fall back to a known default secret — that makes the
// "fatal error" check below pointless, since JWT_SECRET is never falsy.
const rawJwtSecret = process.env.JWT_SECRET;
if (!rawJwtSecret) {
  throw new Error('⚠️☠️ FATAL ERROR: JWT_SECRET is not defined in .env ☠️⚠️');
}
// Re-assigned with an explicit `string` type: TS narrows `rawJwtSecret` to
// `string` right after the check above, but that narrowing doesn't survive
// inside functions defined later in this file — this constant carries it.
const JWT_SECRET: string = rawJwtSecret;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
// verify-email is a backend JSON endpoint with no frontend page behind it,
// so its link must point at the API origin, not CLIENT_URL (the frontend).
const API_URL = process.env.API_URL || 'http://localhost:3000';
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RESEND_VERIFICATION_COOLDOWN_MS = 60 * 1000; // 1 minute

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  throw new Error('⚠️☠️ FATAL ERROR: GOOGLE_CLIENT_ID is not defined in .env ☠️⚠️');
}
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Configure your SMTP provider here (Gmail, SendGrid, Mailgun, Resend, etc.)
// via env vars — never hardcode credentials.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Helpers ------------------------------------------------------------

// We never store raw tokens (verification tokens or refresh tokens) in the
// DB — only their SHA-256 hash. A DB leak alone then can't be replayed as
// a valid token, the same way you'd never store a raw password.
function hashToken(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function signAccessToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
}

// Issues a new refresh token, persists its hash in the RefreshToken table
// (so it can be looked up and revoked later), and sets it as a cookie.
async function issueRefreshToken(userId: string, res: Response) {
  const rawToken = signRefreshToken(userId);
  await prisma.refreshToken.create({
    data: {
      hashedToken: hashToken(rawToken),
      userId,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });
  setRefreshCookie(res, rawToken);
  return rawToken;
}

async function sendVerificationEmail(email: string, rawToken: string) {
  const link = `${API_URL}/api/auth/verify-email?token=${rawToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"No Reply" <no-reply@example.com>',
    to: email,
    subject: 'Verify your email',
    html: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;font-family:Arial,Helvetica,sans-serif;">
              <tr>
                <td align="center" style="font-size:20px;font-weight:700;color:#111111;padding-bottom:8px;">
                  Welcome to Gymodoro
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size:14px;color:#444444;padding-bottom:28px;">
                  Please verify your email address to activate your account.
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${link}"
                     style="display:inline-block;background-color:#000000;color:#ffffff;font-weight:700;
                            font-size:16px;letter-spacing:0.3px;text-decoration:none;
                            padding:14px 32px;border-radius:8px;">
                    Verify Email
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <img src="cid:gymodoro-logo" alt="Gymodoro" width="500" style="display:block;" />
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size:12px;color:#888888;">
                  This link expires in 24 hours. If you didn't create a Gymodoro account, you can ignore this email.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`,
    attachments: [
      {
        filename: 'gymodoro-logo.png',
        content: Buffer.from(GYMODORO_LOGO_BASE64, 'base64'),
        cid: 'gymodoro-logo',
      },
    ],
  });
}

// --- Routes ---------------------------------------------------------------

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Raw verification token goes in the email link; only its hash is
    // stored, same principle as the refresh tokens below.
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
        verificationToken: hashToken(rawVerificationToken),
        verificationTokenExpiry: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
      },
    });

    let emailSent = true;
    try {
      await sendVerificationEmail(email, rawVerificationToken);
    } catch (mailErr) {
      // Don't fail registration just because the email didn't send —
      // log it and tell the user to use the resend button.
      emailSent = false;
      console.error('Failed to send verification email:', mailErr);
    }

    // Hard wall: no access token, no refresh cookie until the email is
    // verified. The user has to come back through /login after verifying.
    res.status(201).json({
      message: emailSent
        ? 'User registered successfully. Please check your email to verify your account before logging in.'
        : 'Account created, but we could not send the verification email. Please use the "Resend Email" button to try again.',
      emailSent,
      user: { id: newUser.id, email: newUser.email, emailVerified: newUser.emailVerified },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    // When the user clicks the email link, they go to a URL like http://localhost:3000/verify-email?token=abc123. 
    // The req.query object grabs variables from the URL, so this line pulls out "abc123".
    const { token } = req.query; 
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Verification token is required.' });
    }
    /*
    Prisma's findFirst() method returns one of two things:
    1. If found: It returns the entire User object from your database.
    2. If not found: It returns null.
    */
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: hashToken(token),
        verificationTokenExpiry: { gt: new Date() },
      },
    });
    // If user is null, that means either the token was invalid or it expired. In either case, we return a 400 error with a message.
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }
    // Else we update the user's record to mark their email as verified and clear the token and expiry fields.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Email verification failed.' });
  }
}

export async function resendVerificationEmail(req: Request, res: Response) {
  // Same response for "no such user", "already verified", and "link sent",
  /*
  a standardized genericResponse object. This is an anti-enumeration defense. 
  By returning this exact same message whether the email exists, doesn't exist, 
  or is already verified, an attacker cannot use this API to discover 
  which email addresses have accounts in your database
  */
  const genericResponse = {
    message: "If an account exists for this email and isn't verified yet, a new link has been sent.",
  };

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return res.status(200).json(genericResponse);
    }

    // No dedicated "last sent at" column — the existing expiry encodes it,
    // since it's always set to (issue time + VERIFICATION_TOKEN_EXPIRY_MS).
    if (user.verificationTokenExpiry) {
      const lastIssuedAt = user.verificationTokenExpiry.getTime() - VERIFICATION_TOKEN_EXPIRY_MS;
      if (Date.now() - lastIssuedAt < RESEND_VERIFICATION_COOLDOWN_MS) {
        // Only branch that isn't generic. It reveals nothing to a third
        // party — you'd already have to be resending for this address.
        return res.status(429).json({ message: 'Please wait before requesting another email.' });
      }
    }

    const rawVerificationToken = crypto.randomBytes(32).toString('hex');

    // Overwriting invalidates whatever link was sent previously.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: hashToken(rawVerificationToken),
        verificationTokenExpiry: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
      },
    });

    try {
      await sendVerificationEmail(user.email, rawVerificationToken);
    } catch (mailErr) {
      // Unlike register(), a resend that fails to dispatch has nothing to
      // fall back on — surface it so the user knows to retry, rather than
      // claiming success on an email that never went out.
      console.error('Failed to resend verification email:', mailErr);
      return res.status(500).json({
        message: 'We encountered an issue sending the email. Please try again in a few moments.',
      });
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resend verification email.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Accounts created via Google sign-in have no password — send them
    // back to Google instead of comparing against null.
    if (!user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please log in with Google.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Hard wall: unverified accounts get no tokens at all. Checked after
    // the password compare so a wrong password still reads as 401 rather
    // than confirming the account exists.
    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        emailVerified: false,
      });
    }

    const accessToken = signAccessToken(user.id);
    await issueRefreshToken(user.id, res);

    res.status(200).json({
      message: 'Login successful!',
      user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed.' });
  }
}

// Frontend flow: use Google Identity Services (https://accounts.google.com/gsi/client)
// to get a Google-signed ID token, then POST it here as { idToken }.
// This avoids a server-side redirect dance and fits your stateless JWT setup.
export async function googleLogin(req: Request, res: Response) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google token.' });
    }

    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Existing account (e.g. originally registered with a password) —
      // link the Google id if it isn't set yet, and treat the email as
      // verified since Google already confirmed it.
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, emailVerified: true },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          password: null,
          emailVerified: true,
        },
      });
    }

    const accessToken = signAccessToken(user.id);
    await issueRefreshToken(user.id, res);

    res.status(200).json({
      message: 'Google login successful!',
      user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Google authentication failed.' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not found/provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Access token expired.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const incomingToken = req.cookies.refreshToken;
    if (!incomingToken) {
      return res.status(401).json({ message: 'Refresh token not found.' }); // if no refresh token is present, the user is not logged in
    }

    // 1. Verify signature + expiry of the JWT itself.
    let decoded: { id: string };
    try {
      decoded = jwt.verify(incomingToken, JWT_SECRET) as { id: string };
    } catch (err) {
      clearRefreshCookie(res);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Refresh token expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    // 2. Look it up in the DB by its hash — this is what makes revocation
    // and reuse-detection possible (a bare JWT check can't do this).
    const hashedIncomingToken = hashToken(incomingToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken: hashedIncomingToken },
    });

    if (!storedToken || storedToken.userId !== decoded.id) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Refresh token not recognized.' });
    }

    if (storedToken.revoked) {
      // This exact token was already rotated away once before. Seeing it
      // again means it likely leaked and someone is replaying an old
      // token — revoke every refresh token this user has as a precaution
      // and force a fresh login.
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.id, revoked: false },
        data: { revoked: true },
      });
      clearRefreshCookie(res);
      return res.status(401).json({
        message: 'Refresh token reuse detected. All sessions have been logged out — please log in again.',
      });
    }

    if (storedToken.expireAt < new Date()) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Refresh token expired. Please log in again.' });
    }

    // 3. Rotate: revoke the used token, then issue + persist a new one.
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const newAccessToken = signAccessToken(decoded.id);
    await issueRefreshToken(decoded.id, res);

    res.status(200).json({
      message: 'Access token refreshed successfully.',
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Token refresh failed.' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const incomingToken = req.cookies.refreshToken;
    if (incomingToken) {
      // Revoke by hash lookup, not by decoding the JWT — this way a
      // malformed/expired cookie still gets cleared without throwing.
      await prisma.refreshToken.updateMany({
        where: { hashedToken: hashToken(incomingToken) },
        data: { revoked: true },
      });
    }
    clearRefreshCookie(res);
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Logout failed.' });
  }
}