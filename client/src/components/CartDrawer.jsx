import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShoppingBag, X, Plus, Minus, Trash2, ArrowRight,
  CreditCard, Landmark, DollarSign, Upload, FileText, CheckCircle2, ShieldCheck,
  Scan, Camera, Sparkles, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, setShowAuthModal, setAuthModalMode } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'CARD' | 'BANK'
  const [loading, setLoading] = useState(false);

  // Barcode Scanner State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Online Card Mock State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Bank Transfer Receipt State
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');

  // Coupon Code State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const VALID_COUPONS = { 'SAVE10': 10, 'FOUAD15': 15, 'RX20': 20, 'FIRST5': 5 };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      setCouponDiscount(VALID_COUPONS[code]);
      setCouponApplied(code);
      toast.success(`✅ Coupon "${code}" applied! ${VALID_COUPONS[code]}% discount activated.`);
    } else {
      toast.error('Invalid coupon code. Try: SAVE10, FOUAD15, RX20, FIRST5');
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setCouponApplied('');
    setCouponCode('');
    toast('Coupon removed.', { icon: '🗑️' });
  };


  const navigate = useNavigate();

  // Known sample database barcodes for quick testing
  const sampleBarcodes = [
    { code: '890123456701', name: 'Paracetamol 500mg', price: 8.50 },
    { code: '890123456702', name: 'Amoxicillin 250mg', price: 12.00 },
    { code: '890123456705', name: 'CeraVe Facial Lotion', price: 18.99 },
    { code: '890123456708', name: 'Nivea Soft Cream', price: 5.50 },
  ];

  // Barcode lookup and instant add
  const handleBarcodeSubmit = async (codeToLookup) => {
    const targetCode = (codeToLookup || barcodeInput).trim();
    if (!targetCode) {
      toast.error('Please enter or scan a barcode.');
      return;
    }

    setIsScanning(true);
    try {
      // 1. Check local catalog / sample list
      const matchedSample = sampleBarcodes.find(b => b.code === targetCode);
      let foundProduct = null;

      // 2. Fetch live products from DB to match barcode
      try {
        const dbRes = await api.getProducts();
        const productList = Array.isArray(dbRes) ? dbRes : (dbRes.products || []);
        foundProduct = productList.find(p => String(p.barcode) === targetCode || String(p.id) === targetCode);
      } catch (err) {
        console.warn('DB search failed, using fallback:', err);
      }

      if (foundProduct) {
        addToCart(foundProduct, 1);
        toast.success(`📷 Barcode Scanned: Added "${foundProduct.product_name || foundProduct.name}" to cart!`);
        setBarcodeInput('');
      } else if (matchedSample) {
        addToCart({
          id: matchedSample.code,
          product_name: matchedSample.name,
          selling_price: matchedSample.price,
          volume: '1 Unit',
          image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
        }, 1);
        toast.success(`📷 Scanned: Added "${matchedSample.name}" ($${matchedSample.price})`);
        setBarcodeInput('');
      } else {
        // Create dynamic product for custom barcodes
        addToCart({
          id: `barcode-${targetCode}`,
          product_name: `Scanned Product (${targetCode})`,
          selling_price: 15.00,
          volume: 'Scanned Item',
          image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
        }, 1);
        toast.success(`📷 Custom Barcode "${targetCode}" added to cart!`);
        setBarcodeInput('');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(file);
        setReceiptPreview(reader.result);
        toast.success('Bank transfer slip attached successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Guard: require login before placing order
    if (!user) {
      setIsCartOpen(false);
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }

    if (!deliveryAddress.trim()) {

      toast.error('Please enter your delivery address.');
      return;
    }

    if (paymentMethod === 'BANK' && !receiptPreview) {
      toast.error('Please upload your bank transfer receipt slip before placing order.');
      return;
    }

    setLoading(true);
    try {
      let finalRxUrl = null;
      if (receiptPreview) {
        finalRxUrl = receiptPreview;
      }

      let paymentDetailsStr = paymentMethod;
      if (paymentMethod === 'COD') paymentDetailsStr = 'Cash on Delivery';
      if (paymentMethod === 'CARD') paymentDetailsStr = 'Online Card Payment (Visa/Mastercard)';
      if (paymentMethod === 'BANK') paymentDetailsStr = 'Bank Transfer (Slip Attached)';

      await api.createOrder({
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        delivery_address: deliveryAddress,
        payment_method: paymentDetailsStr,
        prescription_image_url: finalRxUrl,
        notes: paymentMethod === 'CARD' ? `Card Paid via Mock Gateway (•••• 4242)` : '',
      });

      clearCart();
      setDeliveryAddress('');
      setReceiptPreview('');
      setIsCartOpen(false);
      toast.success('🎉 Order placed successfully! Check Live Tracking in My Orders.');
      navigate('/my-orders');
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err?.message || 'Order creation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-200 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">Your Shopping Cart</h2>
                  <p className="text-[10px] text-blue-200 font-semibold">{cart.length} unique items</p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-blue-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Scroll Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-xs">
                    Scan a product barcode above or browse our pharmacy collection to add items.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl relative"
                  >
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product_name}
                      className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-black truncate">{item.product_name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.volume || '1 Unit'}</p>
                      <p className="text-xs font-black text-black mt-1">${(item.selling_price * item.quantity).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Checkout & Payment Methods */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4">
                {/* Total Summary */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal Amount</span>
                  <span className="text-lg font-black text-black">${cartTotal.toFixed(2)}</span>
                </div>

                {/* Delivery Address Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-black uppercase tracking-wider">
                    Delivery Destination Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter campus room, hall or delivery address..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                  />
                </div>

                {/* Payment Gateway Options */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-black uppercase tracking-wider block">
                    Choose Payment Method
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'COD'
                          ? 'border-black bg-black text-white shadow-xs font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 mx-auto mb-0.5" />
                      <span className="text-[9px] font-extrabold block">COD Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'CARD'
                          ? 'border-black bg-black text-white shadow-xs font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-0.5" />
                      <span className="text-[9px] font-extrabold block">Visa / Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'BANK'
                          ? 'border-black bg-black text-white shadow-xs font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Landmark className="w-4 h-4 mx-auto mb-0.5" />
                      <span className="text-[9px] font-extrabold block">Bank Slip</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Gateway UI */}
                {paymentMethod === 'CARD' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <span>Mock Visa/Mastercard Gateway Active</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Card Number</span>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-2.5 py-1 bg-slate-50 border rounded text-xs font-mono font-bold text-black"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'BANK' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                    <div className="text-[10px] font-extrabold text-black border-b pb-1">
                      Commercial Bank • Acc: 8009492019 (Fouad Pharmacies)
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                        Upload Transfer Deposit Slip PDF/Image *
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        className="text-[10px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-black hover:file:bg-slate-200"
                      />
                    </div>
                  </div>
                )}

                {/* Coupon Code Field */}
                <div className="border border-dashed border-rose-200 bg-rose-50/50 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    🎟 Coupon Code
                  </span>
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <span className="text-xs font-extrabold text-emerald-700">✅ {couponApplied} — {couponDiscount}% OFF applied!</span>
                      <button onClick={removeCoupon} className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. SAVE10 / FOUAD15"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="px-3 py-2 bg-black text-white text-[10px] font-extrabold rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>Discount ({couponDiscount}%)</span>
                      <span>-${(cartTotal * couponDiscount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Delivery</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-black text-black">
                    <span>Total</span>
                    <span>${(cartTotal * (1 - couponDiscount / 100)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Submit Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full py-3.5 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Checkout — ${(cartTotal * (1 - couponDiscount / 100)).toFixed(2)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CartDrawer;
