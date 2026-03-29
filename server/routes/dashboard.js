const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/dashboard/metrics
// @desc    Get top-level execution metrics (Protected route)
// @access  Private
router.get('/metrics', verifyToken, dashboardController.getMetrics);

// @route   GET /api/dashboard/agents
// @desc    Get array stream of simulated live active agents
// @access  Private
router.get('/agents', verifyToken, dashboardController.getActiveAgents);

// @route   GET /api/dashboard/activity
// @desc    Get live dynamic console execution mapping feed
// @access  Private
router.get('/activity', verifyToken, dashboardController.getActivityFeed);

module.exports = router;
