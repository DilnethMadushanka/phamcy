const { Product, Category, Supplier } = require('../models');
const { Op } = require('sequelize');

const getProducts = async (req, res) => {
  try {
    const { search, category_id, low_stock, near_expiry } = req.query;

    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { generic_name: { [Op.like]: `%${search}%` } },
        { batch_number: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category_id && category_id !== 'all') {
      whereClause.category_id = category_id;
    }

    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    if (low_stock === 'true') {
      whereClause.stock_quantity = { [Op.lte]: sequelize.col('minimum_threshold') };
    }

    if (near_expiry === 'true') {
      whereClause.expiry_date = {
        [Op.gte]: today,
        [Op.lte]: threeMonthsLater,
      };
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'category_name'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'supplier_name', 'company_name'] },
      ],
      order: [['product_name', 'ASC']],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' },
      ],
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product details', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      generic_name,
      category_id,
      supplier_id,
      batch_number,
      expiry_date,
      purchase_price,
      selling_price,
      stock_quantity,
      minimum_threshold,
      barcode,
    } = req.body;

    if (!product_name || !generic_name || !category_id || !batch_number || !expiry_date) {
      return res.status(400).json({
        message: 'Product Name, Generic Name, Category, Batch Number, and Expiry Date are mandatory.',
      });
    }

    const product = await Product.create({
      product_name,
      generic_name,
      category_id,
      supplier_id: supplier_id || null,
      batch_number,
      expiry_date,
      purchase_price: purchase_price || 0,
      selling_price: selling_price || 0,
      stock_quantity: stock_quantity || 0,
      minimum_threshold: minimum_threshold || 10,
      barcode: barcode || null,
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' },
      ],
    });

    res.status(201).json(fullProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      product_name,
      generic_name,
      category_id,
      supplier_id,
      batch_number,
      expiry_date,
      purchase_price,
      selling_price,
      stock_quantity,
      minimum_threshold,
      barcode,
    } = req.body;

    if (product_name) product.product_name = product_name;
    if (generic_name) product.generic_name = generic_name;
    if (category_id) product.category_id = category_id;
    if (supplier_id !== undefined) product.supplier_id = supplier_id || null;
    if (batch_number) product.batch_number = batch_number;
    if (expiry_date) product.expiry_date = expiry_date;
    if (purchase_price !== undefined) product.purchase_price = purchase_price;
    if (selling_price !== undefined) product.selling_price = selling_price;
    if (stock_quantity !== undefined) product.stock_quantity = stock_quantity;
    if (minimum_threshold !== undefined) product.minimum_threshold = minimum_threshold;
    if (barcode !== undefined) product.barcode = barcode;

    await product.save();

    const updated = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' },
      ],
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
