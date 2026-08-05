const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById } = require('../controllers/saleController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles('Admin', 'Pharmacist', 'Cashier'), createSale);
router.get('/', authenticateToken, getSales);
router.get('/:id', authenticateToken, getSaleById);

module.exports = router;
