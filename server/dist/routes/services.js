"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            include: {
                prices: {
                    orderBy: { date: 'desc' },
                    take: 1,
                    include: { supplier: true }
                }
            }
        });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Get service by ID
router.get('/:id', async (req, res) => {
    try {
        const service = await prisma.service.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                prices: {
                    orderBy: { date: 'desc' },
                    include: { supplier: true }
                }
            }
        });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});
// Create new service
router.post('/', auth_1.auth, [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('category').notEmpty().trim(),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('supplierId').isInt()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const service = await prisma.service.create({
            data: {
                name: req.body.name,
                category: req.body.category,
                prices: {
                    create: {
                        price: req.body.price,
                        supplierId: req.body.supplierId
                    }
                }
            },
            include: {
                prices: {
                    include: { supplier: true }
                }
            }
        });
        res.status(201).json(service);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});
// Update service price
router.post('/:id/prices', auth_1.auth, [
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('supplierId').isInt()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const price = await prisma.price.create({
            data: {
                serviceId: parseInt(req.params.id),
                price: req.body.price,
                supplierId: req.body.supplierId
            },
            include: { supplier: true }
        });
        res.status(201).json(price);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update service price' });
    }
});
// Delete service
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        await prisma.service.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});
exports.default = router;
