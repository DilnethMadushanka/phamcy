import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Pill,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Filter,
  Camera,
  Barcode,
} from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';

const Inventory = () => {
  const { isPharmacist, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    generic_name: '',
    category_id: '',
    supplier_id: '',
    batch_number: '',
    expiry_date: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    minimum_threshold: '10',
    barcode: '',
    image_url: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, supps] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSuppliers(),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setSuppliers(Array.isArray(supps) ? supps : []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditProduct(product);
      setFormData({
        product_name: product.product_name,
        generic_name: product.generic_name,
        category_id: product.category_id,
        supplier_id: product.supplier_id || '',
        batch_number: product.batch_number,
        expiry_date: product.expiry_date,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock_quantity: product.stock_quantity,
        minimum_threshold: product.minimum_threshold,
        barcode: product.barcode || '',
        image_url: product.image_url || '',
      });
    } else {
      setEditProduct(null);
      setFormData({
        product_name: '',
        generic_name: '',
        category_id: categories[0]?.id || '',
        supplier_id: '',
        batch_number: `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        expiry_date: '',
        purchase_price: '',
        selling_price: '',
        stock_quantity: '',
        minimum_threshold: '10',
        barcode: '',
        image_url: '',
      });
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editProduct) {
        await api.updateProduct(editProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save product record');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine product?')) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);

    let matchesStock = true;
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    const expDate = new Date(p.expiry_date);

    if (stockFilter === 'low_stock') {
      matchesStock = p.stock_quantity <= p.minimum_threshold;
    } else if (stockFilter === 'near_expiry') {
      matchesStock = expDate >= today && expDate <= threeMonthsLater;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <Pill className="w-7 h-7 text-blue-300" />
            <span>Medicine Inventory &amp; Batch Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium max-w-2xl">
            Monitor product stock levels, batch numbers, expiration dates, and pharmaceutical pricing.
          </p>
        </div>

        {isPharmacist && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold px-6 py-3 rounded-full text-xs shadow-lg shadow-blue-500/30 flex items-center space-x-2 transition-all active:scale-95 border border-blue-400/30 shrink-0 cursor-pointer relative z-10"
          >
            <Plus className="w-4 h-4 text-blue-200" />
            <span>Add New Medicine</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brand, generic, batch..."
            className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-full text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-blue-50/70 border border-blue-200 rounded-full px-4 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>

          <div className="flex bg-blue-50/70 p-1 rounded-full space-x-1 text-xs font-bold border border-blue-100">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                stockFilter === 'all' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-blue-800'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setStockFilter('low_stock')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1 cursor-pointer ${
                stockFilter === 'low_stock' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock</span>
            </button>
            <button
              onClick={() => setStockFilter('near_expiry')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1 cursor-pointer ${
                stockFilter === 'near_expiry' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Near Expiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/95 rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading medicine inventory database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold">
            No medicine records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 text-blue-900 font-extrabold uppercase tracking-wider border-b border-blue-100">
                <tr>
                  <th className="px-6 py-4">Medicine Name &amp; Formula</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Batch #</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Prices (Buy / Sell)</th>
                  <th className="px-6 py-4 text-center">Stock Level</th>
                  {isPharmacist && <th className="px-6 py-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const isLowStock = prod.stock_quantity <= prod.minimum_threshold;
                  const today = new Date();
                  const threeMonthsLater = new Date();
                  threeMonthsLater.setMonth(today.getMonth() + 3);
                  const expDate = new Date(prod.expiry_date);
                  const isExpired = expDate < today;
                  const isNearExpiry = expDate >= today && expDate <= threeMonthsLater;

                  return (
                    <tr key={prod.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">{prod.product_name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{prod.generic_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          {prod.category?.category_name || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] font-semibold text-slate-700">
                        {prod.batch_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs font-semibold ${isExpired ? 'text-rose-600 font-bold' : isNearExpiry ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                            {prod.expiry_date}
                          </span>
                          {isExpired && <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">Expired</span>}
                          {isNearExpiry && !isExpired && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-bold">Near</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-blue-900">${parseFloat(prod.selling_price).toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">Buy: ${parseFloat(prod.purchase_price || 0).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                          prod.stock_quantity <= 0
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {prod.stock_quantity <= 0 ? 'Out of Stock' : `${prod.stock_quantity} in stock`}
                        </span>
                      </td>
                      {isPharmacist && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleOpenModal(prod)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                {editProduct ? 'Edit Medicine Record' : 'Register New Medicine'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full p-2 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                ⚠ {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Product / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Generic / Formula Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.generic_name}
                    onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                    placeholder="e.g. Acetaminophen"
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Supplier</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Supplier (Optional)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-extrabold text-blue-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Initial Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="100"
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Minimum Alert Threshold</label>
                  <input
                    type="number"
                    value={formData.minimum_threshold}
                    onChange={(e) => setFormData({ ...formData, minimum_threshold: e.target.value })}
                    placeholder="10"
                    className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-full text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-full text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
