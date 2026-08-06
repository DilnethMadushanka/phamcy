import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  Banknote,
  Globe,
  Tag,
  AlertCircle,
  Camera,
  Pill,
} from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import BarcodeScanner from '../components/BarcodeScanner';

const POS = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Camera barcode scanner
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Invoice modal after sale
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Shared barcode lookup
  const lookupAndAddBarcode = (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const found = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase()) ||
        (p.batch_number && p.batch_number.toLowerCase() === trimmed.toLowerCase())
    );

    if (found) {
      addToCart(found);
      setErrorMsg('');
      return true;
    } else {
      setErrorMsg(`No product found matching barcode/batch "${trimmed}"`);
      return false;
    }
  };

  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (lookupAndAddBarcode(barcodeInput)) {
        setBarcodeInput('');
      }
    }
  };

  const handleCameraScan = (scannedCode) => {
    setShowCameraScanner(false);
    lookupAndAddBarcode(scannedCode);
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      setErrorMsg(`"${product.product_name}" is currently out of stock!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock_quantity) {
          setErrorMsg(`Cannot add more "${product.product_name}". Max stock: ${product.stock_quantity}.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    setErrorMsg('');
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock_quantity) {
              setErrorMsg(`Stock limit: ${item.product.stock_quantity} for "${item.product.product_name}"`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setErrorMsg('');
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.generic_name && p.generic_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.batch_number && p.batch_number.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.product.selling_price) * item.quantity,
    0
  );
  const discountAmount = Math.min(subtotal, parseFloat(discount || 0));
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const salePayload = {
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        discount: discountAmount,
        payment_method: paymentMethod,
      };
      const res = await api.createSale(salePayload);
      setCompletedSale(res.sale);
      clearCart();
      loadProducts();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to process sale');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {showCameraScanner && (
        <BarcodeScanner
          onResult={handleCameraScan}
          onClose={() => setShowCameraScanner(false)}
        />
      )}

      <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-6 font-sans max-w-7xl mx-auto">
        {/* LEFT: Product Selector */}
        <div className="flex-1 flex flex-col space-y-4 min-w-0">
          {/* Controls Bar */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeKeyDown}
                  placeholder="Scan barcode / batch # (Press Enter)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-full text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                onClick={() => setShowCameraScanner(true)}
                title="Scan via Camera"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Cam Scan</span>
              </button>
            </div>

            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search brand or generic name..."
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-full text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-blue-100 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-blue-50/70 text-slate-700 hover:bg-blue-100/70'
              }`}
            >
              All Medicines
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  String(selectedCategory) === String(cat.id)
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'bg-blue-50/70 text-slate-700 hover:bg-blue-100/70'
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 bg-gradient-to-br from-blue-50/40 via-sky-50/20 to-white rounded-2xl p-4 border border-blue-100 overflow-y-auto min-h-[300px] custom-scrollbar shadow-inner">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-semibold">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span>Loading medicine database...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-12 space-y-2">
                <Search className="w-8 h-8 opacity-30 text-slate-400" />
                <p>No products match your search or filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock_quantity <= 0;
                  const isLowStock = prod.stock_quantity > 0 && prod.stock_quantity <= prod.minimum_threshold;

                  return (
                    <button
                      key={prod.id}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(prod)}
                      className={`text-left bg-white/95 p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative group cursor-pointer ${
                        isOutOfStock
                          ? 'opacity-60 border-slate-200 cursor-not-allowed'
                          : 'border-blue-100 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {prod.category?.category_name || 'General'}
                          </span>
                          {isLowStock && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                              Low
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors">
                          {prod.product_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 font-medium">
                          {prod.generic_name}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-blue-900">
                            Rs. {parseFloat(prod.selling_price).toFixed(2)}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-normal">
                            Batch: {prod.batch_number || 'REG'}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isOutOfStock ? 'Out' : `${prod.stock_quantity} left`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Billing Panel */}
        <div className="w-full lg:w-96 bg-white/95 rounded-2xl border border-blue-100 shadow-md flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-blue-300" />
              <h3 className="font-black text-white text-sm">Active Bill</h3>
              {cart.length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-blue-200 hover:text-white font-bold transition-colors cursor-pointer">
                Clear Cart
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mx-4 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 p-4 overflow-y-auto divide-y divide-slate-100 space-y-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6 space-y-2">
                <ShoppingCart className="w-10 h-10 text-blue-200" />
                <p className="font-bold text-xs text-slate-800">Cart is Empty</p>
                <p className="text-[11px] text-slate-500">Tap product or scan barcode to add items to bill.</p>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{product.product_name}</h4>
                    <p className="text-[11px] font-extrabold text-blue-600">Rs. {parseFloat(product.selling_price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-blue-50 rounded-full p-0.5 border border-blue-100">
                      <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full text-slate-700 transition-colors cursor-pointer">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-black text-xs text-slate-900">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full text-slate-700 transition-colors cursor-pointer">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Billing & Checkout */}
          <div className="p-4 bg-gradient-to-br from-blue-50/60 via-sky-50/40 to-white border-t border-blue-100 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Discount (Rs.)</span>
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 px-2 py-1 text-right bg-white border border-blue-200 rounded-lg font-bold text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-blue-100">
                <span>Total Due</span>
                <span className="text-blue-700 font-black">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Cash', label: 'Cash', icon: Banknote },
                  { id: 'Card', label: 'Card', icon: CreditCard },
                  { id: 'Online', label: 'Online', icon: Globe },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center space-y-1 border transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-700 shadow-sm'
                          : 'bg-white text-slate-700 border-blue-100 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              disabled={cart.length === 0 || submitting}
              onClick={handleCheckout}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold rounded-full shadow-md shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-[0.98] text-xs cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Processing...' : 'Complete & Print Invoice'}</span>
            </button>
          </div>
        </div>

        <InvoiceModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      </div>
    </>
  );
};

export default POS;
