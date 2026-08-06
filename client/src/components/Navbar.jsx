import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDarkMode } from '../context/DarkModeContext';
import { api } from '../services/api';
import {
  Search, User, Heart, ShoppingBag, LogOut, ArrowRightLeft,
  QrCode, Scan, Camera, Plus, Bell, Moon, Sun, X, Headphones
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, setShowAuthModal, setAuthModalMode } = useAuth();
  const { cartCount, setIsCartOpen, addToCart } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { isDark, toggleDark } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Live search autocomplete
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showSearchDrop, setShowSearchDrop] = useState(false);

  // Notification bell
  const [notifications, setNotifications] = useState([
    { id: 1, icon: '🎁', msg: 'New Arrivals: CeraVe & COSRX Korean Skincare added!', time: '2 min ago', unread: true },
    { id: 2, icon: '🚚', msg: 'Order #42 is Out for Delivery!', time: '15 min ago', unread: true },
    { id: 3, icon: '⭐', msg: 'Your review on Vitamin C was published.', time: '1 hr ago', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        const list = Array.isArray(data) ? data : (data.products || []);
        setAllProducts(list);
      } catch (_) {}
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const matched = allProducts
        .filter((p) =>
          (p.product_name || p.name || '').toLowerCase().includes(q) ||
          (p.category?.category_name || '').toLowerCase().includes(q)
        )
        .slice(0, 6);
      setSearchResults(matched);
      setShowSearchDrop(matched.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDrop(false);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sampleBarcodes = [
    { code: '890123456701', name: 'Paracetamol 500mg (Panadol)', price: 8.50 },
    { code: '890123456702', name: 'Amoxicillin 250mg Capsules', price: 12.00 },
    { code: '890123456705', name: 'CeraVe Hydrating Facial Lotion', price: 18.99 },
    { code: '890123456708', name: 'Nivea Soft Refreshing Cream', price: 5.50 },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchModal(false);
      setShowSearchDrop(false);
      navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleProductClick = (prod) => {
    setShowSearchModal(false);
    setShowSearchDrop(false);
    setSearchQuery('');
    navigate(`/store?search=${encodeURIComponent(prod.product_name || prod.name)}`);
  };

  const handleBarcodeScan = async (codeToLookup) => {
    const targetCode = (codeToLookup || barcodeQuery).trim();
    if (!targetCode) { toast.error('Please enter or scan a barcode number.'); return; }

    setIsScanning(true);
    try {
      let foundProduct = null;
      try {
        const dbRes = await api.getProducts();
        const productList = Array.isArray(dbRes) ? dbRes : (dbRes.products || []);
        foundProduct = productList.find((p) => String(p.barcode) === targetCode || String(p.id) === targetCode);
      } catch (_) {}

      const sampleMatch = sampleBarcodes.find((b) => b.code === targetCode);

      if (foundProduct) {
        addToCart(foundProduct, 1);
        toast.success(`📷 Added "${foundProduct.product_name || foundProduct.name}" to cart!`);
      } else if (sampleMatch) {
        addToCart({ id: sampleMatch.code, product_name: sampleMatch.name, selling_price: sampleMatch.price, volume: '1 Unit', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' }, 1);
        toast.success(`📷 Scanned: Added "${sampleMatch.name}" (Rs. ${sampleMatch.price})`);
      } else {
        addToCart({ id: `barcode-${targetCode}`, product_name: `Scanned Item (${targetCode})`, selling_price: 15.00, volume: 'Scanned Item', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' }, 1);
        toast.success(`📷 Barcode "${targetCode}" added to cart!`);
      }
      setShowBarcodeModal(false);
      setIsCartOpen(true);
      setBarcodeQuery('');
    } finally {
      setIsScanning(false);
    }
  };

  const menuItems = [
    { name: 'HOME', category: 'all' },
    { name: 'BRAND', category: 'Brand' },
    { name: 'KOREAN PRODUCTS', category: 'Korean Products' },
    { name: 'BUNDLES', category: 'Bundles' },
    { name: 'WELLNESS', category: 'Wellness' },
    { name: 'MAKEUP & MORE', category: 'Makeup & More' },
    { name: 'VITAMINS & SUPPLEMENTS', category: 'Vitamins & Supplements' },
    { name: 'KIDS CARE', category: 'Kids Care' },
    { name: 'BODY CARE', category: 'Body Care' },
    { name: 'HAIR CARE', category: 'Hair Care' },
    { name: 'SKIN CARE', category: 'Skin Care' },
  ];

  const handleMenuClick = (item, e) => {
    e.preventDefault();
    if (item.category === 'all') {
      navigate('/store');
    } else {
      navigate(`/store?category=${encodeURIComponent(item.category)}`);
    }
    setTimeout(() => {
      const el = document.getElementById('products-section') || document.getElementById('category-cards-row');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-50/95 via-sky-50/90 to-indigo-50/95 backdrop-blur-md border-b border-blue-200/60 sticky top-0 z-50 font-sans shadow-xs">
        {/* Top Control Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Search Button */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer rounded-full hover:bg-blue-100/60"
                title="Search Products"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>

            {/* Live Chat Support Button */}
            <button
              onClick={() => window.dispatchEvent(new Event('open-live-chat'))}
              className="p-2 text-blue-800 hover:text-blue-900 bg-gradient-to-r from-sky-400/20 via-blue-500/20 to-indigo-500/20 hover:from-sky-400/30 hover:to-indigo-500/30 rounded-full border border-blue-300/80 transition-all cursor-pointer flex items-center gap-1.5 px-3 shadow-2xs hover:scale-105 active:scale-95"
              title="Live Pharmacist Chat Support"
            >
              <Headphones className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="hidden sm:inline text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Live Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => {
                if (user) navigate('/profile');
                else { setAuthModalMode('login'); setShowAuthModal(true); }
              }}
              className="p-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer rounded-full hover:bg-blue-100/60"
              title={user ? `${user.name} (Profile)` : 'Sign In / Register'}
            >
              <User className="w-5 h-5 stroke-[1.75]" />
            </button>

            {user && (
              <button
                onClick={() => navigate(user.role === 'Customer' ? '/profile' : '/dashboard')}
                className="hidden sm:flex items-center text-[10px] font-extrabold text-blue-700 bg-white/80 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                <span>{user.role === 'Customer' ? 'My Profile' : `${user.role} Portal`}</span>
              </button>
            )}
          </div>

          {/* Center Logo */}
          <div onClick={() => navigate('/store')} className="flex flex-col items-center cursor-pointer select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center font-black text-white text-base shadow-md mb-0.5">
              F
            </div>
            <span className="font-serif font-black tracking-[0.25em] bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 bg-clip-text text-transparent text-sm sm:text-base leading-none uppercase">FOUAD</span>
            <span className="text-[9px] font-sans font-extrabold tracking-[0.35em] text-blue-600 uppercase mt-0.5">PHARMACIES</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer rounded-full hover:bg-blue-100/60"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="p-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer relative rounded-full hover:bg-blue-100/60"
                title="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[1.75]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-black uppercase tracking-wider">Notifications</span>
                      <button
                        onClick={() => {
                          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                          setShowNotifications(false);
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 flex gap-3 items-start border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors ${notif.unread ? 'bg-rose-50/40' : ''}`}
                        onClick={() => setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, unread: false } : n))}
                      >
                        <span className="text-lg">{notif.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{notif.msg}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{notif.time}</p>
                        </div>
                        {notif.unread && <span className="w-2 h-2 bg-rose-500 rounded-full mt-1 shrink-0" />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer relative rounded-full hover:bg-blue-100/60"
              title="Saved Favorites"
            >
              <Heart className={`w-5 h-5 stroke-[1.75] ${wishlistCount > 0 ? 'text-blue-600 fill-blue-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer relative rounded-full hover:bg-blue-100/60"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {user && (
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-full hover:bg-rose-50"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 stroke-[1.75]" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Navigation Menu */}
        <div className="border-t border-blue-200/50 bg-blue-50/60 backdrop-blur-md overflow-x-auto py-2.5">
          <nav className="flex items-center justify-center space-x-2 sm:space-x-3 text-[10.5px] font-bold text-blue-950 uppercase tracking-wider whitespace-nowrap max-w-7xl mx-auto px-4">
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.name}>
                <a
                  href={`/store?category=${encodeURIComponent(item.category)}`}
                  onClick={(e) => handleMenuClick(item, e)}
                  className="hover:text-blue-600 transition-colors py-1 px-1.5 cursor-pointer font-extrabold active:scale-95"
                >
                  {item.name}
                </a>
                {idx < menuItems.length - 1 && <span className="text-blue-200 font-light select-none">|</span>}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </header>

      {/* ── LIVE SEARCH MODAL WITH AUTOCOMPLETE ── */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 font-sans"
            onClick={(e) => e.target === e.currentTarget && setShowSearchModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Search Products</h3>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="ml-auto text-slate-400 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search CeraVe, Vitamin C, Korean serum..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-black focus:outline-none focus:border-black"
                />

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showSearchDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-10"
                    >
                      {searchResults.map((prod) => (
                        <button
                          key={prod.id || prod.product_id}
                          type="button"
                          onClick={() => handleProductClick(prod)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <img
                            src={prod.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100&q=60'}
                            alt={prod.product_name}
                            className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-black truncate">{prod.product_name || prod.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{prod.category?.category_name || 'Pharmacy'}</p>
                          </div>
                          <span className="text-xs font-black text-black shrink-0">
                            Rs. {Number(prod.selling_price || prod.price || 0).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
