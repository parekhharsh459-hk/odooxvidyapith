const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ─── In-Memory Store ─────────────────────────────────────────────────────────

// Seed Data
const vehicles = [
    { id: 'V1', name: 'Tata Prima 4028.S', plate: 'MH-01-AB-1234', type: 'Truck', capacity: 25000, status: 'Available', odometer: 125400, region: 'Mumbai', acqCost: 4500000, revenue: 850000 },
    { id: 'V2', name: 'Ashok Leyland 3118', plate: 'MH-02-CD-5678', type: 'Truck', capacity: 18000, status: 'On Trip', odometer: 82100, region: 'Pune', acqCost: 5200000, revenue: 1200000 },
    { id: 'V3', name: 'Force Traveller 3350', plate: 'MH-03-EF-9012', type: 'Van', capacity: 2000, status: 'Available', odometer: 45600, region: 'Mumbai', acqCost: 4800000, revenue: 950000 },
    { id: 'V4', name: 'Mahindra Bolero Pik-Up', plate: 'MH-04-GH-3456', type: 'Van', capacity: 1500, status: 'In Shop', odometer: 95200, region: 'Nagpur', acqCost: 3800000, revenue: 600000 },
    { id: 'V5', name: 'BharatBenz 2523R', plate: 'MH-07-MN-6789', type: 'Truck', capacity: 23000, status: 'Out of Service', odometer: 15400, region: 'Pune', acqCost: 800000, revenue: 250000 },
];

const drivers = [
    { 
        id: 'D1', 
        name: 'Ramesh Kumar', 
        licenseNumber: 'DL-01-2019-0012345',
        licenseCategory: 'Heavy Vehicle',
        licenseExpiry: '2027-08-15', 
        status: 'On Duty',
        safetyScore: 92,
        tripCompletionRate: 98,
        totalTrips: 156,
        completedTrips: 153,
        incidents: 1,
        lastIncidentDate: '2025-11-10',
        phone: '+91 98765 43210',
        joinDate: '2019-03-15'
    },
    { 
        id: 'D2', 
        name: 'Suresh Yadav', 
        licenseNumber: 'DL-02-2018-0098765',
        licenseCategory: 'Light Vehicle',
        licenseExpiry: '2024-03-10', // Expired
        status: 'Off Duty',
        safetyScore: 45,
        tripCompletionRate: 76,
        totalTrips: 89,
        completedTrips: 68,
        incidents: 8,
        lastIncidentDate: '2026-01-20',
        phone: '+91 98765 43211',
        joinDate: '2018-07-22'
    },
    { 
        id: 'D3', 
        name: 'Ajay Singh', 
        licenseNumber: 'DL-03-2020-0054321',
        licenseCategory: 'Heavy Vehicle',
        licenseExpiry: '2028-06-22', 
        status: 'Suspended',
        safetyScore: 38,
        tripCompletionRate: 65,
        totalTrips: 45,
        completedTrips: 29,
        incidents: 12,
        lastIncidentDate: '2026-02-15',
        phone: '+91 98765 43212',
        joinDate: '2020-01-10'
    },
    { 
        id: 'D4', 
        name: 'Mohan Das', 
        licenseNumber: 'DL-04-2021-0011111',
        licenseCategory: 'Heavy Vehicle',
        licenseExpiry: '2026-09-30', 
        status: 'On Duty',
        safetyScore: 88,
        tripCompletionRate: 94,
        totalTrips: 112,
        completedTrips: 105,
        incidents: 2,
        lastIncidentDate: '2025-08-05',
        phone: '+91 98765 43213',
        joinDate: '2021-05-18'
    },
    { 
        id: 'D5', 
        name: 'Vikram Patel', 
        licenseNumber: 'DL-05-2022-0022222',
        licenseCategory: 'Light Vehicle',
        licenseExpiry: '2026-03-25', // Expiring soon (within 30 days)
        status: 'On Duty',
        safetyScore: 75,
        tripCompletionRate: 89,
        totalTrips: 67,
        completedTrips: 60,
        incidents: 3,
        lastIncidentDate: '2025-12-12',
        phone: '+91 98765 43214',
        joinDate: '2022-02-20'
    }
];

const users = [
    { id: 1, name: 'Raj Mehta', email: 'manager@fleet.com', password: bcrypt.hashSync('fleet123', 10), role: 'Fleet Manager', roleKey: 'manager', avatar: 'RM', avatarColor: '#374151' },
    { id: 2, name: 'Priya Sharma', email: 'dispatch@fleet.com', password: bcrypt.hashSync('fleet123', 10), role: 'Dispatcher', roleKey: 'dispatcher', avatar: 'PS', avatarColor: '#374151' },
    { id: 3, name: 'Arjun Verma', email: 'safety@fleet.com', password: bcrypt.hashSync('fleet123', 10), role: 'Safety Officer', roleKey: 'safety', avatar: 'AV', avatarColor: '#374151' },
    { id: 4, name: 'Sneha Patel', email: 'finance@fleet.com', password: bcrypt.hashSync('fleet123', 10), role: 'Financial Analyst', roleKey: 'finance', avatar: 'SP', avatarColor: '#374151' },
];

