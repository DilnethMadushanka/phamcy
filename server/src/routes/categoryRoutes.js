const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, getCategories);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), createCategory);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteCategory);

module.exports = router;
