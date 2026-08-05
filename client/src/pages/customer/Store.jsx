import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Search, ShoppingBag, Plus, Minus, X, Pill, Star, Info,
  Truck, Shield, Heart, Sparkles, ChevronLeft, ChevronRight, Upload,
  Gift, Tag, Flame, CheckCircle, Clock, ArrowUp, Send, Check, ArrowRight, Filter,
  MessageSquare, User, ThumbsUp, MessageCircle, Headphones
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

// Reliable image fallback
const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
};

// ─── Benefits Helper ───
const getBenefitsInfo = (product) => {
  return {
    uses: `${product?.product_name || 'This wellness product'} provides targeted hydration and dermatological care.`,
    benefits: [
      'Clinically formulated active ingredients',
      'Dermatologically tested for all skin types',
      'Paraben & sulfate free formula',
      '100% authentic pharmacy guaranteed',
    ],
  };
};

// ─── Product Detail Modal ───
const ProductDetailModal = ({ product, allProducts = [], onClose, onSelectProduct }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, setShowAuthModal, setAuthModalMode } = useAuth();
  const [qty, setQty] = useState(1);
  const info = getBenefitsInfo(product);
  const prodId = product.id || product.product_id;
  const isSaved = isInWishlist(prodId);

  // Related products (same category, exclude current)
  const related = allProducts
    .filter((p) => {
      const pid = p.id || p.product_id;
      const sameCat = (p.category?.category_name || '') === (product.category?.category_name || '');
      return pid !== prodId && sameCat;
    })
    .slice(0, 4);

  const requireAuthModal = () => {
    if (!user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      onClose();
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!requireAuthModal()) return;
    addToCart(product, qty);
    onClose();
  };

  const handleToggleWishlist = () => {
    if (!requireAuthModal()) return;
    toggleWishlist(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 border border-slate-100 space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-100 hover:bg-slate-200 text-black rounded-full flex items-center justify-center font-bold cursor-pointer"
        >
          ✕
        </button>

        {/* Product Overview Header */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="sm:w-56 h-56 bg-slate-50 rounded-2xl flex items-center justify-center p-4 shrink-0 relative">
            <button
              onClick={() => handleToggleWishlist()}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all cursor-pointer z-10"
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'text-rose-600 fill-rose-500' : 'text-slate-400'}`} />
            </button>
            <img src={product.image_url} onError={handleImageError} alt={product.product_name} className="max-h-full max-w-full object-contain" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.volume || '20ml'}
                </span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9 / 5.0 (Dermatologist Approved)
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-black mt-2">{product.product_name}</h2>
            </div>

            <div className="text-2xl font-black text-black">
              ${Number(product.selling_price || 23.95).toFixed(2)}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <p className="text-slate-600 font-medium">{info.uses}</p>
              <ul className="space-y-1">
                {info.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-black font-semibold">
                    <span className="w-3 h-3 rounded-full bg-black text-white text-[8px] flex items-center justify-center">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rating Breakdown Bar */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold text-black uppercase tracking-wider">Customer Ratings</span>
                <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 / 5.0
                </span>
              </div>
              {[{ stars: 5, pct: 78 }, { stars: 4, pct: 14 }, { stars: 3, pct: 5 }, { stars: 2, pct: 2 }, { stars: 1, pct: 1 }].map((r) => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-slate-500 w-5 shrink-0">{r.stars}★</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 w-6 text-right">{r.pct}%</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 border border-slate-200">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full font-bold text-black cursor-pointer">-</button>
                <span className="w-6 text-center font-bold text-xs">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full font-bold text-black cursor-pointer">+</button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 py-3 bg-black hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart — ${(Number(product.selling_price || 23.95) * qty).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {related.length > 0 && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-xs font-extrabold text-black uppercase tracking-wider">✨ You May Also Like</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {related.map((rp) => (
                <button
                  key={rp.id || rp.product_id}
                  type="button"
                  onClick={() => onSelectProduct && onSelectProduct(rp)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all min-w-[120px] shrink-0 text-left"
                >
                  <img
                    src={rp.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=60'}
                    onError={handleImageError}
                    alt={rp.product_name}
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                  <div className="w-full">
                    <p className="text-[10px] font-extrabold text-black leading-snug truncate">{rp.product_name || rp.name}</p>
                    <p className="text-[10px] font-black text-rose-600">${Number(rp.selling_price || 0).toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Main Store Component ───
const Store = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist, setIsWishlistOpen } = useWishlist();
  const { user, setShowAuthModal, setAuthModalMode } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ── Auth-guard helper (shows login modal to guests) ──
  const requireAuth = () => {
    if (!user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return false;
    }
    return true;
  };
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ── Recently Viewed Products ──
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const trackRecentlyViewed = (product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => (p.id || p.product_id) !== (product.id || product.product_id));
      return [product, ...filtered].slice(0, 6);
    });
  };

  // ── Feedback Modal State ──
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Product Quality');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Jenkins',
      category: 'Pharmacist Support',
      rating: 5,
      date: 'Today',
      text: 'Extremely fast prescription verification and genuine botanical skincare products!',
    },
    {
      id: 2,
      name: 'Kasun Perera',
      category: 'Campus Delivery',
      rating: 5,
      date: 'Yesterday',
      text: 'Delivered directly to campus hall within 30 minutes! Great service.',
    },
  ]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // Guard: guests cannot submit feedback
    if (!requireAuth()) return;
    if (!feedbackName.trim() || !feedbackText.trim()) {
      toast.error('Please enter your name and feedback message.');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: feedbackName.trim(),
      category: feedbackCategory,
      rating: feedbackRating,
      date: 'Just now',
      text: feedbackText.trim(),
    };

    setFeedbackList([newItem, ...feedbackList]);
    setFeedbackName('');
    setFeedbackText('');
    setFeedbackRating(5);
    setIsFeedbackOpen(false);
    toast.success('Thank you! Your feedback has been submitted successfully ⭐');
  };

  // Newsletter State & Handler
  const [emailInput, setEmailInput] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [subscribedDiscount, setSubscribedDiscount] = useState(null);

  const handleNewsletterSubmit = async (e, customEmail = null) => {
    if (e) e.preventDefault();
    const targetEmail = (customEmail || emailInput).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setNewsletterLoading(true);
    try {
      const res = await api.subscribeNewsletter(targetEmail);
      toast.success(res.message || '🎉 Subscribed to VIP newsletter!');
      setSubscribedDiscount(res.discountCode || 'FOUADVIP10');
      setEmailInput('');
    } catch (err) {
      toast.error(err.message || 'Subscription failed. Please check your email.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const selectedCategory = searchParams.get('category') || '';
  const searchKeyword = searchParams.get('search') || searchParams.get('scan') || '';

  // ─── Hero Carousel State ───
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 0,
      tag: 'KOREAN BEAUTY & BOTANICAL ELIXIRS',
      title: 'AMBER HYDRATION & REPAIR ESSENCE',
      subtitle: 'Clinically formulated with 98% pure botanical extracts and hyaluronic acid for glowing, radiant skin.',
      image: '/hero_1.png',
      badge: 'BESTSELLER 2026',
    },
    {
      id: 1,
      tag: 'ORGANIC VITAMINS & DAILY WELLNESS',
      title: 'IMMUNE SUPPORT & VITALITY BLEND',
      subtitle: 'Essential daily multivitamins, zinc & omega-3 for maximum energy, immunity, and overall longevity.',
      image: '/hero_2.png',
      badge: 'NEW ARRIVAL',
    },
    {
      id: 2,
      tag: 'DERMATOLOGIST RECOMMENDED SKINCARE',
      title: 'CERAMIDE BARRIER REPAIR ROUTINE',
      subtitle: 'Clinically proven lipid & niacinamide complex to protect and restore natural skin moisture barrier.',
      image: '/hero_3.png',
      badge: 'PROMO 15% OFF',
    },
    {
      id: 3,
      tag: 'KOREAN GLASS SKIN CARE',
      title: 'SNAIL MUCIN & CENTELLA CALMING TONER',
      subtitle: 'Soothes redness, hydrates deeply, and delivers authentic glass skin glow in just 7 days.',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
      badge: 'K-BEAUTY TREND',
    },
    {
      id: 4,
      tag: 'MOTHER & KIDS HEALTH CARE',
      title: 'GENTLE DERMA CARE & CHEWABLE VITAMINS',
      subtitle: 'Pediatrician approved hypoallergenic lotions and chewable vitamins for growing kids and infants.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      badge: 'PEDIATRIC SAFE',
    },
    {
      id: 5,
      tag: 'HAIR REPAIR & SCALP NUTRITION',
      title: 'BIOTIN & KERATIN GROWTH OIL',
      subtitle: 'Nourishes scalp roots, reduces hair breakage, and stimulates thick healthy hair growth.',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
      badge: 'ORGANIC FORMULA',
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      if (Array.isArray(data)) {
        setDbProducts(data);
      } else if (data && Array.isArray(data.products)) {
        setDbProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const leftFeaturedProducts = [
    {
      id: 1,
      product_name: 'Hydrating Serum',
      volume: '20ml',
      selling_price: 23.95,
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      product_name: 'Peetry Vitality Formula',
      volume: '16ml',
      selling_price: 19.50,
      image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      product_name: 'Hydrating Cream',
      volume: '50ml',
      selling_price: 28.00,
      image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      product_name: 'Vitality Formula',
      volume: '30ml',
      selling_price: 32.40,
      image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const allCatalogProducts = dbProducts.length > 0 ? dbProducts : [
    ...leftFeaturedProducts,
    { id: 5, product_name: 'CeraVe Moisturizing Lotion', category: { category_name: 'Skin Care' }, volume: '236ml', selling_price: 18.50, image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80' },
    { id: 6, product_name: 'Organic Biotin Hair Growth Oil', category: { category_name: 'Hair Care' }, volume: '100ml', selling_price: 22.00, image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80' },
    { id: 7, product_name: 'Daily Vitamin C 1000mg', category: { category_name: 'Vitamins & Supplements' }, volume: '60 Tablets', selling_price: 15.90, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
    { id: 8, product_name: 'Korean Snail Mucin Gel', category: { category_name: 'Korean Products' }, volume: '100ml', selling_price: 25.00, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
  ];

  const filteredProducts = allCatalogProducts.filter((prod) => {
    const prodName = (prod.product_name || prod.name || '').toLowerCase();
    const catName = (prod.category?.category_name || prod.category_name || '').toLowerCase();

    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      if (!catName.includes(catLower) && !prodName.includes(catLower)) {
        if (catLower.includes('korean') && !prodName.includes('korean') && !catName.includes('korean')) return false;
        if (catLower.includes('hair') && !prodName.includes('hair') && !catName.includes('hair')) return false;
        if (catLower.includes('skin') && !prodName.includes('skin') && !catName.includes('skin')) return false;
        if (catLower.includes('vitamin') && !prodName.includes('vitamin') && !catName.includes('vitamin')) return false;
      }
    }

    if (searchKeyword) {
      const searchLower = searchKeyword.toLowerCase();
      if (!prodName.includes(searchLower) && !catName.includes(searchLower)) return false;
    }

    return true;
  });

  const clearCategoryFilter = () => {
    setSearchParams({});
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="top" className="space-y-10 pb-16 max-w-7xl mx-auto px-4 font-sans text-slate-900 relative">
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600 } }} />

      {/* ── FLOATING SIDEBAR BUTTONS (RIGHT EDGE) ── */}
      <div className="fixed right-0 top-1/3 z-40 flex flex-col items-end space-y-2 font-sans">
        {/* Saved Wishlist Sidebar Trigger */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-l-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:pl-4 group border-l border-blue-400/30"
          title="Open Saved Wishlist Sidebar"
        >
          <Heart className="w-5 h-5 fill-current text-white animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider hidden group-hover:inline">Saved Wishlist</span>
        </button>

        {/* Live Support Chat Trigger */}
        <button
          onClick={() => window.dispatchEvent(new Event('open-live-chat'))}
          className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white p-3 rounded-l-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:pl-4 group border-l-2 border-white"
          title="Open Live Pharmacist Chat Support"
        >
          <Headphones className="w-5 h-5 text-white animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider hidden group-hover:inline">Live Pharmacist Chat</span>
        </button>

        {/* Feedback Sidebar Trigger */}
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-l-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:pl-4 group border-l-2 border-blue-300"
          title="Give Store Feedback & Review"
        >
          <MessageSquare className="w-5 h-5 text-blue-200" />
          <span className="text-xs font-bold uppercase tracking-wider hidden group-hover:inline">Give Feedback</span>
        </button>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            allProducts={allCatalogProducts}
            onClose={() => setSelectedProduct(null)}
            onSelectProduct={(p) => { setSelectedProduct(p); trackRecentlyViewed(p); }}
          />
        )}
      </AnimatePresence>

      {/* ── CUSTOMER FEEDBACK & REVIEWS SLIDE-OVER SIDEBAR MODAL ── */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-5 border-b border-blue-200/80 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">
                      <MessageSquare className="w-4 h-4 text-blue-100" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white uppercase tracking-wider">Customer Feedback &amp; Reviews</h2>
                      <p className="text-[10px] text-blue-100 font-semibold">Share your pharmacy experience</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFeedbackOpen(false)}
                    className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                  <form onSubmit={handleFeedbackSubmit} className="bg-gradient-to-br from-blue-50/80 via-sky-50/40 to-blue-50/60 border border-blue-100/90 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                      Submit Your Store Feedback
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Product Quality">Product Quality &amp; Skincare</option>
                        <option value="Campus Delivery">Campus Express Delivery</option>
                        <option value="Pharmacist Support">Pharmacist Prescription Support</option>
                        <option value="General">General Store Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Service Rating (1 - 5 Stars)
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="p-1 text-slate-300 hover:text-amber-400 cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= feedbackRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-200 text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name..."
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Feedback Details *
                      </label>
                      <textarea
                        required
                        placeholder="Write your suggestions, review or feedback..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-black min-h-[80px]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                    >
                      Publish Feedback
                    </button>
                  </form>

                  {/* Existing Community Feedback */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b pb-2">
                      Recent Community Feedback ({feedbackList.length})
                    </h3>

                    {feedbackList.map((item) => (
                      <div key={item.id} className="p-3.5 bg-white border border-blue-100 rounded-2xl space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">{item.name}</span>
                          <span className="text-[9px] font-bold text-slate-400">{item.date}</span>
                        </div>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block border border-blue-100">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 font-medium">"{item.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 1. EXTENDED 6-SLIDE CUSTOM AI GENERATED HERO CAROUSEL SECTION (LIGHT BLUE & WHITE THEME) ── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50/90 via-sky-50 to-indigo-50/90 text-slate-900 min-h-[440px] sm:min-h-[500px] flex items-center justify-center p-6 sm:p-10 shadow-lg group border border-blue-200/80">
        {/* Soft Ambient Background Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 border border-blue-100/80 backdrop-blur-sm"
          title="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 border border-blue-100/80 backdrop-blur-sm"
          title="Next Slide"
        >
          <ChevronRight className="w-6 h-6 text-slate-800" />
        </button>

        <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="md:w-1/2 text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-100/90 border border-blue-200/90 px-3.5 py-1 rounded-full text-[10px] font-extrabold text-blue-800 uppercase tracking-widest shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  {heroSlides[currentSlide].tag}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
                  {heroSlides[currentSlide].subtitle}
                </p>

                <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer border border-blue-400/30 active:scale-95"
                  >
                    <span>Shop Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/90 shadow-2xs">
                    {heroSlides[currentSlide].badge}
                  </span>
                </div>
              </div>

              <div className="md:w-1/2 flex items-center justify-center">
                <img
                  src={heroSlides[currentSlide].image}
                  onError={handleImageError}
                  alt={heroSlides[currentSlide].title}
                  className="max-h-[320px] sm:max-h-[360px] w-auto object-contain drop-shadow-xl rounded-2xl transition-transform duration-500 hover:scale-105"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200/80 shadow-xs">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlide === idx
                  ? 'bg-blue-600 w-7 shadow-2xs'
                  : 'bg-blue-200 hover:bg-blue-300 w-2.5'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── 2. PROMOTIONAL BANNER BAR ── */}
      <section className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 border border-blue-100 rounded-2xl px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold shadow-xs">
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <Tag className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Special Deals</span>
        </div>

        <div className="flex items-center gap-2 text-blue-950 text-center font-extrabold">
          <span>✨ Certified Authentic Skincare &amp; Prescription Express Delivery - Order Online 24/7</span>
        </div>

        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>New Stock</span>
        </div>
      </section>

      {/* ── 3. DYNAMIC PRODUCTS CATALOG GRID SECTION ── */}
      <section id="products-section" className="space-y-6 pt-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-black tracking-tight uppercase">
                {selectedCategory ? `${selectedCategory} Collection` : 'All Pharmacy & Skincare Products'}
              </h2>
              {selectedCategory && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-rose-600" />
                  Filtered Category
                  <button onClick={clearCategoryFilter} className="ml-1 text-slate-400 hover:text-rose-600 font-bold">✕</button>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {filteredProducts.length} items available in stock for immediate delivery.
            </p>
          </div>

          {selectedCategory && (
            <button
              onClick={clearCategoryFilter}
              className="px-4 py-2 bg-slate-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-full border border-slate-200 transition-all cursor-pointer"
            >
              Show All Categories
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 animate-pulse">
                <div className="h-36 bg-slate-100 rounded-xl" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                <div className="flex justify-between">
                  <div className="h-5 bg-slate-100 rounded-full w-1/4" />
                  <div className="h-5 bg-slate-100 rounded-full w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Pill className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-black">No products found matching "{selectedCategory}"</h3>
            <p className="text-xs text-slate-500 font-medium">Try exploring other categories or view all products.</p>
            <button
              onClick={clearCategoryFilter}
              className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-all cursor-pointer"
            >
              View Full Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const pId = prod.id || prod.product_id;
              const isFav = isInWishlist(pId);
              const stockQty = prod.quantity_in_stock ?? prod.stock_quantity ?? 99;
              const isLowStock = stockQty > 0 && stockQty <= 5;
              const isOutOfStock = stockQty === 0;

              return (
                <div
                  key={pId}
                  onClick={() => { setSelectedProduct(prod); trackRecentlyViewed(prod); }}
                  className="bubble-glass-card p-4 flex flex-col justify-between cursor-pointer relative group overflow-hidden"
                >
                  {/* Low Stock / Out of Stock Badge */}
                  {isOutOfStock && (
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-xs">
                      Out of Stock
                    </span>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 animate-pulse shadow-xs">
                      Only {stockQty} left!
                    </span>
                  )}

                  {/* Top Right Controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!requireAuth()) return;
                        toggleWishlist(prod);
                      }}
                      className="text-slate-500 hover:text-blue-600 bg-white/90 backdrop-blur-md shadow-md hover:bg-blue-50 p-2 rounded-full border border-white transition-all cursor-pointer hover:scale-110 active:scale-95"
                      title={isFav ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-blue-600 fill-blue-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!requireAuth()) return;
                        addToCart(prod);
                      }}
                      className="text-slate-600 hover:text-blue-600 bg-white/90 backdrop-blur-md shadow-md hover:bg-blue-50 p-2 rounded-full border border-white transition-all cursor-pointer hover:scale-110 active:scale-95"
                      title="Add to Cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-36 w-full bg-gradient-to-b from-white/90 to-blue-50/60 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 mb-3 group-hover:scale-105 transition-transform border border-white/90 shadow-inner">
                    <img
                      src={prod.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                      onError={handleImageError}
                      alt={prod.product_name || prod.name}
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        {prod.category?.category_name || 'Wellness'}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        4.9
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-black leading-tight truncate">
                      {prod.product_name || prod.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold">{prod.volume || '1 Unit'}</p>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-sm font-black text-black">${Number(prod.selling_price || prod.price || 19.50).toFixed(2)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOutOfStock
                          ? 'text-slate-500 bg-slate-50 border-slate-200'
                          : isLowStock
                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Recently Viewed Products ── */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Your Journey</p>
              <h3 className="text-base font-black text-black uppercase tracking-tight">Recently Viewed</h3>
            </div>
            <button onClick={() => setRecentlyViewed([])} className="text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer">Clear</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyViewed.map((prod) => (
              <div
                key={prod.id || prod.product_id}
                onClick={() => { setSelectedProduct(prod); trackRecentlyViewed(prod); }}
                className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all min-w-[200px] shrink-0"
              >
                <img
                  src={prod.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100&q=60'}
                  onError={handleImageError}
                  alt={prod.product_name}
                  className="w-12 h-12 object-contain rounded-lg bg-slate-50"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-black truncate">{prod.product_name || prod.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">${Number(prod.selling_price || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. CATEGORY GRID (4 Identical Square Cards) ── */}
      <section id="category-cards-row" className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            ALL YOUR NEEDS IN ONE PLACE
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-[0.15em] uppercase">
            SHOP BY CATEGORY
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Wellness */}
          <div
            onClick={() => navigate('/store?category=Wellness')}
            className="bubble-glass-card p-5 flex flex-col justify-between h-72 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-emerald-800 flex items-center justify-center font-bold text-sm border border-white shadow-xs">
                🌿
              </span>
              <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                New Stock
              </span>
            </div>
            <div className="h-32 my-2 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"
                onError={handleImageError}
                alt="Wellness Supplements"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-md"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Wellness</h3>
              <p className="text-xs text-slate-400 font-semibold">24 Categories</p>
            </div>
          </div>

          {/* Card 2: Hair Care */}
          <div
            onClick={() => navigate('/store?category=Hair%20Care')}
            className="bubble-glass-card p-5 flex flex-col justify-between h-72 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-purple-800 flex items-center justify-center font-bold text-sm border border-white shadow-xs">
                ✂
              </span>
            </div>
            <div className="h-32 my-2 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                onError={handleImageError}
                alt="Hair Care"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-md"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Hair Care</h3>
              <p className="text-xs text-slate-400 font-semibold">13 Categories</p>
            </div>
          </div>

          {/* Card 3: Skin Care */}
          <div
            onClick={() => navigate('/store?category=Skin%20Care')}
            className="bubble-glass-card p-5 flex flex-col justify-between h-72 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-rose-800 flex items-center justify-center font-bold text-sm border border-white shadow-xs">
                ✨
              </span>
              <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                New Stock
              </span>
            </div>
            <div className="h-32 my-2 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80"
                onError={handleImageError}
                alt="Skin Care"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-md"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Skin Care</h3>
              <p className="text-xs text-slate-400 font-semibold">27 Categories</p>
            </div>
          </div>

          {/* Card 4: Offers */}
          <div
            onClick={() => navigate('/store?category=Korean%20Products')}
            className="bubble-glass-card p-5 flex flex-col justify-between h-72 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-amber-800 flex items-center justify-center font-bold text-sm border border-white shadow-xs">
                %
              </span>
            </div>
            <div className="h-32 my-2 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80"
                onError={handleImageError}
                alt="Special Offers"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-md"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Offers</h3>
              <p className="text-xs text-slate-400 font-semibold">17 Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HERO-STYLE CUSTOMER TESTIMONIALS SECTION ── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 min-h-[420px] flex flex-col items-center justify-center px-6 py-14 shadow-lg border border-blue-200/80">

        {/* Soft decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-2 bg-white/90 border border-blue-200 px-4 py-1.5 rounded-full text-[10px] font-extrabold text-blue-700 uppercase tracking-widest shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            VERIFIED COMMUNITY REVIEWS
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase mt-2">
            What Our Customers Say
          </h2>
          <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto">
            Trusted by thousands of patients &amp; skincare lovers across campus and beyond.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
          {feedbackList.slice(0, 6).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/95 border border-blue-100/90 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-3.5 h-3.5 ${idx < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
                  />
                ))}
                <span className="ml-2 text-[10px] font-extrabold text-amber-500">{item.rating}.0</span>
              </div>

              {/* Review text */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">{item.name}</span>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {item.category}
                  </span>
                </div>
                <span className="ml-auto text-[9px] text-slate-400 font-semibold">{item.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative z-10 mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (!requireAuth()) return;
              setIsFeedbackOpen(true);
            }}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-blue-400/30"
          >
            <MessageSquare className="w-4 h-4 text-blue-200" />
            Share Your Pharmacy Experience
          </button>
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hidden sm:block">
            {feedbackList.length} Reviews Published
          </div>
        </div>
      </section>

      {/* ── 5.5. VIP NEWSLETTER SUBSCRIPTION BANNER ── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-950 text-white p-8 sm:p-12 shadow-xl border border-emerald-500/30 my-10 font-sans">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 rounded-full text-[10px] font-extrabold text-emerald-300 uppercase tracking-widest">
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              JOIN THE FOUAD VIP WELLNESS CLUB
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Get 10% Off Your First Order + VIP Health Tips
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Subscribe to receive instant 10% discount vouchers, Korean skincare drop alerts, and licensed pharmacist wellness guidance delivered directly to your inbox.
            </p>
          </div>

          {/* Form / Discount Voucher Card */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl space-y-4">
            {subscribedDiscount ? (
              <div className="text-center space-y-3 p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-white">🎉 Welcome to the VIP Club!</h3>
                <p className="text-xs text-emerald-200 font-medium">Your 10% OFF discount voucher code:</p>
                <div className="p-3 bg-slate-900 rounded-xl border border-emerald-400/60 font-mono font-black text-lg text-emerald-400 tracking-widest flex items-center justify-between">
                  <span>{subscribedDiscount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(subscribedDiscount);
                      toast.success('📋 Code copied to clipboard!');
                    }}
                    className="text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg font-sans font-bold cursor-pointer hover:bg-slate-700"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Enter Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white/90 text-black border border-white/40 rounded-xl text-xs font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
                >
                  <Send className="w-4 h-4" />
                  <span>{newsletterLoading ? 'Subscribing...' : 'Subscribe & Unlock 10% OFF'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER SECTION ── */}
      <footer className="border-t border-slate-200 pt-12 pb-8 bg-slate-50 rounded-3xl p-8 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-black uppercase tracking-wider">Customer Service</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="hover:text-black cursor-pointer">FAQ &amp; Support</li>
              <li className="hover:text-black cursor-pointer">Prescription Help</li>
              <li className="hover:text-black cursor-pointer">Shipping &amp; Delivery Info</li>
              <li className="hover:text-black cursor-pointer">Returns &amp; Exchange Policy</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-black uppercase tracking-wider">Company Info</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="hover:text-black cursor-pointer">About Fouad Pharmacies</li>
              <li className="hover:text-black cursor-pointer">Careers &amp; Internships</li>
              <li className="hover:text-black cursor-pointer">License &amp; Verification</li>
              <li className="hover:text-black cursor-pointer">Press &amp; Media</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-black uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="hover:text-black cursor-pointer">Korean Skincare</li>
              <li className="hover:text-black cursor-pointer">Bundles &amp; Offers</li>
              <li className="hover:text-black cursor-pointer">Wellness &amp; Vitamins</li>
              <li className="hover:text-black cursor-pointer">Best Sellers</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-black uppercase tracking-wider">Newsletter Signup</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Subscribe to get special discount updates and wellness tips.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-black focus:outline-none focus:border-black font-semibold"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {newsletterLoading ? '...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-semibold">
            © 2026 Fouad Pharmacies. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Store;