const trips = [
    { id: 'TR-001', vehicleId: 'V2', driverId: 'D1', cargoWeight: 14000, pickup: 'Mumbai', delivery: 'Pune', status: 'Dispatched', date: '2026-02-20' },
    { id: 'TR-002', vehicleId: 'V3', driverId: 'D4', cargoWeight: 1500, pickup: 'Pune', delivery: 'Kolhapur', status: 'Completed', date: '2026-02-18' },
];

const maintenance = [
    { id: 'M1', vehicleId: 'V4', serviceType: 'Engine Overhaul', cost: 45000, date: '2026-02-10', notes: 'Complete engine rebuild', odometerReading: 95200 },
    { id: 'M2', vehicleId: 'V1', serviceType: 'Tire Replacement', cost: 28000, date: '2026-01-15', notes: 'All 6 tires replaced', odometerReading: 124800 },
    { id: 'M3', vehicleId: 'V2', serviceType: 'Brake Service', cost: 15000, date: '2026-01-20', notes: 'Brake pads and rotors', odometerReading: 81500 },
    { id: 'M4', vehicleId: 'V3', serviceType: 'Oil Change', cost: 3500, date: '2026-02-05', notes: 'Regular maintenance', odometerReading: 45400 },
    { id: 'M5', vehicleId: 'V5', serviceType: 'Transmission Repair', cost: 65000, date: '2025-12-20', notes: 'Major transmission work', odometerReading: 15200 },
    { id: 'M6', vehicleId: 'V1', serviceType: 'AC Repair', cost: 12000, date: '2025-11-10', notes: 'AC compressor replacement', odometerReading: 123500 },
    { id: 'M7', vehicleId: 'V2', serviceType: 'Suspension Work', cost: 22000, date: '2025-12-05', notes: 'Shock absorbers replaced', odometerReading: 80200 },
];

const fuel = [
    { id: 'F1', vehicleId: 'V1', liters: 150, cost: 15750, date: '2026-02-18', odometerReading: 125400, costPerLiter: 105 },
    { id: 'F2', vehicleId: 'V2', liters: 120, cost: 12600, date: '2026-02-17', odometerReading: 82100, costPerLiter: 105 },
    { id: 'F3', vehicleId: 'V3', liters: 45, cost: 4725, date: '2026-02-16', odometerReading: 45600, costPerLiter: 105 },
    { id: 'F4', vehicleId: 'V1', liters: 145, cost: 15225, date: '2026-02-10', odometerReading: 124800, costPerLiter: 105 },
    { id: 'F5', vehicleId: 'V4', liters: 50, cost: 5250, date: '2026-02-15', odometerReading: 95200, costPerLiter: 105 },
    { id: 'F6', vehicleId: 'V2', liters: 125, cost: 13125, date: '2026-02-08', odometerReading: 81500, costPerLiter: 105 },
    { id: 'F7', vehicleId: 'V3', liters: 48, cost: 5040, date: '2026-02-05', odometerReading: 45400, costPerLiter: 105 },
    { id: 'F8', vehicleId: 'V1', liters: 140, cost: 14700, date: '2026-01-25', odometerReading: 124200, costPerLiter: 105 },
    { id: 'F9', vehicleId: 'V2', liters: 130, cost: 13650, date: '2026-01-20', odometerReading: 80800, costPerLiter: 105 },
    { id: 'F10', vehicleId: 'V5', liters: 100, cost: 10500, date: '2025-12-15', odometerReading: 15200, costPerLiter: 105 },
];

const activities = [
    { id: 'A1', time: '12:34 PM', msg: 'TR-001 dispatched — Ashok Leyland assigned to Ramesh Kumar', type: 'dispatch' },
];

const incidents = [
    { id: 'INC-001', driverId: 'D2', date: '2026-01-20', type: 'Minor Collision', severity: 'Medium', description: 'Rear-end collision at traffic signal', resolved: true },
    { id: 'INC-002', driverId: 'D3', date: '2026-02-15', type: 'Traffic Violation', severity: 'High', description: 'Overspeeding - 95 km/h in 60 km/h zone', resolved: false },
    { id: 'INC-003', driverId: 'D5', date: '2025-12-12', type: 'Equipment Damage', severity: 'Low', description: 'Damaged side mirror while parking', resolved: true },
];

const store = {
    users,
    vehicles,
    drivers,
    trips,
    maintenance,
    fuel,
    activities,
    incidents
};

