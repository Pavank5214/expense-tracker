const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const cron = require('node-cron');
const Subscription = require('./models/Subscription');
const Expense = require('./models/Expense');

dotenv.config();

const app = express();

app.use(cors());

// Ensure DB connection is established before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ 
            message: 'Database connection failed', 
            error: error.message 
        });
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Expense Tracker API' });
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/income', require('./routes/incomeRoutes'));
app.use('/api/lending', require('./routes/lendingRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Subscriptions Cron Job: Run daily at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running daily subscription check...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueSubscriptions = await Subscription.find({
            isActive: true,
            nextBillingDate: { $lte: today }
        });

        for (const sub of dueSubscriptions) {
            // Create Expense
            await Expense.create({
                user: sub.user,
                title: sub.title,
                amount: sub.amount,
                category: sub.category,
                date: new Date(),
                paymentMethod: 'Card', // default
                notes: 'Auto-generated from subscription'
            });

            // Update next billing date
            const nextDate = new Date(sub.nextBillingDate);
            if (sub.frequency === 'Monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (sub.frequency === 'Yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            } else if (sub.frequency === 'Weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            }

            sub.nextBillingDate = nextDate;
            await sub.save();
        }
        console.log(`Processed ${dueSubscriptions.length} subscriptions`);
    } catch (error) {
        console.error('Subscription cron job error:', error);
    }
});

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;
