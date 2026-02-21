const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password not required for Google OAuth users
        }
    },
    role: {
        type: String,
        required: true,
        enum: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']
    },
    roleKey: {
        type: String,
        required: true,
        enum: ['manager', 'dispatcher', 'safety', 'finance']
    },
    avatar: {
        type: String,
        required: true
    },
    avatarColor: {
        type: String,
        default: '#374151'
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
