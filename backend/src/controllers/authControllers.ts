import { json, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
if (!JWT_SECRET) {
  throw new Error("⚠️☠️ FATAL ERROR: JWT_SECRET is not defined in .env ☠️⚠️");
}
export async function register(req, res){
  console.log("👋 Register route hit! Data received:", req.body);
  try {
    const {name, email, password} = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("⚠️ Registration failed: Email already registered:", email);
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({data: { name, email, password: hashedPassword },});
    const acessToken = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days in milliseconds
    res.status(201).json({ message: 'User registered sucessfully 🎉🎉🎉!', user: { id: newUser.id, email: newUser.email }, acessToken: acessToken });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

export async function getMe(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not found/provided.' });
  }
  const decoded = jwt.verify(token, JWT_SECRET); // decoded = { id: 'user_id', iat: initialized at timestamp, exp: expired at timestamp }
  console.log("Decoded token:", decoded);
}

export async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found.' });
  }
  const decoded = jwt.verify(refreshToken, JWT_SECRET);
  const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days in milliseconds
  res.status(200).json({ message: 'Access token and Refresh token refreshed successfully.', accessToken: newAccessToken });
}
/*
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password.' });

    // Sign the JWT payload
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed.' });
  }
};
*/