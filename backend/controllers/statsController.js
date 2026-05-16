const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Lending = require('../models/Lending');
const Person = require('../models/Person');

// @desc    Get dashboard summary stats
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Robust ID handling: try both string and ObjectId
        const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
        const userMatch = { $or: [{ user: userId }, { user: userObjectId }] };
        const { range = 'week', startDate, endDate } = req.query;

        let start = new Date();
        start.setHours(0, 0, 0, 0);
        let end = new Date();
        end.setHours(23, 59, 59, 999);
        let granularity = 'day';

        if (range === 'week') {
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
        } else if (range === 'month') {
            start.setMonth(start.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
        } else if (range === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        }

        // Lifetime Totals
        const lifetimeIncomeResult = await Income.aggregate([
            { $match: userMatch },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const lifetimeIncome = lifetimeIncomeResult[0]?.total || 0;

        const lifetimeExpensesResult = await Expense.aggregate([
            { $match: userMatch },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const lifetimeExpenses = lifetimeExpensesResult[0]?.total || 0;

        // Period Totals
        const periodIncomeResult = await Income.aggregate([
            { $match: { ...userMatch, date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const periodIncome = periodIncomeResult[0]?.total || 0;

        const periodExpensesResult = await Expense.aggregate([
            { $match: { ...userMatch, date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const periodExpenses = periodExpensesResult[0]?.total || 0;

        const periodLendingResult = await Lending.aggregate([
            { $match: { ...userMatch, date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const periodLending = periodLendingResult[0]?.total || 0;

        // Lending stats
        const people = await Person.find({ user: userId });
        let totalReceivable = 0;
        let totalPayable = 0;
        people.forEach(p => {
            if (p.balance > 0) totalReceivable += p.balance;
            if (p.balance < 0) totalPayable += Math.abs(p.balance);
        });

        // Pending Income Stats (Outstanding freelance/business receivables)
        const pendingIncomeResult = await Income.aggregate([
            { 
                $match: { 
                    ...userMatch, 
                    $or: [
                        { status: 'Pending' },
                        { $and: [
                            { totalProjectAmount: { $gt: 0 } },
                            { $expr: { $gt: ['$totalProjectAmount', '$amount'] } }
                        ]}
                    ]
                } 
            },
            { $group: { _id: null, total: { $sum: { $subtract: ['$totalProjectAmount', '$amount'] } } } }
        ]);
        const pendingIncome = pendingIncomeResult[0]?.total || 0;

        // Combined Recent Transactions
        const recentExpenses = await Expense.find({ user: userId }).sort({ date: -1 }).limit(10);
        const recentIncomes = await Income.find({ user: userId }).sort({ date: -1 }).limit(10).populate('person');
        const recentLending = await Lending.find({ user: userId }).sort({ date: -1 }).limit(10).populate('person');
        
        const recentTransactionsRaw = [
            ...recentExpenses.map(e => ({...e._doc, type: 'expense'})), 
            ...recentIncomes.map(i => ({...i._doc, type: 'income', category: i.source})),
            ...recentLending.map(l => ({
                ...l._doc, 
                type: 'lending', 
                category: l.type, 
                title: `${l.type.replace('_', ' ')}: ${l.person?.name || 'Someone'}`
            }))
        ]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Deduplicate and limit
        const seenIds = new Set();
        const recentTransactions = recentTransactionsRaw.filter(tx => {
            if (seenIds.has(tx._id.toString())) return false;
            seenIds.add(tx._id.toString());
            return true;
        }).slice(0, 10);

        // Trend Grouping
        const groupTrend = async (Model, matchField = 'amount') => {
            return await Model.aggregate([
                { $match: { ...userMatch, date: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        total: { $sum: `$${matchField}` }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        };

        const expenseTrendRaw = await groupTrend(Expense);
        const incomeTrendRaw = await groupTrend(Income);
        const lendingTrendRaw = await groupTrend(Lending);

        // Helper to fill missing dates in trend
        const formatTrendData = (raw) => {
            const result = [];
            const curr = new Date(start);
            while (curr <= end) {
                const dateStr = curr.toISOString().split('T')[0];
                const match = raw.find(t => t._id === dateStr);
                result.push({
                    name: curr.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                    amount: match ? match.total : 0,
                    date: dateStr
                });
                curr.setDate(curr.getDate() + 1);
            }
            return result;
        };

        res.status(200).json({
            totalIncome: lifetimeIncome,
            totalExpenses: lifetimeExpenses,
            netBalance: lifetimeIncome - lifetimeExpenses + (totalReceivable - totalPayable),
            periodIncome,
            periodExpenses,
            periodNet: periodIncome - periodExpenses,
            periodLending,
            totalReceivable,
            totalPayable,
            pendingIncome,
            totalIWillGet: totalReceivable + pendingIncome,
            recentTransactions,
            trends: {
                expenses: formatTrendData(expenseTrendRaw),
                income: formatTrendData(incomeTrendRaw),
                lending: formatTrendData(lendingTrendRaw)
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server Error fetching dashboard stats' });
    }
};

// @desc    Get detailed analytics
// @route   GET /api/stats/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Category-wise spending
        const categorySpending = await Expense.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        // Monthly trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyExpenses = await Expense.aggregate([
            { $match: { user: userObjectId, date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: '$date' }, year: { $year: '$date' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            categorySpending,
            monthlyExpenses
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server Error fetching analytics' });
    }
};

// @desc    Get all activity with pagination
// @route   GET /api/stats/activity
// @access  Private
const getAllActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const expenses = await Expense.find({ user: userId });
        const incomes = await Income.find({ user: userId });
        const lendings = await Lending.find({ user: userId }).populate('person');

        const combined = [
            ...expenses.map(e => ({...e._doc, type: 'expense'})), 
            ...incomes.map(i => ({...i._doc, type: 'income', category: i.source})),
            ...lendings.map(l => ({
                ...l._doc, 
                type: 'lending', 
                category: l.type, 
                title: `${l.type.replace('_', ' ')}: ${l.person?.name || 'Someone'}`
            }))
        ]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

        const total = combined.length;
        const results = combined.slice(skip, skip + limit);

        res.status(200).json({
            results,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Activity Error:', error);
        res.status(500).json({ message: 'Server Error fetching activity' });
    }
};

module.exports = {
    getDashboardStats,
    getAnalytics,
    getAllActivity
};
