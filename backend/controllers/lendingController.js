const Lending = require('../models/Lending');
const Person = require('../models/Person');

// @desc    Get all lending transactions
// @route   GET /api/lending
// @access  Private
const getLendingTransactions = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Lending.countDocuments({ user: req.user.id });
    const transactions = await Lending.find({ user: req.user.id })
        .populate('person', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        transactions,
        page,
        totalPages: Math.ceil(total / limit),
        total
    });
};

// @desc    Add lending transaction
// @route   POST /api/lending
// @access  Private
const addLendingTransaction = async (req, res) => {
    const { personId, type, amount, description, date, dueDate, interest } = req.body;

    if (!personId || !type || !amount) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const person = await Person.findById(personId);
    if (!person) {
        res.status(404);
        throw new Error('Person not found');
    }

    const transaction = await Lending.create({
        user: req.user.id,
        person: personId,
        type,
        amount,
        description,
        date,
        dueDate,
        interest,
    });

    // Update Person balance
    // Type: 'Lent', 'Borrowed', 'Repayment_Sent', 'Repayment_Received'
    // balance: Positive means they owe user, Negative means user owes them
    if (type === 'Lent') {
        person.totalLent += Number(amount);
        person.balance += Number(amount);
    } else if (type === 'Borrowed') {
        person.totalBorrowed += Number(amount);
        person.balance -= Number(amount);
    } else if (type === 'Repayment_Sent') {
        person.balance += Number(amount); // Decreasing user's debt to them
    } else if (type === 'Repayment_Received') {
        person.balance -= Number(amount); // Decreasing their debt to user
    }

    await person.save();

    res.status(201).json(transaction);
};

// @desc    Get all people
// @route   GET /api/lending/people
// @access  Private
const getPeople = async (req, res) => {
    const people = await Person.find({ user: req.user.id }).sort({ name: 1 });
    res.status(200).json(people);
};

// @desc    Add person
// @route   POST /api/lending/people
// @access  Private
const addPerson = async (req, res) => {
    const { name, phoneNumber, email, notes } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a name');
    }

    const person = await Person.create({
        user: req.user.id,
        name,
        phoneNumber,
        email,
        notes,
    });

    res.status(201).json(person);
};

// @desc    Get person details and history
// @route   GET /api/lending/people/:id
// @access  Private
const getPersonDetails = async (req, res) => {
    const person = await Person.findById(req.params.id);
    if (!person) {
        res.status(404);
        throw new Error('Person not found');
    }

    const history = await Lending.find({ person: req.params.id }).sort({ date: -1 });

    res.status(200).json({ person, history });
};

// @desc    Update lending transaction
// @route   PUT /api/lending/:id
// @access  Private
const updateLendingTransaction = async (req, res) => {
    const transaction = await Lending.findById(req.params.id);
    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    const person = await Person.findById(transaction.person);
    
    // Reverse old transaction impact on balance
    if (transaction.type === 'Lent') {
        person.totalLent -= transaction.amount;
        person.balance -= transaction.amount;
    } else if (transaction.type === 'Borrowed') {
        person.totalBorrowed -= transaction.amount;
        person.balance += transaction.amount;
    } else if (transaction.type === 'Repayment_Sent') {
        person.balance -= transaction.amount;
    } else if (transaction.type === 'Repayment_Received') {
        person.balance += transaction.amount;
    }

    // Apply new values
    const { amount, type, description, date } = req.body;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.description = description || transaction.description;
    transaction.date = date || transaction.date;

    await transaction.save();

    // Apply new transaction impact on balance
    if (transaction.type === 'Lent') {
        person.totalLent += transaction.amount;
        person.balance += transaction.amount;
    } else if (transaction.type === 'Borrowed') {
        person.totalBorrowed += transaction.amount;
        person.balance -= transaction.amount;
    } else if (transaction.type === 'Repayment_Sent') {
        person.balance += transaction.amount;
    } else if (transaction.type === 'Repayment_Received') {
        person.balance -= transaction.amount;
    }

    await person.save();
    res.status(200).json(transaction);
};

// @desc    Delete lending transaction
// @route   DELETE /api/lending/:id
// @access  Private
const deleteLendingTransaction = async (req, res) => {
    const transaction = await Lending.findById(req.params.id);
    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    const person = await Person.findById(transaction.person);
    if (person) {
        if (transaction.type === 'Lent') {
            person.totalLent -= transaction.amount;
            person.balance -= transaction.amount;
        } else if (transaction.type === 'Borrowed') {
            person.totalBorrowed -= transaction.amount;
            person.balance += transaction.amount;
        } else if (transaction.type === 'Repayment_Sent') {
            person.balance -= transaction.amount;
        } else if (transaction.type === 'Repayment_Received') {
            person.balance += transaction.amount;
        }
        await person.save();
    }

    await transaction.deleteOne();
    res.status(200).json({ id: req.params.id });
};

// @desc    Update person
// @route   PUT /api/lending/people/:id
// @access  Private
const updatePerson = async (req, res) => {
    const person = await Person.findById(req.params.id);
    if (!person) {
        res.status(404);
        throw new Error('Person not found');
    }

    const updatedPerson = await Person.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.status(200).json(updatedPerson);
};

// @desc    Delete person
// @route   DELETE /api/lending/people/:id
// @access  Private
const deletePerson = async (req, res) => {
    const person = await Person.findById(req.params.id);
    if (!person) {
        res.status(404);
        throw new Error('Person not found');
    }

    // Delete all transactions associated with this person
    await Lending.deleteMany({ person: req.params.id });
    await person.deleteOne();
    
    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getLendingTransactions,
    addLendingTransaction,
    updateLendingTransaction,
    deleteLendingTransaction,
    getPeople,
    addPerson,
    updatePerson,
    deletePerson,
    getPersonDetails,
};
