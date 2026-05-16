const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, gender, phoneNumber } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Single high-quality neutral avatar for all users
    let avatar = `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Felix&backgroundColor=b6e3f4`; 
    if (req.body.avatar) avatar = req.body.avatar;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        gender: gender || 'male',
        phoneNumber: phoneNumber || '',
        avatar: req.body.avatar || avatar
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            phoneNumber: user.phoneNumber,
            monthlyGoal: user.monthlyGoal || 0,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            phoneNumber: user.phoneNumber,
            monthlyGoal: user.monthlyGoal || 0,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Email uniqueness check
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update basic fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.monthlyGoal = req.body.monthlyGoal !== undefined ? req.body.monthlyGoal : user.monthlyGoal;

        // Simple Neutral Avatar
        if (!user.avatar || user.avatar.includes('dicebear')) {
            user.avatar = `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Felix&backgroundColor=b6e3f4`;
        }

        // Password update
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            gender: updatedUser.gender,
            phoneNumber: updatedUser.phoneNumber,
            monthlyGoal: updatedUser.monthlyGoal || 0,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ 
            message: error.message || 'Internal Server Error',
            details: error.stack
        });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'yoursecretkeyhere', {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
};
