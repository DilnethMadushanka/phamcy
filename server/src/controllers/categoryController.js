const { Category, Product } = require('../models');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'] }],
      order: [['category_name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await Category.findOne({ where: { category_name } });
    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.create({ category_name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category_name) category.category_name = category_name;
    if (description !== undefined) category.description = description;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
