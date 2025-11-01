"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all suppliers
router.get('/', async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany();
        res.json(suppliers);
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch supplier' });
    }
});
// Create new supplier
router.post('/', auth_1.auth, [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('contactInfo').optional().trim()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create supplier' });
    }
});
// Update supplier
router.put('/:id', auth_1.auth, [
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('contactInfo').optional().trim()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update supplier' });
    }
});
// Delete supplier
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        await prisma.supplier.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
});
exports.default = router;
