const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../data');

const JWT_SECRET = 'your_super_secret_key_that_should_be_in_an_env_file';
const ADMIN_EMAIL = 'heritagemist.official@gmail.com';

const generateToken = (email, isAdmin) => {
    return jwt.sign({ email, isAdmin }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = { email, passwordHash, isAdmin: false };
    users.push(newUser);

    const userResponse = { email: newUser.email, isAdmin: newUser.isAdmin };
    res.status(201).json({
        user: userResponse,
        token: generateToken(newUser.email, newUser.isAdmin),
    });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        const userResponse = { email: user.email, isAdmin: user.isAdmin };
        res.json({
            user: userResponse,
            token: generateToken(user.email, user.isAdmin),
        });
    } else {
        const isUserRegistered = !!user;
        if (!isUserRegistered) {
             return res.status(401).json({ message: 'No account found with this email. Please register.' });
        }
        res.status(401).json({ message: 'Incorrect password.' });
    }
};


// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = (req, res) => {
    if (req.user) {
        // req.user is attached by the 'protect' middleware
        const { email, isAdmin } = req.user;
        res.json({ email, isAdmin });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};


module.exports = { registerUser, loginUser, getCurrentUser };
