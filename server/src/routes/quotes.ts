import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all quotes
router.get('/', auth, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        vehicle: true,
        items: {
          include: {
            service: true
          }
        }
      }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get quote by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vehicle: true,
        items: {
          include: {
            service: true
          }
        }
      }
    });
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Create new quote
router.post('/',
  auth,
  [
    body('vehicleId').isInt(),
    body('items').isArray(),
    body('items.*.serviceId').isInt(),
    body('items.*.price').isFloat({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const totalPrice = req.body.items.reduce(
        (sum: number, item: { price: number }) => sum + item.price,
        0
      );

      const quote = await prisma.quote.create({
        data: {
          vehicleId: req.body.vehicleId,
          totalPrice,
          items: {
            create: req.body.items.map((item: { serviceId: number; price: number }) => ({
              serviceId: item.serviceId,
              price: item.price
            }))
          }
        },
        include: {
          vehicle: true,
          items: {
            include: {
              service: true
            }
          }
        }
      });
      res.status(201).json(quote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create quote' });
    }
  }
);

// Update quote
router.put('/:id',
  auth,
  [
    body('items').optional().isArray(),
    body('items.*.serviceId').optional().isInt(),
    body('items.*.price').optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Delete existing items
      await prisma.quoteItem.deleteMany({
        where: { quoteId: parseInt(req.params.id) }
      });

      const totalPrice = req.body.items.reduce(
        (sum: number, item: { price: number }) => sum + item.price,
        0
      );

      const quote = await prisma.quote.update({
        where: { id: parseInt(req.params.id) },
        data: {
          totalPrice,
          items: {
            create: req.body.items.map((item: { serviceId: number; price: number }) => ({
              serviceId: item.serviceId,
              price: item.price
            }))
          }
        },
        include: {
          vehicle: true,
          items: {
            include: {
              service: true
            }
          }
        }
      });
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update quote' });
    }
  }
);

// Delete quote
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.quote.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

export default router;