const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getRevenueAnalytics,
  getExpiryLossReport,
  getProductMovementAnalysis,
} = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/overview', authenticateToken, getDashboardOverview);
router.get('/revenue', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), getRevenueAnalytics);
router.get('/expiry-loss', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), getExpiryLossReport);
router.get('/product-movement', authenticateToken, authorizeRoles('Admin', 'Pharmacist'), getProductMovementAnalysis);

module.exports = router;
