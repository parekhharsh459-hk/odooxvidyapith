const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    tripId: {
        type: String,
        required: true,
        unique: true
    },
    vehicleId: {
        type: String,
        required: true,
        ref: 'Vehicle'
    },
    driverId: {
        type: String,
        required: true,
        ref: 'Driver'
    },
    cargoWeight: {
        type: Number,
        required: true
    },
    pickup: {
        type: String,
        required: true
    },
    delivery: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
