// MongoDB-based data access layer
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Fuel = require('../models/Fuel');
const Activity = require('../models/Activity');
const Incident = require('../models/Incident');

// Helper function to format date for display
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Helper function to generate next ID
const generateNextId = async (Model, prefix, field) => {
    const lastDoc = await Model.findOne().sort({ [field]: -1 });
    if (!lastDoc) return `${prefix}1`;
    
    const lastId = lastDoc[field];
    const numPart = parseInt(lastId.replace(prefix, ''));
    return `${prefix}${numPart + 1}`;
};

const db = {
    users: {
        findAll: async () => {
            const users = await User.find().select('-password').lean();
            return users;
        },
        findByEmail: async (email) => {
            return await User.findOne({ email }).lean();
        },
        findById: async (id) => {
            return await User.findById(id).select('-password').lean();
        },
        create: async (data) => {
            const user = new User(data);
            await user.save();
            const userObj = user.toObject();
            delete userObj.password;
            return userObj;
        },
        upsertGoogle: async (profile, role, roleKey) => {
            let user = await User.findOne({ email: profile.email });
            if (!user) {
                user = new User({
                    name: profile.name,
                    email: profile.email,
                    role: role || 'Fleet Manager',
                    roleKey: roleKey || 'manager',
                    avatar: profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                    avatarColor: '#374151',
                    googleId: profile.sub
                });
                await user.save();
            }
            const userObj = user.toObject();
            delete userObj.password;
            return userObj;
        }
    },
    vehicles: {
        findAll: async () => {
            const vehicles = await Vehicle.find().lean();
            return vehicles.map(v => ({
                id: v.vehicleId,
                name: v.name,
                plate: v.plate,
                type: v.type,
                capacity: v.capacity,
                status: v.status,
                odometer: v.odometer,
                region: v.region,
                acqCost: v.acqCost,
                revenue: v.revenue
            }));
        },
        create: async (data) => {
            const vehicleId = await generateNextId(Vehicle, 'V', 'vehicleId');
            const vehicle = new Vehicle({ vehicleId, ...data });
            await vehicle.save();
            return {
                id: vehicle.vehicleId,
                name: vehicle.name,
                plate: vehicle.plate,
                type: vehicle.type,
                capacity: vehicle.capacity,
                status: vehicle.status,
                odometer: vehicle.odometer,
                region: vehicle.region,
                acqCost: vehicle.acqCost,
                revenue: vehicle.revenue
            };
        },
        update: async (id, data) => {
            const vehicle = await Vehicle.findOneAndUpdate(
                { vehicleId: id },
                data,
                { new: true }
            ).lean();
            if (!vehicle) return null;
            return {
                id: vehicle.vehicleId,
                name: vehicle.name,
                plate: vehicle.plate,
                type: vehicle.type,
                capacity: vehicle.capacity,
                status: vehicle.status,
                odometer: vehicle.odometer,
                region: vehicle.region,
                acqCost: vehicle.acqCost,
                revenue: vehicle.revenue
            };
        },
        delete: async (id) => {
            const vehicle = await Vehicle.findOneAndDelete({ vehicleId: id }).lean();
            if (!vehicle) return null;
            return {
                id: vehicle.vehicleId,
                name: vehicle.name
            };
        }
    },
    drivers: {
        findAll: async () => {
            const drivers = await Driver.find().lean();
            return drivers.map(d => ({
                id: d.driverId,
                name: d.name,
                licenseNumber: d.licenseNumber,
                licenseCategory: d.licenseCategory,
                licenseExpiry: formatDate(d.licenseExpiry),
                status: d.status,
                safetyScore: d.safetyScore,
                tripCompletionRate: d.tripCompletionRate,
                totalTrips: d.totalTrips,
                completedTrips: d.completedTrips,
                incidents: d.incidents,
                lastIncidentDate: formatDate(d.lastIncidentDate),
                phone: d.phone,
                joinDate: formatDate(d.joinDate)
            }));
        },
        findById: async (id) => {
            const driver = await Driver.findOne({ driverId: id }).lean();
            if (!driver) return null;
            return {
                id: driver.driverId,
                name: driver.name,
                licenseNumber: driver.licenseNumber,
                licenseCategory: driver.licenseCategory,
                licenseExpiry: formatDate(driver.licenseExpiry),
                status: driver.status,
                safetyScore: driver.safetyScore,
                tripCompletionRate: driver.tripCompletionRate,
                totalTrips: driver.totalTrips,
                completedTrips: driver.completedTrips,
                incidents: driver.incidents,
                lastIncidentDate: formatDate(driver.lastIncidentDate),
                phone: driver.phone,
                joinDate: formatDate(driver.joinDate)
            };
        },
        update: async (id, data) => {
            const driver = await Driver.findOneAndUpdate(
                { driverId: id },
                data,
                { new: true }
            ).lean();
            if (!driver) return null;
            return {
                id: driver.driverId,
                name: driver.name,
                licenseNumber: driver.licenseNumber,
                licenseCategory: driver.licenseCategory,
                licenseExpiry: formatDate(driver.licenseExpiry),
                status: driver.status,
                safetyScore: driver.safetyScore,
                tripCompletionRate: driver.tripCompletionRate,
                totalTrips: driver.totalTrips,
                completedTrips: driver.completedTrips,
                incidents: driver.incidents,
                lastIncidentDate: formatDate(driver.lastIncidentDate),
                phone: driver.phone,
                joinDate: formatDate(driver.joinDate)
            };
        },
        updateSafetyScore: async (id, score, incident) => {
            const updateData = { safetyScore: score };
            if (incident) {
                updateData.$inc = { incidents: 1 };
                updateData.lastIncidentDate = new Date();
            }
            const driver = await Driver.findOneAndUpdate(
                { driverId: id },
                updateData,
                { new: true }
            ).lean();
            if (!driver) return null;
            return {
                id: driver.driverId,
                name: driver.name,
                safetyScore: driver.safetyScore,
                incidents: driver.incidents,
                lastIncidentDate: formatDate(driver.lastIncidentDate)
            };
        }
    },
    trips: {
        findAll: async () => {
            const trips = await Trip.find().lean();
            return trips.map(t => ({
                id: t.tripId,
                vehicleId: t.vehicleId,
                driverId: t.driverId,
                cargoWeight: t.cargoWeight,
                pickup: t.pickup,
                delivery: t.delivery,
                status: t.status,
                date: formatDate(t.date)
            }));
        },
        create: async (data) => {
            const tripId = await generateNextId(Trip, 'TR-', 'tripId');
            const formattedId = `TR-${String(tripId.replace('TR-', '')).padStart(3, '0')}`;
            const trip = new Trip({ tripId: formattedId, ...data });
            await trip.save();
            return {
                id: trip.tripId,
                vehicleId: trip.vehicleId,
                driverId: trip.driverId,
                cargoWeight: trip.cargoWeight,
                pickup: trip.pickup,
                delivery: trip.delivery,
                status: trip.status,
                date: formatDate(trip.date)
            };
        },
        update: async (id, data) => {
            const trip = await Trip.findOneAndUpdate(
                { tripId: id },
                data,
                { new: true }
            ).lean();
            if (!trip) return null;
            return {
                id: trip.tripId,
                vehicleId: trip.vehicleId,
                driverId: trip.driverId,
                cargoWeight: trip.cargoWeight,
                pickup: trip.pickup,
                delivery: trip.delivery,
                status: trip.status,
                date: formatDate(trip.date)
            };
        }
    },
    maintenance: {
        findAll: async () => {
            const maintenance = await Maintenance.find().lean();
            return maintenance.map(m => ({
                id: m.maintenanceId,
                vehicleId: m.vehicleId,
                serviceType: m.serviceType,
                cost: m.cost,
                date: formatDate(m.date),
                notes: m.notes,
                odometerReading: m.odometerReading
            }));
        },
        findByVehicle: async (vehicleId) => {
            const maintenance = await Maintenance.find({ vehicleId }).lean();
            return maintenance.map(m => ({
                id: m.maintenanceId,
                vehicleId: m.vehicleId,
                serviceType: m.serviceType,
                cost: m.cost,
                date: formatDate(m.date),
                notes: m.notes,
                odometerReading: m.odometerReading
            }));
        },
        create: async (data) => {
            const maintenanceId = await generateNextId(Maintenance, 'M', 'maintenanceId');
            const maintenance = new Maintenance({ 
                maintenanceId, 
                date: new Date(),
                ...data 
            });
            await maintenance.save();
            return {
                id: maintenance.maintenanceId,
                vehicleId: maintenance.vehicleId,
                serviceType: maintenance.serviceType,
                cost: maintenance.cost,
                date: formatDate(maintenance.date),
                notes: maintenance.notes,
                odometerReading: maintenance.odometerReading
            };
        },
        update: async (id, data) => {
            const maintenance = await Maintenance.findOneAndUpdate(
                { maintenanceId: id },
                data,
                { new: true }
            ).lean();
            if (!maintenance) return null;
            return {
                id: maintenance.maintenanceId,
                vehicleId: maintenance.vehicleId,
                serviceType: maintenance.serviceType,
                cost: maintenance.cost,
                date: formatDate(maintenance.date),
                notes: maintenance.notes,
                odometerReading: maintenance.odometerReading
            };
        }
    },
    fuel: {
        findAll: async () => {
            const fuel = await Fuel.find().lean();
            return fuel.map(f => ({
                id: f.fuelId,
                vehicleId: f.vehicleId,
                liters: f.liters,
                cost: f.cost,
                costPerLiter: f.costPerLiter,
                date: formatDate(f.date),
                odometerReading: f.odometerReading
            }));
        },
        findByVehicle: async (vehicleId) => {
            const fuel = await Fuel.find({ vehicleId }).lean();
            return fuel.map(f => ({
                id: f.fuelId,
                vehicleId: f.vehicleId,
                liters: f.liters,
                cost: f.cost,
                costPerLiter: f.costPerLiter,
                date: formatDate(f.date),
                odometerReading: f.odometerReading
            }));
        },
        create: async (data) => {
            const fuelId = await generateNextId(Fuel, 'F', 'fuelId');
            const costPerLiter = Math.round((data.cost / data.liters) * 100) / 100;
            const fuel = new Fuel({ 
                fuelId, 
                date: new Date(),
                costPerLiter,
                ...data 
            });
            await fuel.save();
            return {
                id: fuel.fuelId,
                vehicleId: fuel.vehicleId,
                liters: fuel.liters,
                cost: fuel.cost,
                costPerLiter: fuel.costPerLiter,
                date: formatDate(fuel.date),
                odometerReading: fuel.odometerReading
            };
        },
        update: async (id, data) => {
            if (data.cost && data.liters) {
                data.costPerLiter = Math.round((data.cost / data.liters) * 100) / 100;
            }
            const fuel = await Fuel.findOneAndUpdate(
                { fuelId: id },
                data,
                { new: true }
            ).lean();
            if (!fuel) return null;
            return {
                id: fuel.fuelId,
                vehicleId: fuel.vehicleId,
                liters: fuel.liters,
                cost: fuel.cost,
                costPerLiter: fuel.costPerLiter,
                date: formatDate(fuel.date),
                odometerReading: fuel.odometerReading
            };
        }
    },
    activities: {
        findAll: async () => {
            const activities = await Activity.find().sort({ createdAt: -1 }).lean();
            return activities.map(a => ({
                id: a.activityId,
                time: a.time,
                msg: a.msg,
                type: a.type
            }));
        },
        create: async (msg, type) => {
            const activityId = await generateNextId(Activity, 'A', 'activityId');
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const activity = new Activity({ activityId, time, msg, type });
            await activity.save();
            return {
                id: activity.activityId,
                time: activity.time,
                msg: activity.msg,
                type: activity.type
            };
        }
    },
    incidents: {
        findAll: async () => {
            const incidents = await Incident.find().lean();
            return incidents.map(i => ({
                id: i.incidentId,
                driverId: i.driverId,
                date: formatDate(i.date),
                type: i.type,
                severity: i.severity,
                description: i.description,
                resolved: i.resolved
            }));
        },
        findByDriver: async (driverId) => {
            const incidents = await Incident.find({ driverId }).lean();
            return incidents.map(i => ({
                id: i.incidentId,
                driverId: i.driverId,
                date: formatDate(i.date),
                type: i.type,
                severity: i.severity,
                description: i.description,
                resolved: i.resolved
            }));
        },
        create: async (data) => {
            const incidentId = await generateNextId(Incident, 'INC-', 'incidentId');
            const formattedId = `INC-${String(incidentId.replace('INC-', '')).padStart(3, '0')}`;
            const incident = new Incident({ 
                incidentId: formattedId, 
                date: new Date(),
                resolved: false,
                ...data 
            });
            await incident.save();
            return {
                id: incident.incidentId,
                driverId: incident.driverId,
                date: formatDate(incident.date),
                type: incident.type,
                severity: incident.severity,
                description: incident.description,
                resolved: incident.resolved
            };
        },
        update: async (id, data) => {
            const incident = await Incident.findOneAndUpdate(
                { incidentId: id },
                data,
                { new: true }
            ).lean();
            if (!incident) return null;
            return {
                id: incident.incidentId,
                driverId: incident.driverId,
                date: formatDate(incident.date),
                type: incident.type,
                severity: incident.severity,
                description: incident.description,
                resolved: incident.resolved
            };
        }
    }
};

module.exports = db;
