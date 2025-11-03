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

  // Get settings (LLM URL and enabled flag)
  router.get('/settings', auth, async (req, res) => {
    try {
      const settings = await prisma.setting.findMany();
      const result: Record<string, string> = {};
      settings.forEach(s => (result[s.key] = s.value));
      res.json({ llmUrl: result['LLM_URL'] || '', llmEnabled: result['LLM_ENABLED'] === 'true' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Update settings (LLM URL and enabled flag)
  router.post('/settings', auth, async (req, res) => {
    try {
      console.log('Received settings update:', req.body);
      const { llmUrl, llmEnabled } = req.body;

      console.log('Processing settings:', { llmUrl, llmEnabled, types: { llmUrl: typeof llmUrl, llmEnabled: typeof llmEnabled } });

      // Use environment variable if available, otherwise use the provided URL
      const effectiveUrl = process.env.OLLAMA_URL || llmUrl;

      if (typeof llmUrl === 'string' || process.env.OLLAMA_URL) {
        console.log('Updating LLM_URL with:', effectiveUrl);
        await prisma.setting.upsert({
          where: { key: 'LLM_URL' },
          update: { value: effectiveUrl },
          create: { key: 'LLM_URL', value: effectiveUrl }
        });
      }

      if (typeof llmEnabled === 'boolean') {
        console.log('Updating LLM_ENABLED');
        await prisma.setting.upsert({
          where: { key: 'LLM_ENABLED' },
          update: { value: llmEnabled ? 'true' : 'false' },
          create: { key: 'LLM_ENABLED', value: llmEnabled ? 'true' : 'false' }
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Settings update failed:', error);
      res.status(500).json({ 
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Proxy to configured LLM endpoint. Requires auth.
  router.post('/llm/proxy', auth, async (req, res) => {
    try {
      const prompt = req.body.prompt;
      if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

      const llm = await prisma.setting.findUnique({ where: { key: 'LLM_URL' } });
      const enabled = await prisma.setting.findUnique({ where: { key: 'LLM_ENABLED' } });

      if (!llm || !enabled || enabled.value !== 'true') {
        return res.status(400).json({ error: 'LLM not configured or disabled' });
      }

      // Forward the request body to the LLM URL
      const response = await fetch(llm.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        return res.json(json);
      }

      const text = await response.text();
      res.send(text);
    } catch (error) {
      res.status(500).json({ error: 'LLM proxy failed' });
    }
  });

export default router;
