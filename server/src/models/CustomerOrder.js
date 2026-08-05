const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CustomerOrder = sequelize.define('CustomerOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  order_status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Out for Delivery', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  prescription_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('prescription_image_url');
      if (!rawValue) return null;
      try {
        return JSON.parse(rawValue);
      } catch {
        // Raw value is a plain string (URL), not a JSON array — return as-is
        return rawValue;
      }
    },
    set(val) {
      this.setDataValue('prescription_image_url', val ? JSON.stringify(val) : null);
    },
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Cash on Delivery',
  },
}, {
  timestamps: true,
});

module.exports = CustomerOrder;
