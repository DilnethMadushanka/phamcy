import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const getStorageKey = (u) => (u?.id ? `pharmacy_wishlist_user_${u.id}` : 'pharmacy_wishlist_guest');

  const [wishlist, setWishlist] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Load user-specific wishlist whenever active user changes
  useEffect(() => {
    try {
      const key = getStorageKey(user);
      const saved = localStorage.getItem(key);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, [user?.id]);

  // Save wishlist to user-specific storage key
  useEffect(() => {
    try {
      const key = getStorageKey(user);
      localStorage.setItem(key, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist, user?.id]);

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      const prodId = product.id || product.product_id;
      const exists = prev.some((item) => (item.id || item.product_id) === prodId);

      if (exists) {
        toast('Already in your saved favorites', { icon: '❤️' });
        return prev;
      }

      toast.success(`Saved "${product.product_name || product.name}" to Wishlist! ❤️`);
      return [
        ...prev,
        {
          id: prodId,
          product_id: prodId,
          product_name: product.product_name || product.name,
          selling_price: Number(product.selling_price || product.price || 19.50),
          volume: product.volume || '1 Unit',
          image_url: product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
          category: product.category || { category_name: 'Wellness' },
        },
      ];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => (item.id || item.product_id) !== productId));
    toast.success('Removed from Wishlist');
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item.id || item.product_id) === productId);
  };

  const toggleWishlist = (product) => {
    const prodId = product.id || product.product_id;
    if (isInWishlist(prodId)) {
      removeFromWishlist(prodId);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isWishlistOpen,
        setIsWishlistOpen,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
