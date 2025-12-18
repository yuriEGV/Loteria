const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ message: 'Please add a wallet address' });
    }

    // Check if user exists
    let user = await User.findOne({ walletAddress });

    if (!user) {
        // Create new user if not exists
        user = await User.create({
            walletAddress,
        });
    }

    if (user) {
        res.json({
            _id: user.id,
            walletAddress: user.walletAddress,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { loginUser };
