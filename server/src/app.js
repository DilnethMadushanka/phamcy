const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const saleRoutes = require('./routes/saleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const supportRoutes = require('./routes/supportRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

const app = express();

app.use(cors());
// Increased body parser payload limits to 50MB to easily handle camera photo uploads & Base64 receipts
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: '🚀 Pharmacy Management API Backend is running', healthCheck: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pharmacy Management API is active' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log('Database synchronized successfully.');
  app.listen(PORT, () => {
    console.log(`Pharmacy Management API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});

module.exports = app;