// Simulation of DB operations
const db = {
    users: {
        findAll: () => store.users,
        findByEmail: (email) => store.users.find(u => u.email === email),
        findById: (id) => store.users.find(u => u.id === id),
        create: (data) => {
            const newUser = { id: store.users.length + 1, ...data, password: bcrypt.hashSync(data.password, 10) };
            store.users.push(newUser);
            return newUser;
        },
        upsertGoogle: (profile, role, roleKey) => {
            let user = store.users.find(u => u.email === profile.email);
            if (!user) {
                user = {
                    id: `g_${profile.sub}`,
                    name: profile.name,
                    email: profile.email,
                    role: role || 'Fleet Manager',
                    roleKey: roleKey || 'manager',
                    avatar: profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                    avatarColor: '#374151',
                    googleId: profile.sub
                };
                store.users.push(user);
            }
            return user;
        }
    },
    vehicles: {
        findAll: () => store.vehicles,
        create: (data) => {
            const v = { id: `V${store.vehicles.length + 1}`, ...data };
            store.vehicles.push(v);
            return v;
        },
        update: (id, data) => {
            const idx = store.vehicles.findIndex(v => v.id === id);
            if (idx > -1) { store.vehicles[idx] = { ...store.vehicles[idx], ...data }; return store.vehicles[idx]; }
            return null;
        },
        delete: (id) => {
            const idx = store.vehicles.findIndex(v => v.id === id);
            if (idx > -1) return store.vehicles.splice(idx, 1)[0];
            return null;
        }
    },
    drivers: {
        findAll: () => store.drivers,
        findById: (id) => store.drivers.find(d => d.id === id),
        update: (id, data) => {
            const idx = store.drivers.findIndex(d => d.id === id);
            if (idx > -1) { 
                store.drivers[idx] = { ...store.drivers[idx], ...data }; 
                return store.drivers[idx]; 
            }
            return null;
        },
        updateSafetyScore: (id, score, incident) => {
            const idx = store.drivers.findIndex(d => d.id === id);
            if (idx > -1) {
                store.drivers[idx].safetyScore = score;
                store.drivers[idx].incidents = (store.drivers[idx].incidents || 0) + (incident ? 1 : 0);
                if (incident) {
                    store.drivers[idx].lastIncidentDate = new Date().toISOString().split('T')[0];
                }
                return store.drivers[idx];
            }
            return null;
        }
    },
    trips: {
        findAll: () => store.trips,
        create: (data) => {
            const t = { id: `TR-${String(store.trips.length + 1).padStart(3, '0')}`, ...data };
            store.trips.push(t);
            return t;
        },
        update: (id, data) => {
            const idx = store.trips.findIndex(t => t.id === id);
            if (idx > -1) { store.trips[idx] = { ...store.trips[idx], ...data }; return store.trips[idx]; }
            return null;
        }
    },
    maintenance: {
        findAll: () => store.maintenance,
        findByVehicle: (vehicleId) => store.maintenance.filter(m => m.vehicleId === vehicleId),
        create: (data) => {
            const m = { 
                id: `M${store.maintenance.length + 1}`, 
                date: new Date().toISOString().split('T')[0],
                ...data 
            };
            store.maintenance.push(m);
            return m;
        },
        update: (id, data) => {
            const idx = store.maintenance.findIndex(m => m.id === id);
            if (idx > -1) {
                store.maintenance[idx] = { ...store.maintenance[idx], ...data };
                return store.maintenance[idx];
            }
            return null;
        }
    },
    fuel: {
        findAll: () => store.fuel,
        findByVehicle: (vehicleId) => store.fuel.filter(f => f.vehicleId === vehicleId),
        create: (data) => {
            const costPerLiter = data.cost / data.liters;
            const f = { 
                id: `F${store.fuel.length + 1}`, 
                date: new Date().toISOString().split('T')[0],
                costPerLiter: Math.round(costPerLiter * 100) / 100,
                ...data 
            };
            store.fuel.push(f);
            return f;
        },
        update: (id, data) => {
            const idx = store.fuel.findIndex(f => f.id === id);
            if (idx > -1) {
                if (data.cost && data.liters) {
                    data.costPerLiter = Math.round((data.cost / data.liters) * 100) / 100;
                }
                store.fuel[idx] = { ...store.fuel[idx], ...data };
                return store.fuel[idx];
            }
            return null;
        }
    },
    activities: {
        findAll: () => store.activities,
        create: (msg, type) => {
            const a = { id: `A${store.activities.length + 1}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg, type };
            store.activities.unshift(a);
            return a;
        }
    },
    incidents: {
        findAll: () => store.incidents,
        findByDriver: (driverId) => store.incidents.filter(i => i.driverId === driverId),
        create: (data) => {
            const inc = { 
                id: `INC-${String(store.incidents.length + 1).padStart(3, '0')}`, 
                date: new Date().toISOString().split('T')[0],
                resolved: false,
                ...data 
            };
            store.incidents.push(inc);
            return inc;
        },
        update: (id, data) => {
            const idx = store.incidents.findIndex(i => i.id === id);
            if (idx > -1) {
                store.incidents[idx] = { ...store.incidents[idx], ...data };
                return store.incidents[idx];
            }
            return null;
        }
    }
};

module.exports = db;
