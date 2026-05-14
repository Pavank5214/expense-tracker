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
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Total Income
        const totalIncomeResult = await Income.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalIncome = totalIncomeResult[0]?.total || 0;

        // Total Expenses
        const totalExpensesResult = await Expense.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = totalExpensesResult[0]?.total || 0;

        // Lending stats
        const people = await Person.find({ user: userId });
        let totalReceivable = 0;
        let totalPayable = 0;

        people.forEach(p => {
            if (p.balance > 0) totalReceivable += p.balance;
            if (p.balance < 0) totalPayable += Math.abs(p.balance);
        });

        // Combined Recent Transactions
        const recentExpenses = await Expense.find({ user: userId }).sort({ date: -1 }).limit(10);
        const recentIncomes = await Income.find({ user: userId }).sort({ date: -1 }).limit(10);
        const recentLendings = await Lending.find({ user: userId }).populate('person').sort({ date: -1 }).limit(10);

        const recentTransactions = [
            ...recentExpenses.map(e => ({...e._doc, type: 'expense'})), 
            ...recentIncomes.map(i => ({...i._doc, type: 'income', category: i.source})),
            ...recentLendings.map(l => ({
                ...l._doc, 
                type: 'lending', 
                category: l.type, 
                title: `${l.type.replace('_', ' ')}: ${l.person?.name || 'Someone'}`
            }))
        ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

        // Weekly Trends Data
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const groupTrend = async (Model, matchField = 'amount') => {
            return await Model.aggregate([
                { $match: { user: userObjectId, date: { $gte: last7Days } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        total: { $sum: `$${matchField}` }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        };

        const expenseTrend = await groupTrend(Expense);
        const incomeTrend = await groupTrend(Income);
        const lendingTrend = await groupTrend(Lending);

        // Helper to format trend for frontend
        const formatTrend = (trend) => {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const match = trend.find(t => t._id === dateStr);
                days.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), amount: match ? match.total : 0 });
            }
            return days;
        };

        res.status(200).json({
            totalIncome,
            totalExpenses,
            totalReceivable,
            totalPayable,
            netBalance: totalIncome - totalExpenses + totalReceivable - totalPayable,
            recentTransactions,
            trends: {
                expenses: formatTrend(expenseTrend),
                income: formatTrend(incomeTrend),
                lending: formatTrend(lendingTrend)
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
