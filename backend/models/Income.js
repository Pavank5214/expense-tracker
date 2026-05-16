const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
    },
    totalProjectAmount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Received', 'Pending'],
        default: 'Received',
    },
    source: {
        type: String,
        enum: ['Salary', 'Freelance', 'Business', 'Investments', 'Other'],
        default: 'Other',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
    },
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
    },
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
