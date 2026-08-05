const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Supplier = require('./Supplier');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const CustomerOrder = require('./CustomerOrder');
const OrderItem = require('./OrderItem');
const ChatMessage = require('./ChatMessage');
const NewsletterSubscriber = require('./NewsletterSubscriber');

// Existing Associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'products' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

User.hasMany(Sale, { foreignKey: 'cashier_id', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'cashier_id', as: 'cashier' });

Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id' });

Product.hasMany(SaleItem, { foreignKey: 'product_id', as: 'saleItems' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Customer Online Orders Associations
User.hasMany(CustomerOrder, { foreignKey: 'customer_id', as: 'orders' });
CustomerOrder.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

CustomerOrder.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(CustomerOrder, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(Sale, { foreignKey: 'customer_id', as: 'customerPurchases' });
Sale.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Chat Associations
User.hasMany(ChatMessage, { foreignKey: 'customer_id', as: 'chatMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Supplier,
  Sale,
  SaleItem,
  CustomerOrder,
  OrderItem,
  ChatMessage,
  NewsletterSubscriber,
};
