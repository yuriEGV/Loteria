const express = require('express');
const router = express.Router();
const { runMonthlyLottery, getLotteryStatus, getActiveGroups } = require('../controllers/lotteryController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/groups', getActiveGroups);
router.get('/status/:groupId', getLotteryStatus);

// Protected routes (admin only for running lottery)
router.post('/run/:groupId', protect, runMonthlyLottery);

module.exports = router;
