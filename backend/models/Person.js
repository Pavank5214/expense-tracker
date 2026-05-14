const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a person name'],
    },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    totalLent: {
        type: Number,
        default: 0,
    },
    totalBorrowed: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        default: 0, // Positive means they owe user, Negative means user owes them
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Person', personSchema);
