import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { quotes: true }
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Create new vehicle
router.post('/',
  [
    body('make').notEmpty().trim(),
    body('model').notEmpty().trim(),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('engine').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const vehicle = await prisma.vehicle.create({
        data: {
          make: req.body.make,
          model: req.body.model,
          year: parseInt(req.body.year),
          engine: req.body.engine
        }
      });
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create vehicle' });
    }
  }
);

// Update vehicle
router.put('/:id',
  [
    body('make').optional().trim(),
    body('model').optional().trim(),
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('engine').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const vehicle = await prisma.vehicle.update({
        where: { id: parseInt(req.params.id) },
        data: {
          make: req.body.make,
          model: req.body.model,
          year: req.body.year ? parseInt(req.body.year) : undefined,
          engine: req.body.engine
        }
      });
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  }
);

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    await prisma.vehicle.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;