"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all quotes
router.get('/', auth_1.auth, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});
// Get quote by ID
router.get('/:id', auth_1.auth, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch quote' });
    }
});
// Create new quote
router.post('/', auth_1.auth, [
    (0, express_validator_1.body)('vehicleId').isInt(),
    (0, express_validator_1.body)('items').isArray(),
    (0, express_validator_1.body)('items.*.serviceId').isInt(),
    (0, express_validator_1.body)('items.*.price').isFloat({ min: 0 })
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const totalPrice = req.body.items.reduce((sum, item) => sum + item.price, 0);
        const quote = await prisma.quote.create({
            data: {
                vehicleId: req.body.vehicleId,
                totalPrice,
                items: {
                    create: req.body.items.map((item) => ({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create quote' });
    }
});
// Update quote
router.put('/:id', auth_1.auth, [
    (0, express_validator_1.body)('items').optional().isArray(),
    (0, express_validator_1.body)('items.*.serviceId').optional().isInt(),
    (0, express_validator_1.body)('items.*.price').optional().isFloat({ min: 0 })
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Delete existing items
        await prisma.quoteItem.deleteMany({
            where: { quoteId: parseInt(req.params.id) }
        });
        const totalPrice = req.body.items.reduce((sum, item) => sum + item.price, 0);
        const quote = await prisma.quote.update({
            where: { id: parseInt(req.params.id) },
            data: {
                totalPrice,
                items: {
                    create: req.body.items.map((item) => ({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update quote' });
    }
});
// Delete quote
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        await prisma.quote.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});
exports.default = router;
