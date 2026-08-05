const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sender_name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'User',
  },
  sender_role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Customer',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'chat_messages',
  timestamps: true,
});

ChatMessage.sync({ alter: true }).catch((err) => console.error('ChatMessage table sync error:', err));

module.exports = ChatMessage;
