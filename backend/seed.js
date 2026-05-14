const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const Person = require('./models/Person');
const Lending = require('./models/Lending');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Expense.deleteMany();
        await Income.deleteMany();
        await Person.deleteMany();
        await Lending.deleteMany();

        // Create a test user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const user = await User.create({
            name: 'Demo User',
            email: 'demo@example.com',
            password: hashedPassword,
        });

        console.log('User created:', user.email);

        // Create some expenses
        await Expense.create([
            { user: user._id, title: 'Lunch at Cafe', amount: 25, category: 'Food', date: new Date(), paymentMethod: 'Card' },
            { user: user._id, title: 'Uber Ride', amount: 15, category: 'Travel', date: new Date(), paymentMethod: 'UPI' },
            { user: user._id, title: 'Monthly Rent', amount: 1200, category: 'Rent', date: new Date(), paymentMethod: 'Net Banking' },
            { user: user._id, title: 'Netflix Subscription', amount: 15.99, category: 'Bills', date: new Date(), paymentMethod: 'Card' },
        ]);

        // Create some income
        await Income.create([
            { user: user._id, title: 'Salary Credit', amount: 5000, source: 'Salary', date: new Date() },
            { user: user._id, title: 'Freelance Project', amount: 800, source: 'Freelance', date: new Date() },
        ]);

        // Create some people for lending
        const person1 = await Person.create({ user: user._id, name: 'John Doe', phoneNumber: '1234567890', balance: 500 });
        const person2 = await Person.create({ user: user._id, name: 'Alice Smith', phoneNumber: '0987654321', balance: -200 });

        // Create some lending transactions
        await Lending.create([
            { user: user._id, person: person1._id, type: 'Lent', amount: 500, description: 'Emergency loan' },
            { user: user._id, person: person2._id, type: 'Borrowed', amount: 200, description: 'Rent sharing' },
        ]);

        console.log('Seed data created successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
