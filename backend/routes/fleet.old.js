const express = require('express');
const router = express.Router();
const db = require('../db/store');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ─── DRIVERS ────────────────────────────────────────────────────────────────
router.get('/drivers', (req, res) => res.json(db.drivers.findAll()));
router.get('/drivers/:id', (req, res) => {
    const d = db.drivers.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Driver not found' });
    res.json(d);
});
router.put('/drivers/:id', (req, res) => {
    const d = db.drivers.update(req.params.id, req.body);
    if (!d) return res.status(404).json({ message: 'Driver not found' });
    
    // Log activity for status changes
    if (req.body.status) {
        db.activities.create(`Driver ${d.name} status changed to ${req.body.status}`, 'safety');
    }
    
    res.json(d);
});
router.put('/drivers/:id/safety-score', (req, res) => {
    const { score, incident } = req.body;
    const d = db.drivers.updateSafetyScore(req.params.id, score, incident);
    if (!d) return res.status(404).json({ message: 'Driver not found' });
    
    db.activities.create(`Driver ${d.name} safety score updated to ${score}`, 'safety');
    res.json(d);
});

// ─── TRIPS ──────────────────────────────────────────────────────────────────
router.get('/trips', (req, res) => res.json(db.trips.findAll()));
router.post('/trips', (req, res) => {
    // New trips are always created as "Draft"
    const tripData = { ...req.body, status: 'Draft', date: new Date().toISOString().split('T')[0] };
    const t = db.trips.create(tripData);
    db.activities.create(`New Trip Draft ${t.id} created`, 'add');
    res.status(201).json(t);
});
router.put('/trips/:id', (req, res) => {
    const existingTrip = db.trips.findAll().find(t => t.id === req.params.id);
    if (!existingTrip) return res.status(404).json({ message: 'Trip not found' });

    const newStatus = req.body.status;
    const oldStatus = existingTrip.status;
    const t = db.trips.update(req.params.id, req.body);

    if (t) {
        // Lifecycle Logic
        if (newStatus === 'Dispatched' && oldStatus !== 'Dispatched') {
            db.vehicles.update(t.vehicleId, { status: 'On Trip' });
            db.drivers.update(t.driverId, { status: 'On Duty' });
            db.activities.create(`Trip ${t.id} dispatched — Vehicle ${t.vehicleId} and Driver ${t.driverId} are now on duty`, 'dispatch');
        } else if (newStatus === 'Completed' && oldStatus === 'Dispatched') {
            db.vehicles.update(t.vehicleId, { status: 'Available' });
            db.drivers.update(t.driverId, { status: 'Available' });
            db.activities.create(`Trip ${t.id} completed. Vehicle and Driver released.`, 'success');
        } else if (newStatus === 'Cancelled' && oldStatus === 'Dispatched') {
            db.vehicles.update(t.vehicleId, { status: 'Available' });
            db.drivers.update(t.driverId, { status: 'Available' });
            db.activities.create(`Trip ${t.id} cancelled. Vehicle and Driver reverted to Available.`, 'error');
        }
    }

    res.json(t);
});

// ─── MAINTENANCE ────────────────────────────────────────────────────────────
router.get('/maintenance', (req, res) => {
    const { vehicleId } = req.query;
    if (vehicleId) {
        return res.json(db.maintenance.findByVehicle(vehicleId));
    }
    res.json(db.maintenance.findAll());
});
router.post('/maintenance', (req, res) => {
    const m = db.maintenance.create(req.body);
    db.activities.create(`Vehicle sent for ${m.serviceType}`, 'maintenance');
    res.status(201).json(m);
});
router.put('/maintenance/:id', (req, res) => {
    const m = db.maintenance.update(req.params.id, req.body);
    if (!m) return res.status(404).json({ message: 'Maintenance record not found' });
    res.json(m);
});

// ─── FUEL ───────────────────────────────────────────────────────────────────
router.get('/fuel', (req, res) => {
    const { vehicleId } = req.query;
    if (vehicleId) {
        return res.json(db.fuel.findByVehicle(vehicleId));
    }
    res.json(db.fuel.findAll());
});
router.post('/fuel', (req, res) => {
    const f = db.fuel.create(req.body);
    db.activities.create(`Fuel entry added for vehicle ${req.body.vehicleId}`, 'fuel');
    res.status(201).json(f);
});
router.put('/fuel/:id', (req, res) => {
    const f = db.fuel.update(req.params.id, req.body);
    if (!f) return res.status(404).json({ message: 'Fuel record not found' });
    res.json(f);
});

// ─── FINANCIAL ANALYTICS ────────────────────────────────────────────────────
router.get('/analytics/financial', (req, res) => {
    const vehicles = db.vehicles.findAll();
    const fuel = db.fuel.findAll();
    const maintenance = db.maintenance.findAll();
    
    // Calculate totals
    const totalFuelCost = fuel.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const avgCostPerVehicle = totalOperationalCost / vehicles.length;
    
    // Per vehicle analytics
    const vehicleAnalytics = vehicles.map(v => {
        const vehicleFuel = fuel.filter(f => f.vehicleId === v.id);
        const vehicleMaintenance = maintenance.filter(m => m.vehicleId === v.id);
        
        const fuelCost = vehicleFuel.reduce((sum, f) => sum + f.cost, 0);
        const maintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0);
        const totalCost = fuelCost + maintenanceCost;
        
        const totalLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
        const fuelEfficiency = totalLiters > 0 ? (v.odometer / totalLiters).toFixed(2) : 0;
        
        const roi = v.acqCost > 0 ? (((v.revenue - totalCost) / v.acqCost) * 100).toFixed(2) : 0;
        
        return {
            vehicleId: v.id,
            vehicleName: v.name,
            fuelCost,
            maintenanceCost,
            totalCost,
            revenue: v.revenue,
            roi: parseFloat(roi),
            fuelEfficiency: parseFloat(fuelEfficiency),
            acquisitionCost: v.acqCost
        };
    });
    
    res.json({
        summary: {
            totalFuelCost,
            totalMaintenanceCost,
            totalOperationalCost,
            avgCostPerVehicle: Math.round(avgCostPerVehicle),
            totalRevenue: vehicles.reduce((sum, v) => sum + v.revenue, 0)
        },
        vehicleAnalytics
    });
});

// ─── ACTIVITIES ─────────────────────────────────────────────────────────────
router.get('/activities', (req, res) => res.json(db.activities.findAll()));

// ─── INCIDENTS ──────────────────────────────────────────────────────────────
router.get('/incidents', (req, res) => {
    const { driverId } = req.query;
    if (driverId) {
        return res.json(db.incidents.findByDriver(driverId));
    }
    res.json(db.incidents.findAll());
});
router.post('/incidents', (req, res) => {
    const inc = db.incidents.create(req.body);
    
    // Update driver's incident count and safety score
    const driver = db.drivers.findById(inc.driverId);
    if (driver) {
        const newScore = Math.max(0, driver.safetyScore - 5); // Reduce score by 5 per incident
        db.drivers.updateSafetyScore(inc.driverId, newScore, true);
    }
    
    db.activities.create(`New incident reported for driver ${driver?.name || inc.driverId}`, 'safety');
    res.status(201).json(inc);
});
router.put('/incidents/:id', (req, res) => {
    const inc = db.incidents.update(req.params.id, req.body);
    if (!inc) return res.status(404).json({ message: 'Incident not found' });
    
    if (req.body.resolved) {
        db.activities.create(`Incident ${inc.id} marked as resolved`, 'safety');
    }
    
    res.json(inc);
});

module.exports = router;
