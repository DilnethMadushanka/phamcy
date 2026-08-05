const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { sequelize, Product, Category, Supplier } = require('../models');

async function addMoreProducts() {
  try {
    console.log('🔗 Connecting to Neon Cloud DB...');
    await sequelize.authenticate();
    console.log('✅ Connected!');

    const categories = await Category.findAll();
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.category_name] = c.id;
    });

    const suppliers = await Supplier.findAll();
    const supplierId = suppliers[0] ? suppliers[0].id : 1;

    const futureDate = (months) => {
      const d = new Date();
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0];
    };

    const newProducts = [
      {
        product_name: 'Vitamin C 1000mg Effervescent (Redoxon)',
        generic_name: 'Ascorbic Acid & Zinc',
        category_id: categoryMap['General Medicines'] || 1,
        supplier_id: supplierId,
        batch_number: 'BATCH-VIT-2026',
        expiry_date: futureDate(24),
        purchase_price: 3.50,
        selling_price: 7.99,
        stock_quantity: 120,
        minimum_threshold: 25,
        barcode: '890123456711',
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Omeprazole 20mg Acid Relief',
        generic_name: 'Omeprazole',
        category_id: categoryMap['General Medicines'] || 1,
        supplier_id: supplierId,
        batch_number: 'BATCH-OMP-09',
        expiry_date: futureDate(18),
        purchase_price: 4.20,
        selling_price: 9.50,
        stock_quantity: 90,
        minimum_threshold: 20,
        barcode: '890123456712',
        image_url: 'https://images.unsplash.com/photo-1550572017-edb79361a9fb?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Cetirizine 10mg Allergy Relief (Zyrtec)',
        generic_name: 'Cetirizine Hydrochloride',
        category_id: categoryMap['General Medicines'] || 1,
        supplier_id: supplierId,
        batch_number: 'BATCH-ALG-33',
        expiry_date: futureDate(20),
        purchase_price: 2.90,
        selling_price: 6.50,
        stock_quantity: 110,
        minimum_threshold: 30,
        barcode: '890123456713',
        image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'La Roche-Posay Anthelios SPF 50+ Sunscreen',
        generic_name: 'Broad Spectrum UV Shield',
        category_id: categoryMap['Skin Care'] || 2,
        supplier_id: supplierId,
        batch_number: 'BATCH-LRP-50',
        expiry_date: futureDate(30),
        purchase_price: 14.00,
        selling_price: 24.99,
        stock_quantity: 40,
        minimum_threshold: 10,
        barcode: '890123456714',
        image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'The Ordinary Niacinamide 10% Serum 30ml',
        generic_name: 'Niacinamide + Zinc 1%',
        category_id: categoryMap['Skin Care'] || 2,
        supplier_id: supplierId,
        batch_number: 'BATCH-ORD-10',
        expiry_date: futureDate(24),
        purchase_price: 6.50,
        selling_price: 11.99,
        stock_quantity: 65,
        minimum_threshold: 15,
        barcode: '890123456715',
        image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Oral-B Pro-Expert Dental Floss 50m',
        generic_name: 'Mint Waxed Dental Ribbon',
        category_id: categoryMap['Dental Care'] || 3,
        supplier_id: supplierId,
        batch_number: 'BATCH-ORB-50',
        expiry_date: futureDate(36),
        purchase_price: 1.80,
        selling_price: 3.99,
        stock_quantity: 85,
        minimum_threshold: 20,
        barcode: '890123456716',
        image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Vaseline Essential Healing Body Lotion 400ml',
        generic_name: 'Micro-droplets Petroleum Jelly Lotion',
        category_id: categoryMap['Beauty & Cosmetics'] || 4,
        supplier_id: supplierId,
        batch_number: 'BATCH-VAS-40',
        expiry_date: futureDate(24),
        purchase_price: 3.50,
        selling_price: 7.49,
        stock_quantity: 75,
        minimum_threshold: 15,
        barcode: '890123456717',
        image_url: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Aptamil Gold+ Infant Formula Stage 1 900g',
        generic_name: 'Premium Infant Nutrition Formula',
        category_id: categoryMap['Baby Care'] || 5,
        supplier_id: supplierId,
        batch_number: 'BATCH-APT-90',
        expiry_date: futureDate(18),
        purchase_price: 18.00,
        selling_price: 29.99,
        stock_quantity: 30,
        minimum_threshold: 8,
        barcode: '890123456718',
        image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Johnson’s Baby Gentle Bedtime Lotion 500ml',
        generic_name: 'NaturalCalm Aromas Baby Lotion',
        category_id: categoryMap['Baby Care'] || 5,
        supplier_id: supplierId,
        batch_number: 'BATCH-JNJ-50',
        expiry_date: futureDate(24),
        purchase_price: 4.00,
        selling_price: 8.50,
        stock_quantity: 60,
        minimum_threshold: 15,
        barcode: '890123456719',
        image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Digital Non-Contact Infrared Thermometer',
        generic_name: 'Medical Grade Temperature Sensor',
        category_id: categoryMap['Surgical / First Aid'] || 6,
        supplier_id: supplierId,
        batch_number: 'BATCH-THM-01',
        expiry_date: futureDate(48),
        purchase_price: 12.00,
        selling_price: 24.50,
        stock_quantity: 25,
        minimum_threshold: 5,
        barcode: '890123456720',
        image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Dettol Antiseptic Disinfectant Liquid 500ml',
        generic_name: 'Chloroxylenol Antiseptic Solution',
        category_id: categoryMap['Surgical / First Aid'] || 6,
        supplier_id: supplierId,
        batch_number: 'BATCH-DET-50',
        expiry_date: futureDate(36),
        purchase_price: 3.80,
        selling_price: 7.99,
        stock_quantity: 90,
        minimum_threshold: 20,
        barcode: '890123456721',
        image_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=800',
      },
      {
        product_name: 'Band-Aid Tough Strips Waterproof 20s',
        generic_name: 'Heavy Duty Adhesive Bandages',
        category_id: categoryMap['Surgical / First Aid'] || 6,
        supplier_id: supplierId,
        batch_number: 'BATCH-BND-20',
        expiry_date: futureDate(48),
        purchase_price: 2.20,
        selling_price: 4.99,
        stock_quantity: 100,
        minimum_threshold: 25,
        barcode: '890123456722',
        image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=800',
      },
    ];

    const created = await Product.bulkCreate(newProducts);
    console.log(`🎉 Successfully added ${created.length} new products to Neon Cloud DB!`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to add products:', err);
    process.exit(1);
  }
}

addMoreProducts();
