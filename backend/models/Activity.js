const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    activityId: {
        type: String,
        required: true,
        unique: true
    },
    time: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['dispatch', 'maintenance', 'fuel', 'driver', 'vehicle', 'incident', 'info']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
