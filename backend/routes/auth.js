const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db/store');
const authMiddleware = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fleetflow_secret';

// Helper to sign JWT
const signToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, roleKey: user.roleKey },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ─── POST /login ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.users.findByEmail(email);

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = signToken(user);
        const { password: _, ...userWithoutPw } = user;
        res.json({ token, user: userWithoutPw });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ─── POST /signup ────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role, roleKey } = req.body;
        const existingUser = await db.users.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const newUser = await db.users.create({ name, email, password, role, roleKey, avatar });
        const token = signToken(newUser);
        const { password: _, ...userWithoutPw } = newUser;
        res.json({ token, user: userWithoutPw });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// ─── POST /google ────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
    try {
        const { accessToken, profile, role, roleKey } = req.body;
        // In a real app, we would verify the accessToken with Google here
        // or verify an idToken. For this demo, we trust the profile from frontend
        // and upsert it into our store.
        const user = await db.users.upsertGoogle(profile, role, roleKey);
        const token = signToken(user);
        res.json({ token, user });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ message: 'Invalid Google session' });
    }
});

// ─── GET /me ─────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await db.users.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password: _, ...userWithoutPw } = user;
        res.json(userWithoutPw);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error fetching user' });
    }
});

module.exports = router;
