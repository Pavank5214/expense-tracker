const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Lending = require('../models/Lending');
const Person = require('../models/Person');
const User = require('../models/User');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expense_tracker');
        console.log('Connected to DB...');

        const user = await User.findOne(); 
        if (!user) {
            console.log('No user found.');
            process.exit();
        }

        const userId = user._id;
        
        // Create some people for lending
        const peopleNames = ['Rahul Sharma', 'Anjali Gupta', 'Vikram Singh', 'Sneha Patel'];
        const people = await Person.insertMany(peopleNames.map(name => ({
            user: userId,
            name: name,
            phoneNumber: '9876543210'
        })));

        const expenseCategories = ['Food', 'Travel', 'Fuel', 'Shopping', 'Bills', 'EMI', 'Rent', 'Miscellaneous'];
        const incomeSources = ['Salary', 'Freelance', 'Business', 'Investments', 'Other'];
        const lendingTypes = ['Lent', 'Borrowed', 'Repayment_Sent', 'Repayment_Received'];

        const expenses = [];
        const incomes = [];
        const lendings = [];

        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // spread over 2 months

            expenses.push({
                user: userId,
                title: `Expense ${i + 1}`,
                amount: Math.floor(Math.random() * 2000) + 100,
                category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
                date: date,
                paymentMethod: 'UPI'
            });

            incomes.push({
                user: userId,
                title: `Income ${i + 1}`,
                amount: Math.floor(Math.random() * 10000) + 5000,
                source: incomeSources[Math.floor(Math.random() * incomeSources.length)],
                date: date
            });

            const randomPerson = people[Math.floor(Math.random() * people.length)];
            const lendingType = lendingTypes[Math.floor(Math.random() * lendingTypes.length)];
            
            lendings.push({
                user: userId,
                person: randomPerson._id,
                type: lendingType,
                amount: Math.floor(Math.random() * 5000) + 500,
                description: `Lending ${i + 1} - ${lendingType}`,
                date: date,
                status: 'Pending'
            });
        }

        await Expense.insertMany(expenses);
        await Income.insertMany(incomes);
        await Lending.insertMany(lendings);

        console.log('Seed successful: 50 Expenses, 50 Incomes, 50 Lending records added.');
        process.exit();
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
