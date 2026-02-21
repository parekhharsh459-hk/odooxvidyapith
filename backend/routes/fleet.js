const express = require('express');
const router = express.Router();
const db = require('../db/store');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ─── DRIVERS ────────────────────────────────────────────────────────────────
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await db.drivers.findAll();
        res.json(drivers);
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ message: 'Server error fetching drivers' });
    }
});

router.get('/drivers/:id', async (req, res) => {
    try {
        const d = await db.drivers.findById(req.params.id);
        if (!d) return res.status(404).json({ message: 'Driver not found' });
        res.json(d);
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({ message: 'Server error fetching driver' });
    }
});

router.put('/drivers/:id', async (req, res) => {
    try {
        const d = await db.drivers.update(req.params.id, req.body);
        if (!d) return res.status(404).json({ message: 'Driver not found' });
        
        // Log activity for status changes
        if (req.body.status) {
            await db.activities.create(`Driver ${d.name} status changed to ${req.body.status}`, 'driver');
        }
        
        res.json(d);
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({ message: 'Server error updating driver' });
    }
});

router.put('/drivers/:id/safety-score', async (req, res) => {
    try {
        const { score, incident } = req.body;
        const d = await db.drivers.updateSafetyScore(req.params.id, score, incident);
        if (!d) return res.status(404).json({ message: 'Driver not found' });
        
        await db.activities.create(`Driver ${d.name} safety score updated to ${score}`, 'safety');
        res.json(d);
    } catch (error) {
        console.error('Update safety score error:', error);
        res.status(500).json({ message: 'Server error updating safety score' });
    }
});

// ─── TRIPS ──────────────────────────────────────────────────────────────────
router.get('/trips', async (req, res) => {
    try {
        const trips = await db.trips.findAll();
        res.json(trips);
    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({ message: 'Server error fetching trips' });
    }
});

router.post('/trips', async (req, res) => {
    try {
        // New trips are always created as "Draft"
        const tripData = { ...req.body, status: 'Draft', date: new Date().toISOString().split('T')[0] };
        const t = await db.trips.create(tripData);
        await db.activities.create(`New Trip Draft ${t.id} created`, 'dispatch');
        res.status(201).json(t);
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ message: 'Server error creating trip' });
    }
});

router.put('/trips/:id', async (req, res) => {
    try {
        const trips = await db.trips.findAll();
        const existingTrip = trips.find(t => t.id === req.params.id);
        if (!existingTrip) return res.status(404).json({ message: 'Trip not found' });

        const newStatus = req.body.status;
        const oldStatus = existingTrip.status;
        const t = await db.trips.update(req.params.id, req.body);

        // Update vehicle status based on trip status
        if (newStatus && newStatus !== oldStatus) {
            if (newStatus === 'Dispatched') {
                await db.vehicles.update(t.vehicleId, { status: 'On Trip' });
                await db.activities.create(`${t.id} dispatched — Vehicle ${t.vehicleId} assigned`, 'dispatch');
            } else if (newStatus === 'Completed') {
                await db.vehicles.update(t.vehicleId, { status: 'Available' });
                await db.activities.create(`${t.id} completed — Vehicle ${t.vehicleId} now available`, 'dispatch');
            } else if (newStatus === 'Cancelled') {
                await db.vehicles.update(t.vehicleId, { status: 'Available' });
                await db.activities.create(`${t.id} cancelled — Vehicle ${t.vehicleId} now available`, 'dispatch');
            }
        }

        res.json(t);
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({ message: 'Server error updating trip' });
    }
});

// ─── MAINTENANCE ────────────────────────────────────────────────────────────
router.get('/maintenance', async (req, res) => {
    try {
        const { vehicleId } = req.query;
        if (vehicleId) {
            return res.json(await db.maintenance.findByVehicle(vehicleId));
        }
        res.json(await db.maintenance.findAll());
    } catch (error) {
        console.error('Get maintenance error:', error);
        res.status(500).json({ message: 'Server error fetching maintenance' });
    }
});

router.post('/maintenance', async (req, res) => {
    try {
        const m = await db.maintenance.create(req.body);
        await db.activities.create(`Vehicle sent for ${m.serviceType}`, 'maintenance');
        res.status(201).json(m);
    } catch (error) {
        console.error('Create maintenance error:', error);
        res.status(500).json({ message: 'Server error creating maintenance' });
    }
});

router.put('/maintenance/:id', async (req, res) => {
    try {
        const m = await db.maintenance.update(req.params.id, req.body);
        if (!m) return res.status(404).json({ message: 'Maintenance record not found' });
        res.json(m);
    } catch (error) {
        console.error('Update maintenance error:', error);
        res.status(500).json({ message: 'Server error updating maintenance' });
    }
});

