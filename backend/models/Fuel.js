const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
    fuelId: {
        type: String,
        required: true,
        unique: true
    },
    vehicleId: {
        type: String,
        required: true,
        ref: 'Vehicle'
    },
    liters: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    costPerLiter: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    odometerReading: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Fuel', fuelSchema);
