require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./connection');

// Import models
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Fuel = require('../models/Fuel');
const Activity = require('../models/Activity');
const Incident = require('../models/Incident');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Vehicle.deleteMany({}),
            Driver.deleteMany({}),
            Trip.deleteMany({}),
            Maintenance.deleteMany({}),
            Fuel.deleteMany({}),
            Activity.deleteMany({}),
            Incident.deleteMany({})
        ]);

        // Seed Users
        console.log('👥 Seeding users...');
        const users = await User.create([
            { name: 'Raj Mehta', email: 'manager@fleet.com', password: 'fleet123', role: 'Fleet Manager', roleKey: 'manager', avatar: 'RM', avatarColor: '#374151' },
            { name: 'Priya Sharma', email: 'dispatch@fleet.com', password: 'fleet123', role: 'Dispatcher', roleKey: 'dispatcher', avatar: 'PS', avatarColor: '#374151' },
            { name: 'Arjun Verma', email: 'safety@fleet.com', password: 'fleet123', role: 'Safety Officer', roleKey: 'safety', avatar: 'AV', avatarColor: '#374151' },
            { name: 'Sneha Patel', email: 'finance@fleet.com', password: 'fleet123', role: 'Financial Analyst', roleKey: 'finance', avatar: 'SP', avatarColor: '#374151' }
        ]);
        console.log(`✅ Created ${users.length} users`);

        // Seed Vehicles
        console.log('🚛 Seeding vehicles...');
        const vehicles = await Vehicle.create([
            { vehicleId: 'V1', name: 'Tata Prima 4028.S', plate: 'MH-01-AB-1234', type: 'Truck', capacity: 25000, status: 'Available', odometer: 125400, region: 'Mumbai', acqCost: 4500000, revenue: 850000 },
            { vehicleId: 'V2', name: 'Ashok Leyland 3118', plate: 'MH-02-CD-5678', type: 'Truck', capacity: 18000, status: 'On Trip', odometer: 82100, region: 'Pune', acqCost: 5200000, revenue: 1200000 },
            { vehicleId: 'V3', name: 'Force Traveller 3350', plate: 'MH-03-EF-9012', type: 'Van', capacity: 2000, status: 'Available', odometer: 45600, region: 'Mumbai', acqCost: 4800000, revenue: 950000 },
            { vehicleId: 'V4', name: 'Mahindra Bolero Pik-Up', plate: 'MH-04-GH-3456', type: 'Van', capacity: 1500, status: 'In Shop', odometer: 95200, region: 'Nagpur', acqCost: 3800000, revenue: 600000 },
            { vehicleId: 'V5', name: 'BharatBenz 2523R', plate: 'MH-07-MN-6789', type: 'Truck', capacity: 23000, status: 'Out of Service', odometer: 15400, region: 'Pune', acqCost: 800000, revenue: 250000 }
        ]);
        console.log(`✅ Created ${vehicles.length} vehicles`);

        // Seed Drivers
        console.log('👤 Seeding drivers...');
        const drivers = await Driver.create([
            { 
                driverId: 'D1', 
                name: 'Ramesh Kumar', 
                licenseNumber: 'DL-01-2019-0012345',
                licenseCategory: 'Heavy Vehicle',
                licenseExpiry: new Date('2027-08-15'), 
                status: 'On Duty',
                safetyScore: 92,
                tripCompletionRate: 98,
                totalTrips: 156,
                completedTrips: 153,
                incidents: 1,
                lastIncidentDate: new Date('2025-11-10'),
                phone: '+91 98765 43210',
                joinDate: new Date('2019-03-15')
            },
            { 
                driverId: 'D2', 
                name: 'Suresh Yadav', 
                licenseNumber: 'DL-02-2018-0098765',
                licenseCategory: 'Light Vehicle',
                licenseExpiry: new Date('2024-03-10'),
                status: 'Off Duty',
                safetyScore: 45,
                tripCompletionRate: 76,
                totalTrips: 89,
                completedTrips: 68,
                incidents: 8,
                lastIncidentDate: new Date('2026-01-20'),
                phone: '+91 98765 43211',
                joinDate: new Date('2018-07-22')
            },
            { 
                driverId: 'D3', 
                name: 'Ajay Singh', 
                licenseNumber: 'DL-03-2020-0054321',
                licenseCategory: 'Heavy Vehicle',
                licenseExpiry: new Date('2028-06-22'), 
                status: 'Suspended',
                safetyScore: 38,
                tripCompletionRate: 65,
                totalTrips: 45,
                completedTrips: 29,
                incidents: 12,
                lastIncidentDate: new Date('2026-02-15'),
                phone: '+91 98765 43212',
                joinDate: new Date('2020-01-10')
            },
            { 
                driverId: 'D4', 
                name: 'Mohan Das', 
                licenseNumber: 'DL-04-2021-0011111',
                licenseCategory: 'Heavy Vehicle',
                licenseExpiry: new Date('2026-09-30'), 
                status: 'On Duty',
                safetyScore: 88,
                tripCompletionRate: 94,
                totalTrips: 112,
                completedTrips: 105,
                incidents: 2,
                lastIncidentDate: new Date('2025-08-05'),
                phone: '+91 98765 43213',
                joinDate: new Date('2021-05-18')
            },
            { 
                driverId: 'D5', 
                name: 'Vikram Patel', 
                licenseNumber: 'DL-05-2022-0022222',
                licenseCategory: 'Light Vehicle',
                licenseExpiry: new Date('2026-03-25'),
                status: 'On Duty',
                safetyScore: 75,
                tripCompletionRate: 89,
                totalTrips: 67,
                completedTrips: 60,
                incidents: 3,
                lastIncidentDate: new Date('2025-12-12'),
                phone: '+91 98765 43214',
                joinDate: new Date('2022-02-20')
            }
        ]);
        console.log(`✅ Created ${drivers.length} drivers`);

        // Seed Trips
        console.log('🗺️  Seeding trips...');
        const trips = await Trip.create([
            { tripId: 'TR-001', vehicleId: 'V2', driverId: 'D1', cargoWeight: 14000, pickup: 'Mumbai', delivery: 'Pune', status: 'Dispatched', date: new Date('2026-02-20') },
            { tripId: 'TR-002', vehicleId: 'V3', driverId: 'D4', cargoWeight: 1500, pickup: 'Pune', delivery: 'Kolhapur', status: 'Completed', date: new Date('2026-02-18') }
        ]);
        console.log(`✅ Created ${trips.length} trips`);

        // Seed Maintenance
        console.log('🔧 Seeding maintenance logs...');
        const maintenance = await Maintenance.create([
            { maintenanceId: 'M1', vehicleId: 'V4', serviceType: 'Engine Overhaul', cost: 45000, date: new Date('2026-02-10'), notes: 'Complete engine rebuild', odometerReading: 95200 },
            { maintenanceId: 'M2', vehicleId: 'V1', serviceType: 'Tire Replacement', cost: 28000, date: new Date('2026-01-15'), notes: 'All 6 tires replaced', odometerReading: 124800 },
            { maintenanceId: 'M3', vehicleId: 'V2', serviceType: 'Brake Service', cost: 15000, date: new Date('2026-01-20'), notes: 'Brake pads and rotors', odometerReading: 81500 },
            { maintenanceId: 'M4', vehicleId: 'V3', serviceType: 'Oil Change', cost: 3500, date: new Date('2026-02-05'), notes: 'Regular maintenance', odometerReading: 45400 },
            { maintenanceId: 'M5', vehicleId: 'V5', serviceType: 'Transmission Repair', cost: 65000, date: new Date('2025-12-20'), notes: 'Major transmission work', odometerReading: 15200 },
            { maintenanceId: 'M6', vehicleId: 'V1', serviceType: 'AC Repair', cost: 12000, date: new Date('2025-11-10'), notes: 'AC compressor replacement', odometerReading: 123500 },
            { maintenanceId: 'M7', vehicleId: 'V2', serviceType: 'Suspension Work', cost: 22000, date: new Date('2025-12-05'), notes: 'Shock absorbers replaced', odometerReading: 80200 }
        ]);
        console.log(`✅ Created ${maintenance.length} maintenance logs`);

        // Seed Fuel
        console.log('⛽ Seeding fuel logs...');
        const fuel = await Fuel.create([
            { fuelId: 'F1', vehicleId: 'V1', liters: 150, cost: 15750, date: new Date('2026-02-18'), odometerReading: 125400, costPerLiter: 105 },
            { fuelId: 'F2', vehicleId: 'V2', liters: 120, cost: 12600, date: new Date('2026-02-17'), odometerReading: 82100, costPerLiter: 105 },
            { fuelId: 'F3', vehicleId: 'V3', liters: 45, cost: 4725, date: new Date('2026-02-16'), odometerReading: 45600, costPerLiter: 105 },
            { fuelId: 'F4', vehicleId: 'V1', liters: 145, cost: 15225, date: new Date('2026-02-10'), odometerReading: 124800, costPerLiter: 105 },
            { fuelId: 'F5', vehicleId: 'V4', liters: 50, cost: 5250, date: new Date('2026-02-15'), odometerReading: 95200, costPerLiter: 105 },
            { fuelId: 'F6', vehicleId: 'V2', liters: 125, cost: 13125, date: new Date('2026-02-08'), odometerReading: 81500, costPerLiter: 105 },
            { fuelId: 'F7', vehicleId: 'V3', liters: 48, cost: 5040, date: new Date('2026-02-05'), odometerReading: 45400, costPerLiter: 105 },
            { fuelId: 'F8', vehicleId: 'V1', liters: 140, cost: 14700, date: new Date('2026-01-25'), odometerReading: 124200, costPerLiter: 105 },
            { fuelId: 'F9', vehicleId: 'V2', liters: 130, cost: 13650, date: new Date('2026-01-20'), odometerReading: 80800, costPerLiter: 105 },
            { fuelId: 'F10', vehicleId: 'V5', liters: 100, cost: 10500, date: new Date('2025-12-15'), odometerReading: 15200, costPerLiter: 105 }
        ]);
        console.log(`✅ Created ${fuel.length} fuel logs`);

        // Seed Activities
        console.log('📋 Seeding activities...');
        const activities = await Activity.create([
            { activityId: 'A1', time: '12:34 PM', msg: 'TR-001 dispatched — Ashok Leyland assigned to Ramesh Kumar', type: 'dispatch' }
        ]);
        console.log(`✅ Created ${activities.length} activities`);

        // Seed Incidents
        console.log('⚠️  Seeding incidents...');
        const incidents = await Incident.create([
            { incidentId: 'INC-001', driverId: 'D2', date: new Date('2026-01-20'), type: 'Minor Collision', severity: 'Medium', description: 'Rear-end collision at traffic signal', resolved: true },
            { incidentId: 'INC-002', driverId: 'D3', date: new Date('2026-02-15'), type: 'Traffic Violation', severity: 'High', description: 'Overspeeding - 95 km/h in 60 km/h zone', resolved: false },
            { incidentId: 'INC-003', driverId: 'D5', date: new Date('2025-12-12'), type: 'Equipment Damage', severity: 'Low', description: 'Damaged side mirror while parking', resolved: true }
        ]);
        console.log(`✅ Created ${incidents.length} incidents`);

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
