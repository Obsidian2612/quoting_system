import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Admin login
router.post('/login',
  [
    body('username').notEmpty(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const admin = await prisma.admin.findUnique({
        where: { username: req.body.username }
      });

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(req.body.password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Create admin (protected route)
router.post('/',
  auth,
  [
    body('username').notEmpty(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { username: req.body.username }
      });

      if (existingAdmin) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const passwordHash = await bcrypt.hash(req.body.password, 10);
      const admin = await prisma.admin.create({
        data: {
          username: req.body.username,
          passwordHash
        }
      });

      res.status(201).json({
        id: admin.id,
        username: admin.username
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create admin' });
    }
  }
);

export default router;