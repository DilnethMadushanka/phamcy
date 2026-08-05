const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, getProducts);
router.get('/:id', authenticateToken, getProductById);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), createProduct);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteProduct);

module.exports = router;
