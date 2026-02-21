const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    maintenanceId: {
        type: String,
        required: true,
        unique: true
    },
    vehicleId: {
        type: String,
        required: true,
        ref: 'Vehicle'
    },
    serviceType: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    },
    odometerReading: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
