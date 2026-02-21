const express = require('express');
const router = express.Router();
const db = require('../db/store');
const authMiddleware = require('../middleware/auth');

// All routes are protected
router.use(authMiddleware);

// ─── GET /api/vehicles ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const vehicles = await db.vehicles.findAll();
        res.json(vehicles);
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ message: 'Server error fetching vehicles' });
    }
});

// ─── POST /api/vehicles ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const v = await db.vehicles.create(req.body);
        await db.activities.create(`New vehicle ${v.name} added to registry`, 'vehicle');
        res.status(201).json(v);
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({ message: 'Server error creating vehicle' });
    }
});

// ─── PUT /api/vehicles/:id ───────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const v = await db.vehicles.update(req.params.id, req.body);
        if (!v) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(v);
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({ message: 'Server error updating vehicle' });
    }
});

// ─── DELETE /api/vehicles/:id ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const v = await db.vehicles.delete(req.params.id);
        if (!v) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted', vehicle: v });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ message: 'Server error deleting vehicle' });
    }
});

module.exports = router;
