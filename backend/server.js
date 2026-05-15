const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://expense.pavankumar.site'
    ],
    credentials: true
}));

app.options('*', cors());

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
