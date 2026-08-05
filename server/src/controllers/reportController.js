const { Sale, SaleItem, Product, Category, Supplier, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const getDashboardOverview = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalCategories = await Category.count();
    const totalSuppliers = await Supplier.count();
    const totalSales = await Sale.count();

    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    // Low stock items count (stock_quantity <= minimum_threshold)
    const lowStockProducts = await Product.findAll({
      where: sequelize.where(
        sequelize.col('stock_quantity'),
        '<=',
        sequelize.col('minimum_threshold')
      ),
      include: [{ model: Category, as: 'category' }],
    });

    // Near expiry items count
    const nearExpiryProducts = await Product.findAll({
      where: {
        expiry_date: {
          [Op.gte]: today,
          [Op.lte]: threeMonthsLater,
        },
      },
      include: [{ model: Category, as: 'category' }],
    });

    // Total revenue sum
    const salesTotal = await Sale.sum('total_amount');

    res.json({
      metrics: {
        totalProducts,
        totalCategories,
        totalSuppliers,
        totalSales,
        totalRevenue: salesTotal || 0,
        lowStockCount: lowStockProducts.length,
        nearExpiryCount: nearExpiryProducts.length,
      },
      lowStockAlerts: lowStockProducts,
      nearExpiryAlerts: nearExpiryProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard overview', error: error.message });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      attributes: ['id', 'total_amount', 'discount', 'payment_method', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });

    // Group sales by Date (YYYY-MM-DD)
    const revenueByDate = {};

    sales.forEach(sale => {
      const dateKey = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = { date: dateKey, total: 0, count: 0 };
      }
      revenueByDate[dateKey].total += parseFloat(sale.total_amount);
      revenueByDate[dateKey].count += 1;
    });

    res.json({
      chartData: Object.values(revenueByDate),
      recentTransactions: sales.slice(-10).reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue analytics', error: error.message });
  }
};

const getExpiryLossReport = async (req, res) => {
  try {
    const today = new Date();

    // Expired products (expiry_date < today)
    const expiredProducts = await Product.findAll({
      where: {
        expiry_date: {
          [Op.lt]: today,
        },
      },
      include: [{ model: Category, as: 'category' }, { model: Supplier, as: 'supplier' }],
    });

    let totalFinancialLoss = 0;
    const items = expiredProducts.map(prod => {
      const loss = parseFloat(prod.purchase_price) * prod.stock_quantity;
      totalFinancialLoss += loss;
      return {
        id: prod.id,
        product_name: prod.product_name,
        generic_name: prod.generic_name,
        batch_number: prod.batch_number,
        expiry_date: prod.expiry_date,
        stock_quantity: prod.stock_quantity,
        unit_purchase_price: prod.purchase_price,
        total_loss: loss,
        category: prod.category ? prod.category.category_name : 'Uncategorized',
      };
    });

    res.json({
      totalExpiredItems: items.length,
      totalFinancialLoss,
      expiredProducts: items,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expiry loss report', error: error.message });
  }
};

const getProductMovementAnalysis = async (req, res) => {
  try {
    const saleItems = await SaleItem.findAll({
      include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category' }] }],
    });

    const productSalesMap = {};

    saleItems.forEach(item => {
      if (!item.product) return;
      const pid = item.product.id;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = {
          id: pid,
          product_name: item.product.product_name,
          generic_name: item.product.generic_name,
          category: item.product.category ? item.product.category.category_name : 'N/A',
          total_quantity_sold: 0,
          total_revenue_generated: 0,
          current_stock: item.product.stock_quantity,
        };
      }
      productSalesMap[pid].total_quantity_sold += item.quantity;
      productSalesMap[pid].total_revenue_generated += parseFloat(item.subtotal);
    });

    const sortedProducts = Object.values(productSalesMap).sort(
      (a, b) => b.total_quantity_sold - a.total_quantity_sold
    );

    const fastMoving = sortedProducts.slice(0, 5);
    const slowMoving = sortedProducts.slice(-5).reverse();

    res.json({
      fastMoving,
      slowMoving,
      allMovementData: sortedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product movement analysis', error: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getRevenueAnalytics,
  getExpiryLossReport,
  getProductMovementAnalysis,
};
