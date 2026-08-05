const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Customer & Staff: Send chat message
router.post('/messages', authenticateToken, supportController.sendMessage);

// Customer & Staff: Get chat history
router.get('/messages', authenticateToken, supportController.getMessages);

// Staff Only: List all active customer support conversation threads
router.get('/conversations', authenticateToken, authorizeRoles('Admin', 'Pharmacist', 'Cashier'), supportController.getConversations);

// Customer & Staff: Mark messages as read
router.put('/read', authenticateToken, supportController.markRead);

// Customer & Staff: End live chat session
router.delete('/end', authenticateToken, supportController.endChat);
router.post('/end', authenticateToken, supportController.endChat);

module.exports = router;
