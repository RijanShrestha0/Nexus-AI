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

// @route   POST /api/dashboard/agents
// @desc    Add a live new agent gracefully to array stream
// @access  Private
router.post('/agents', verifyToken, dashboardController.addAgent);

// @route   DELETE /api/dashboard/agents/:id
// @desc    Delete specified user agent mapped context
// @access  Private
router.delete('/agents/:id', verifyToken, dashboardController.deleteAgent);

// @route   GET /api/dashboard/agents/:id/details
// @access  Private
router.get('/agents/:id/details', verifyToken, dashboardController.getAgentDetails);

// @route   GET /api/dashboard/activity
// @desc    Get live dynamic console execution mapping feed
// @access  Private
router.get('/activity', verifyToken, dashboardController.getActivityFeed);

// @route   GET /api/dashboard/integrations
// @access  Private
router.get('/integrations', verifyToken, dashboardController.getIntegrations);

// @route   POST /api/dashboard/integrations/toggle
// @access  Private
router.post('/integrations/toggle', verifyToken, dashboardController.toggleIntegration);

module.exports = router;
