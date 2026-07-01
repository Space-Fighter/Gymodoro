import { Request, Response } from 'express';
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
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ message: 'User registered sucessfully 🎉🎉🎉!', user: { id: newUser.id, email: newUser.email }, token });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

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