// ─── FUEL ───────────────────────────────────────────────────────────────────
router.get('/fuel', async (req, res) => {
    try {
        const { vehicleId } = req.query;
        if (vehicleId) {
            return res.json(await db.fuel.findByVehicle(vehicleId));
        }
        res.json(await db.fuel.findAll());
    } catch (error) {
        console.error('Get fuel error:', error);
        res.status(500).json({ message: 'Server error fetching fuel' });
    }
});

router.post('/fuel', async (req, res) => {
    try {
        const f = await db.fuel.create(req.body);
        await db.activities.create(`Fuel entry added for vehicle ${req.body.vehicleId}`, 'fuel');
        res.status(201).json(f);
    } catch (error) {
        console.error('Create fuel error:', error);
        res.status(500).json({ message: 'Server error creating fuel' });
    }
});

router.put('/fuel/:id', async (req, res) => {
    try {
        const f = await db.fuel.update(req.params.id, req.body);
        if (!f) return res.status(404).json({ message: 'Fuel record not found' });
        res.json(f);
    } catch (error) {
        console.error('Update fuel error:', error);
        res.status(500).json({ message: 'Server error updating fuel' });
    }
});

// ─── FINANCIAL ANALYTICS ────────────────────────────────────────────────────
router.get('/analytics/financial', async (req, res) => {
    try {
        const vehicles = await db.vehicles.findAll();
        const fuel = await db.fuel.findAll();
        const maintenance = await db.maintenance.findAll();

        // Calculate per-vehicle analytics
        const vehicleAnalytics = vehicles.map(v => {
            const vehicleFuel = fuel.filter(f => f.vehicleId === v.id);
            const vehicleMaintenance = maintenance.filter(m => m.vehicleId === v.id);

            const fuelCost = vehicleFuel.reduce((sum, f) => sum + f.cost, 0);
            const maintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0);
            const totalCost = fuelCost + maintenanceCost;

            // Calculate fuel efficiency (km per liter)
            const totalLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
            const fuelEfficiency = totalLiters > 0 ? (v.odometer / totalLiters).toFixed(2) : 0;

            // Calculate ROI
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
                totalLiters
            };
        });

        // Calculate summary
        const totalFuelCost = fuel.reduce((sum, f) => sum + f.cost, 0);
        const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
        const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
        const totalRevenue = vehicles.reduce((sum, v) => sum + v.revenue, 0);
        const avgCostPerVehicle = vehicles.length > 0 ? totalOperationalCost / vehicles.length : 0;

        res.json({
            summary: {
                totalFuelCost,
                totalMaintenanceCost,
                totalOperationalCost,
                totalRevenue,
                avgCostPerVehicle,
                netProfit: totalRevenue - totalOperationalCost
            },
            vehicleAnalytics
        });
    } catch (error) {
        console.error('Get financial analytics error:', error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
});

// ─── ACTIVITIES ─────────────────────────────────────────────────────────────
router.get('/activities', async (req, res) => {
    try {
        const activities = await db.activities.findAll();
        res.json(activities);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ message: 'Server error fetching activities' });
    }
});

// ─── INCIDENTS ──────────────────────────────────────────────────────────────
router.get('/incidents', async (req, res) => {
    try {
        const { driverId } = req.query;
        if (driverId) {
            return res.json(await db.incidents.findByDriver(driverId));
        }
        res.json(await db.incidents.findAll());
    } catch (error) {
        console.error('Get incidents error:', error);
        res.status(500).json({ message: 'Server error fetching incidents' });
    }
});

router.post('/incidents', async (req, res) => {
    try {
        const inc = await db.incidents.create(req.body);
        
        // Update driver's incident count and safety score
        const driver = await db.drivers.findById(req.body.driverId);
        if (driver) {
            await db.activities.create(`Incident reported for driver ${driver.name}`, 'incident');
        }
        
        res.status(201).json(inc);
    } catch (error) {
        console.error('Create incident error:', error);
        res.status(500).json({ message: 'Server error creating incident' });
    }
});

router.put('/incidents/:id', async (req, res) => {
    try {
        const inc = await db.incidents.update(req.params.id, req.body);
        if (!inc) return res.status(404).json({ message: 'Incident not found' });
        res.json(inc);
    } catch (error) {
        console.error('Update incident error:', error);
        res.status(500).json({ message: 'Server error updating incident' });
    }
});

module.exports = router;
