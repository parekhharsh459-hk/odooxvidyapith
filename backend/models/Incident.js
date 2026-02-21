const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    incidentId: {
        type: String,
        required: true,
        unique: true
    },
    driverId: {
        type: String,
        required: true,
        ref: 'Driver'
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true,
        enum: ['Minor Collision', 'Major Collision', 'Traffic Violation', 'Equipment Damage', 'Other']
    },
    severity: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical']
    },
    description: {
        type: String,
        required: true
    },
    resolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Incident', incidentSchema);
