const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Supplier, Product, Sale, SaleItem, CustomerOrder, OrderItem } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🔗 Connecting to Neon Cloud DB...');
    await sequelize.authenticate();
    console.log('✅ Connected to Neon Cloud DB!');

    await sequelize.sync({ force: true });
    console.log('✅ Tables synced to Neon Cloud DB.');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const pharmPass = await bcrypt.hash('pharm123', salt);
    const cashierPass = await bcrypt.hash('cashier123', salt);

    const admin = await User.create({
      name: 'Dr. Sarah Connor (Admin)',
      email: 'admin@pharmacy.com',
      password_hash: adminPass,
      role: 'Admin',
    });

    const pharmacist = await User.create({
      name: 'Alex Mercer (Pharmacist)',
      email: 'pharmacist@pharmacy.com',
      password_hash: pharmPass,
      role: 'Pharmacist',
    });

    const cashier = await User.create({
      name: 'John Doe (Cashier)',
      email: 'cashier@pharmacy.com',
      password_hash: cashierPass,
      role: 'Cashier',
    });

    const customer = await User.create({
      name: 'Emma Watson (Patient)',
      email: 'customer@pharmacy.com',
      password_hash: cashierPass,
      role: 'Customer',
    });

    console.log('✅ Users seeded to Neon Cloud DB.');

    // 2. Seed Categories
    const categoriesData = [
      { category_name: 'General Medicines', description: 'Over-the-counter and prescription pain relievers, antibiotics, and vitamins.' },
      { category_name: 'Skin Care', description: 'Dermatological creams, moisturizers, acne treatments, and sunscreens.' },
      { category_name: 'Dental Care', description: 'Toothpastes, mouthwashes, dental floss, and oral hygiene products.' },
      { category_name: 'Beauty & Cosmetics', description: 'Skincare cosmetics, lip balms, and personal care products.' },
      { category_name: 'Baby Care', description: 'Infant formulas, baby wipes, lotions, and supplements.' },
      { category_name: 'Surgical / First Aid', description: 'Bandages, surgical gloves, antiseptics, and medical dressings.' },
    ];

    const categories = await Category.bulkCreate(categoriesData);
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.category_name] = cat.id;
    });
    console.log('✅ Categories seeded to Neon Cloud DB.');

    // 3. Seed Suppliers
    const suppliersData = [
      {
        supplier_name: 'Robert Vance',
        company_name: 'PharmaCare Wholesalers',
        phone: '+1 555-0192',
        email: 'supply@pharmacare.com',
        address: '100 Health Ave, Medical District',
      },
      {
        supplier_name: 'Elena Rostova',
        company_name: 'BioDerma Labs Direct',
        phone: '+1 555-0144',
        email: 'orders@biodermalabs.com',
        address: '45 Cosmetic Tech Way, Suite 3',
      },
      {
        supplier_name: 'Marcus Brody',
        company_name: 'MediSurge Supplies Inc',
        phone: '+1 555-0988',
        email: 'sales@medisurge.com',
        address: '77 Industrial Pkwy',
      },
    ];

    const suppliers = await Supplier.bulkCreate(suppliersData);
    console.log('✅ Suppliers seeded to Neon Cloud DB.');

    // 4. Seed Products
    const futureDate = (months) => {
      const d = new Date();
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0];
    };
    const pastDate = (months) => {
      const d = new Date();
      d.setMonth(d.getMonth() - months);
      return d.toISOString().split('T')[0];
    };

    const productsData = [
      {
        product_name: 'Paracetamol 500mg (Panadol)',
        generic_name: 'Acetaminophen',
        category_id: categoryMap['General Medicines'],
        supplier_id: suppliers[0].id,
        batch_number: 'BATCH-2026-A1',
        expiry_date: futureDate(18),
        purchase_price: 1.50,
        selling_price: 3.50,
        stock_quantity: 150,
        minimum_threshold: 30,
        barcode: '890123456701',
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Amoxicillin 250mg Capsules',
        generic_name: 'Amoxicillin Trihydrate',
        category_id: categoryMap['General Medicines'],
        supplier_id: suppliers[0].id,
        batch_number: 'BATCH-2026-A2',
        expiry_date: futureDate(2),
        purchase_price: 4.00,
        selling_price: 8.50,
        stock_quantity: 8,
        minimum_threshold: 20,
        barcode: '890123456702',
        image_url: 'https://images.unsplash.com/photo-1550572017-edb79361a9fb?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Ibuprofen 400mg Ultra',
        generic_name: 'Ibuprofen',
        category_id: categoryMap['General Medicines'],
        supplier_id: suppliers[0].id,
        batch_number: 'BATCH-2025-X9',
        expiry_date: pastDate(1),
        purchase_price: 2.20,
        selling_price: 5.00,
        stock_quantity: 14,
        minimum_threshold: 15,
        barcode: '890123456703',
        image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Hydrocortisone 1% Cream',
        generic_name: 'Hydrocortisone',
        category_id: categoryMap['Skin Care'],
        supplier_id: suppliers[1].id,
        batch_number: 'BATCH-SK-881',
        expiry_date: futureDate(12),
        purchase_price: 5.50,
        selling_price: 12.00,
        stock_quantity: 45,
        minimum_threshold: 10,
        barcode: '890123456704',
        image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'CeraVe Hydrating Facial Lotion',
        generic_name: 'Ceramide Moisturizer',
        category_id: categoryMap['Skin Care'],
        supplier_id: suppliers[1].id,
        batch_number: 'BATCH-SK-902',
        expiry_date: futureDate(24),
        purchase_price: 10.00,
        selling_price: 18.99,
        stock_quantity: 5,
        minimum_threshold: 15,
        barcode: '890123456705',
        image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Sensodyne Rapid Relief Toothpaste',
        generic_name: 'Potassium Nitrate / Fluoride',
        category_id: categoryMap['Dental Care'],
        supplier_id: suppliers[0].id,
        batch_number: 'BATCH-DEN-10',
        expiry_date: futureDate(14),
        purchase_price: 3.20,
        selling_price: 6.99,
        stock_quantity: 60,
        minimum_threshold: 15,
        barcode: '890123456706',
        image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Listerine Antiseptic Mouthwash 500ml',
        generic_name: 'Eucalyptol & Menthol Oral Wash',
        category_id: categoryMap['Dental Care'],
        supplier_id: suppliers[0].id,
        batch_number: 'BATCH-DEN-12',
        expiry_date: futureDate(10),
        purchase_price: 4.50,
        selling_price: 8.99,
        stock_quantity: 35,
        minimum_threshold: 10,
        barcode: '890123456707',
        image_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Nivea Soft Refreshing Cream',
        generic_name: 'Jojoba Oil Moisturizing Cream',
        category_id: categoryMap['Beauty & Cosmetics'],
        supplier_id: suppliers[1].id,
        batch_number: 'BATCH-BEAU-04',
        expiry_date: futureDate(15),
        purchase_price: 2.80,
        selling_price: 5.50,
        stock_quantity: 50,
        minimum_threshold: 12,
        barcode: '890123456708',
        image_url: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Pampers Sensitive Baby Wipes 80s',
        generic_name: 'Aloe Baby Wet Wipes',
        category_id: categoryMap['Baby Care'],
        supplier_id: suppliers[0].id,
        batch_number: 'BATCH-BABY-01',
        expiry_date: futureDate(30),
        purchase_price: 2.00,
        selling_price: 4.25,
        stock_quantity: 80,
        minimum_threshold: 20,
        barcode: '890123456709',
        image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Sterile Gauze Bandage Rolls 10 Pack',
        generic_name: 'Cotton Gauze Dressings',
        category_id: categoryMap['Surgical / First Aid'],
        supplier_id: suppliers[2].id,
        batch_number: 'BATCH-SURG-99',
        expiry_date: futureDate(36),
        purchase_price: 6.00,
        selling_price: 13.50,
        stock_quantity: 4,
        minimum_threshold: 10,
        barcode: '890123456710',
        image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=800',
      },
    ];

    const products = await Product.bulkCreate(productsData);
    console.log('✅ Products seeded to Neon Cloud DB.');

    // 5. Seed Initial Sales
    const sale1 = await Sale.create({
      cashier_id: cashier.id,
      total_amount: 15.99,
      discount: 1.50,
      payment_method: 'Cash',
    });

    await SaleItem.create({
      sale_id: sale1.id,
      product_id: products[0].id,
      quantity: 2,
      unit_price: 3.50,
      subtotal: 7.00,
    });

    await SaleItem.create({
      sale_id: sale1.id,
      product_id: products[6].id,
      quantity: 1,
      unit_price: 8.99,
      subtotal: 8.99,
    });

    const sale2 = await Sale.create({
      cashier_id: pharmacist.id,
      total_amount: 24.49,
      discount: 0.00,
      payment_method: 'Card',
    });

    await SaleItem.create({
      sale_id: sale2.id,
      product_id: products[4].id,
      quantity: 1,
      unit_price: 18.99,
      subtotal: 18.99,
    });

    await SaleItem.create({
      sale_id: sale2.id,
      product_id: products[7].id,
      quantity: 1,
      unit_price: 5.50,
      subtotal: 5.50,
    });

    console.log('✅ Initial Sales seeded.');

    // 6. Seed Sample Customer Online Orders
    const onlineOrder1 = await CustomerOrder.create({
      customer_id: customer.id,
      total_amount: 15.49,
      order_status: 'Pending',
      prescription_image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      delivery_address: 'Student Dorms Block B, Room 204, Campus East',
      notes: 'Doctor prescribed antibiotics for throat infection. Please verify prescription.',
      payment_method: 'Cash on Delivery',
    });

    await OrderItem.create({
      order_id: onlineOrder1.id,
      product_id: products[1].id,
      quantity: 1,
      price: 8.50,
    });

    await OrderItem.create({
      order_id: onlineOrder1.id,
      product_id: products[5].id,
      quantity: 1,
      price: 6.99,
    });

    const onlineOrder2 = await CustomerOrder.create({
      customer_id: customer.id,
      total_amount: 23.24,
      order_status: 'Approved',
      prescription_image_url: null,
      delivery_address: 'Science Hall Lab 12, Main Campus',
      notes: 'Regular skin care moisturizers order.',
      payment_method: 'Credit / Debit Card',
    });

    await OrderItem.create({
      order_id: onlineOrder2.id,
      product_id: products[4].id,
      quantity: 1,
      price: 18.99,
    });

    await OrderItem.create({
      order_id: onlineOrder2.id,
      product_id: products[8].id,
      quantity: 1,
      price: 4.25,
    });

    console.log('✅ Customer Online Orders seeded.');
    console.log('🎉 Neon Cloud DB Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
