"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
// Admin login
router.post('/login', [
    (0, express_validator_1.body)('username').notEmpty(),
    (0, express_validator_1.body)('password').notEmpty()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
        const isValidPassword = await bcryptjs_1.default.compare(req.body.password, admin.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});
// Create admin (protected route)
router.post('/', auth_1.auth, [
    (0, express_validator_1.body)('username').notEmpty(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 10);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create admin' });
    }
});
exports.default = router;
