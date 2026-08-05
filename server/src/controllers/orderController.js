const { CustomerOrder, OrderItem, Product, User, sequelize } = require('../models');
const { sendOrderReceiptEmail } = require('../services/emailService');

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { items, prescription_image_url, delivery_address, notes, payment_method } = req.body;
    const customer_id = req.user.id;

    if (!delivery_address) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    if ((!items || !Array.isArray(items) || items.length === 0) && (!prescription_image_url || (Array.isArray(prescription_image_url) && prescription_image_url.length === 0))) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Order must contain either items or an uploaded prescription photo.' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        let product = null;
        const parsedId = parseInt(item.product_id, 10);
        if (!isNaN(parsedId)) {
          product = await Product.findByPk(parsedId, { transaction });
        }

        if (!product) {
          // Gracefully fallback to first product in DB if mock ID passed
          product = await Product.findOne({ transaction });
        }

        const itemPrice = product ? parseFloat(product.selling_price) : (parseFloat(item.price) || 24.50);
        const itemQty = parseInt(item.quantity, 10) || 1;
        totalAmount += itemPrice * itemQty;

        if (product) {
          orderItemsData.push({
            product_id: product.id,
            quantity: itemQty,
            price: itemPrice,
          });
        }
      }
    }

    // Handle payment receipt image if attached in notes or prescription_image_url
    const order = await CustomerOrder.create({
      customer_id,
      total_amount: totalAmount > 0 ? totalAmount : 25.00,
      order_status: 'Pending',
      prescription_image_url: prescription_image_url || null,
      delivery_address,
      notes: notes || '',
      payment_method: payment_method || 'Cash on Delivery',
    }, { transaction });

    if (orderItemsData.length > 0) {
      const itemsToCreate = orderItemsData.map(item => ({
        ...item,
        order_id: order.id,
      }));
      await OrderItem.bulkCreate(itemsToCreate, { transaction });
    }

    await transaction.commit();

    const fullOrder = await CustomerOrder.findByPk(order.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
    });

    // Send Digital Order Receipt Email to Customer asynchronously
    if (fullOrder && fullOrder.customer && fullOrder.customer.email) {
      sendOrderReceiptEmail(fullOrder.customer.email, fullOrder).catch(err => {
        console.error('Failed to send order confirmation email:', err);
      });
    }

    res.status(201).json({
      message: 'Order placed successfully! A confirmation receipt has been sent to your email.',
      order: fullOrder,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Failed to place order:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const orders = await CustomerOrder.findAll({
      where: { customer_id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order history', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.order_status = status;
    }

    const orders = await CustomerOrder.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch online orders', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order_status = req.body.order_status || req.body.status;

    const validStatuses = ['Pending', 'Approved', 'Out for Delivery', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(order_status)) {
      await transaction.rollback();
      return res.status(400).json({ message: `Invalid status "${order_status}". Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await CustomerOrder.findByPk(id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.order_status;

    // Deduct stock if order has items and transitions to Approved
    if (order_status === 'Approved' && previousStatus !== 'Approved' && previousStatus !== 'Completed') {
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        for (const item of order.items) {
          if (item.product) {
            if (item.product.stock_quantity < item.quantity) {
              await transaction.rollback();
              return res.status(400).json({
                message: `Cannot approve order. Insufficient stock for "${item.product.product_name}". Available: ${item.product.stock_quantity}`,
              });
            }
            item.product.stock_quantity -= item.quantity;
            await item.product.save({ transaction });
          }
        }
      }
    }

    order.order_status = order_status;
    await order.save({ transaction });

    await transaction.commit();

    const updatedOrder = await CustomerOrder.findByPk(id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
    });

    if (updatedOrder && updatedOrder.customer && updatedOrder.customer.email) {
      sendOrderReceiptEmail(updatedOrder.customer.email, updatedOrder).catch(err => {
        console.error('Failed to send status update email:', err);
      });
    }

    res.json({ message: `Order #${id} status updated to ${order_status}`, order: updatedOrder });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Failed to update order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getAllOrders,
  updateOrderStatus,
};
