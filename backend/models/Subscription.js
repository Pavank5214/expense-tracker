const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'Please add a text value'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    default: 'Bills',
  },
  frequency: {
    type: String,
    enum: ['Monthly', 'Yearly', 'Weekly'],
    default: 'Monthly',
  },
  nextBillingDate: {
    type: Date,
    required: [true, 'Please add a next billing date'],
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date, // For EMI termination
  },
  autoDeduct: {
    type: Boolean,
    default: false,
  },
  lastProcessedDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
