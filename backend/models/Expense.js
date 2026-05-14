const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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
    category: {
        type: String,
        enum: ['Food', 'Travel', 'Fuel', 'Shopping', 'Bills', 'EMI', 'Rent', 'Miscellaneous'],
        default: 'Miscellaneous',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Net Banking'],
        default: 'Cash',
    },
    notes: {
        type: String,
    },
    attachments: [String], // URLs to images
    isRecurring: {
        type: Boolean,
        default: false,
    },
    recurringInterval: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
