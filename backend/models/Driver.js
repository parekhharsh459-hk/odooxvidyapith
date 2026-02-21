const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driverId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    licenseCategory: {
        type: String,
        required: true,
        enum: ['Light Vehicle', 'Heavy Vehicle', 'Hazmat']
    },
    licenseExpiry: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['On Duty', 'Off Duty', 'Suspended'],
        default: 'Off Duty'
    },
    safetyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    tripCompletionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    completedTrips: {
        type: Number,
        default: 0
    },
    incidents: {
        type: Number,
        default: 0
    },
    lastIncidentDate: {
        type: Date
    },
    phone: {
        type: String,
        required: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
