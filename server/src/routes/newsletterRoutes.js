const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers } = require('../controllers/newsletterController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.get('/subscribers', authenticateToken, authorizeRoles('Admin'), getSubscribers);

module.exports = router;
