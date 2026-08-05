const { Supplier, Product, Category } = require('../models');
const { Op } = require('sequelize');

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id', 'product_name', 'stock_quantity'] }],
      order: [['supplier_name', 'ASC']],
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch suppliers', error: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { supplier_name, company_name, phone, email, address } = req.body;
    if (!supplier_name || !company_name || !phone) {
      return res.status(400).json({ message: 'Supplier name, company name, and phone are required' });
    }

    const supplier = await Supplier.create({
      supplier_name,
      company_name,
      phone,
      email,
      address,
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create supplier', error: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const { supplier_name, company_name, phone, email, address } = req.body;
    if (supplier_name) supplier.supplier_name = supplier_name;
    if (company_name) supplier.company_name = company_name;
    if (phone) supplier.phone = phone;
    if (email !== undefined) supplier.email = email;
    if (address !== undefined) supplier.address = address;

    await supplier.save();
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update supplier', error: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.destroy();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete supplier', error: error.message });
  }
};

// Generate Purchase Orders for items needing reorder
const generatePurchaseOrders = async (req, res) => {
  try {
    const allProducts = await Product.findAll({
      include: [
        { model: Supplier, as: 'supplier' },
        { model: Category, as: 'category' }
      ]
    });

    // Filter products where stock <= minimum_threshold
    const reorderItems = allProducts.filter(p => p.stock_quantity <= p.minimum_threshold);

    // Group items by supplier
    const ordersBySupplier = {};

    reorderItems.forEach(product => {
      const suppId = product.supplier ? product.supplier.id : 'unassigned';
      const suppName = product.supplier ? product.supplier.company_name : 'Unassigned Supplier';
      const suppContact = product.supplier ? `${product.supplier.supplier_name} (${product.supplier.phone})` : 'N/A';

      if (!ordersBySupplier[suppId]) {
        ordersBySupplier[suppId] = {
          supplier_id: suppId,
          supplier_name: suppName,
          contact: suppContact,
          items: [],
          total_estimated_cost: 0,
        };
      }

      const minThresh = product.minimum_threshold || 10;
      const calcQty = (minThresh * 2) - product.stock_quantity;
      const reorderQty = calcQty > 0 ? calcQty : minThresh;
      const unitPrice = parseFloat(product.purchase_price || 0);
      const estimatedCost = reorderQty * unitPrice;

      ordersBySupplier[suppId].items.push({
        product_id: product.id,
        product_name: product.product_name,
        generic_name: product.generic_name,
        current_stock: product.stock_quantity,
        minimum_threshold: minThresh,
        suggested_reorder_qty: reorderQty,
        unit_purchase_price: unitPrice,
        estimated_subtotal: estimatedCost,
      });

      ordersBySupplier[suppId].total_estimated_cost += estimatedCost;
    });

    res.json({
      total_items_to_reorder: reorderItems.length,
      purchase_orders: Object.values(ordersBySupplier),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate purchase orders', error: error.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  generatePurchaseOrders,
};
