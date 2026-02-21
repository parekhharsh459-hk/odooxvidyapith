require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const fleetRoutes = require('./routes/fleet');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api', fleetRoutes); // Drivers, trips, maintenance, fuel are hung under /api/

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 FleetFlow API running on port ${PORT}`);
});
