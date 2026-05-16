const Income = require('../models/Income');

// @desc    Get incomes
// @route   GET /api/income
// @access  Private
const getIncomes = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Income.countDocuments({ user: req.user.id });
    const incomes = await Income.find({ user: req.user.id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        incomes,
        page,
        totalPages: Math.ceil(total / limit),
        total
    });
};

// @desc    Set income
// @route   POST /api/income
// @access  Private
const setIncome = async (req, res) => {
    const { title, amount, source, date, notes, totalProjectAmount, status } = req.body;

    if (!title || amount === undefined) {
        res.status(400);
        throw new Error('Please add a title and amount');
    }

    const income = await Income.create({
        user: req.user.id,
        title,
        amount,
        totalProjectAmount,
        status,
        source,
        date,
        notes,
    });

    res.status(201).json(income);
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res) => {
    const income = await Income.findById(req.params.id);

    if (!income) {
        res.status(400);
        throw new Error('Income not found');
    }

    if (income.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedIncome = await Income.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after',
    });

    res.status(200).json(updatedIncome);
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res) => {
    const income = await Income.findById(req.params.id);

    if (!income) {
        res.status(400);
        throw new Error('Income not found');
    }

    if (income.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await income.deleteOne();

    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getIncomes,
    setIncome,
    updateIncome,
    deleteIncome,
};
