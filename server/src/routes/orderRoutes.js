const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Customer & All-user routes
router.post('/', authenticateToken, authorizeRoles('Customer', 'Admin', 'Pharmacist', 'Cashier'), createOrder);
router.get('/my-orders', authenticateToken, authorizeRoles('Customer', 'Admin', 'Pharmacist', 'Cashier'), getCustomerOrders);

// Staff Queue & Status Update routes (Admin, Pharmacist, Cashier)
router.get('/', authenticateToken, authorizeRoles('Admin', 'Pharmacist', 'Cashier'), getAllOrders);
router.put('/:id/status', authenticateToken, authorizeRoles('Admin', 'Pharmacist', 'Cashier'), updateOrderStatus);

module.exports = router;
