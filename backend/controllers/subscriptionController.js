const Subscription = require('../models/Subscription');
const Expense = require('../models/Expense');

// @desc    Get subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Auto-process deductions
    const autoSubs = await Subscription.find({ 
      user: userId, 
      isActive: true, 
      autoDeduct: true,
      nextBillingDate: { $lte: now }
    });

    for (const sub of autoSubs) {
      // Check if it's within date range
      if (sub.endDate && now > sub.endDate) {
        sub.isActive = false;
        await sub.save();
        continue;
      }

      // Create expense
      await Expense.create({
        user: userId,
        title: `Auto: ${sub.title}`,
        amount: sub.amount,
        category: sub.category,
        date: sub.nextBillingDate,
        notes: `Automated payment for ${sub.title} subscription`
      });

      // Update next billing date
      let nextDate = new Date(sub.nextBillingDate);
      if (sub.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (sub.frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
      else if (sub.frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);

      sub.nextBillingDate = nextDate;
      sub.lastProcessedDate = now;
      
      // If next date is past end date, deactivate
      if (sub.endDate && nextDate > sub.endDate) {
        sub.isActive = false;
      }
      
      await sub.save();
    }

    const subscriptions = await Subscription.find({ user: userId }).sort({ nextBillingDate: 1 });
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add subscription
// @route   POST /api/subscriptions
// @access  Private
const addSubscription = async (req, res) => {
  const { title, amount, category, frequency, nextBillingDate, startDate, endDate, autoDeduct } = req.body;

  if (!title || !amount || !nextBillingDate) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  try {
    const subscription = await Subscription.create({
      title,
      amount,
      category,
      frequency,
      nextBillingDate: new Date(nextBillingDate),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      autoDeduct: !!autoDeduct,
      user: req.user.id,
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await subscription.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
};
