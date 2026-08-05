const { Sale, SaleItem, Product, User } = require('../models');
const sequelize = require('../config/db');

const createSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { items, discount, payment_method } = req.body;
    const cashier_id = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    let calculatedTotal = 0;
    const saleItemsData = [];

    // Verify stock and prepare items
    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product ID ${item.product_id} not found` });
      }

      if (product.stock_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Insufficient stock for "${product.product_name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
        });
      }

      const unitPrice = parseFloat(product.selling_price);
      const subtotal = unitPrice * item.quantity;
      calculatedTotal += subtotal;

      // Deduct stock quantity automatically
      product.stock_quantity -= item.quantity;
      await product.save({ transaction });

      saleItemsData.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: subtotal,
      });
    }

    const discountAmt = parseFloat(discount || 0);
    const finalTotal = Math.max(0, calculatedTotal - discountAmt);

    // Create Sale record
    const sale = await Sale.create({
      cashier_id,
      total_amount: finalTotal,
      discount: discountAmt,
      payment_method: payment_method || 'Cash',
    }, { transaction });

    // Create Sale Items
    const itemsToCreate = saleItemsData.map(item => ({
      ...item,
      sale_id: sale.id,
    }));

    await SaleItem.bulkCreate(itemsToCreate, { transaction });

    await transaction.commit();

    // Fetch full sale with details for printable invoice
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'name', 'email'] },
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    res.status(201).json({
      message: 'Transaction completed successfully',
      sale: completeSale,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Transaction failed', error: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'name'] },
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'product_name', 'batch_number'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sales history', error: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id, {
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'name', 'email'] },
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({ message: 'Sale transaction not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transaction details', error: error.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
};
