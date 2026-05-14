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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
const baseRoute = process.env.NODE_ENV === 'production' ? '/_/backend/api' : '/api';

app.use(`${baseRoute}/users`, require('./routes/userRoutes'));
app.use(`${baseRoute}/expenses`, require('./routes/expenseRoutes'));
app.use(`${baseRoute}/income`, require('./routes/incomeRoutes'));
app.use(`${baseRoute}/lending`, require('./routes/lendingRoutes'));
app.use(`${baseRoute}/stats`, require('./routes/statsRoutes'));

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
