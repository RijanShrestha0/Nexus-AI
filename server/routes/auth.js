const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new admin/user safely
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate and return standard JWT mapped tokens
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get currently hydrated user profile
// @access  Private
// (Import and append `verifyToken` middleware when actively testing)
const { verifyToken } = require('../middleware/auth');
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
