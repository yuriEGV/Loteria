const express = require('express');
const router = express.Router();
const { joinGroup, createGroup, getGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroup);
router.get('/:groupId', getGroup);
router.post('/join/:groupId', protect, joinGroup);

module.exports = router;
