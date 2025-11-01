import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { prices: true }
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Create new supplier
router.post('/',
  auth,
  [
    body('name').notEmpty().trim(),
    body('contactInfo').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const supplier = await prisma.supplier.create({
        data: {
          name: req.body.name,
          contactInfo: req.body.contactInfo
        }
      });
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create supplier' });
    }
  }
);

// Update supplier
router.put('/:id',
  auth,
  [
    body('name').optional().trim(),
    body('contactInfo').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const supplier = await prisma.supplier.update({
        where: { id: parseInt(req.params.id) },
        data: {
          name: req.body.name,
          contactInfo: req.body.contactInfo
        }
      });
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update supplier' });
    }
  }
);

// Delete supplier
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.supplier.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

export default router;