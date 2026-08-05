import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, X, ShoppingBag, Trash2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const WishlistDrawer = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    removeFromWishlist(item.id || item.product_id);
    setIsCartOpen(true);
    toast.success(`Moved "${item.product_name}" to Cart!`);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => addToCart(item, 1));
    clearWishlist();
    setIsCartOpen(true);
    toast.success('Moved all items from Wishlist to Cart!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsWishlistOpen(false)}
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
                  <Heart className="w-4 h-4 fill-current text-blue-300" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">Saved Favorites</h2>
                  <p className="text-[10px] text-blue-200 font-semibold">{wishlist.length} saved products</p>
                </div>
              </div>

              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-blue-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner */}
            <div className="bg-blue-50 border-b border-blue-100 p-3 px-5 flex items-center justify-between text-xs font-extrabold text-blue-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Saved for later checkout
              </span>
              {wishlist.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-[10px] text-slate-500 hover:text-rose-600 underline font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center">
                    <Heart className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Your Wishlist is Empty</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-xs">
                    Click the heart icon on any product to save your favorite skincare and medicines for later.
                  </p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div
                    key={item.id || item.product_id}
                    className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl relative group hover:border-slate-300 transition-all"
                  >
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product_name}
                      className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        {item.category?.category_name || 'Wellness'}
                      </span>
                      <h4 className="text-xs font-extrabold text-black truncate">{item.product_name}</h4>
                      <p className="text-xs font-black text-black mt-1">${Number(item.selling_price || 19.50).toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move</span>
                      </button>

                      <button
                        onClick={() => removeFromWishlist(item.id || item.product_id)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <button
                  onClick={handleMoveAllToCart}
                  className="w-full py-3.5 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Move All Items to Shopping Cart</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default WishlistDrawer;
