const Expense = require('../models/Expense');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Expense.countDocuments({ user: req.user.id });
    const expenses = await Expense.find({ user: req.user.id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        expenses,
        page,
        totalPages: Math.ceil(total / limit),
        total
    });
};

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
const setExpense = async (req, res) => {
    const { title, amount, category, date, paymentMethod, notes, isRecurring, recurringInterval } = req.body;

    if (!title || !amount) {
        res.status(400);
        throw new Error('Please add a title and amount');
    }

    const expense = await Expense.create({
        user: req.user.id,
        title,
        amount,
        category,
        date,
        paymentMethod,
        notes,
        isRecurring,
        recurringInterval,
    });

    res.status(201).json(expense);
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(400);
        throw new Error('Expense not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedExpense);
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(400);
        throw new Error('Expense not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getExpenses,
    setExpense,
    updateExpense,
    deleteExpense,
};
