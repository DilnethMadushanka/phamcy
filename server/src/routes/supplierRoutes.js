const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  generatePurchaseOrders,
} = require('../controllers/supplierController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, getSuppliers);
router.get('/purchase-orders', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), generatePurchaseOrders);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), createSupplier);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), updateSupplier);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteSupplier);

module.exports = router;
