const mongoose = require('mongoose');

const lendingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: true,
    },
    type: {
        type: String,
        enum: ['Lent', 'Borrowed', 'Repayment_Sent', 'Repayment_Received'],
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Partially Paid', 'Completed', 'Overdue'],
        default: 'Pending',
    },
    interest: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Lending', lendingSchema);
