const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cashier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Cash',
  },
}, {
  timestamps: true,
});

module.exports = Sale;
