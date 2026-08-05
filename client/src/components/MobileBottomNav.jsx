import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Home, ShoppingBag, Heart, User, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { user, setShowAuthModal, setAuthModalMode } = useAuth();

  // Only show on customer-facing pages (not staff portal, not login)
  const staffPaths = ['/dashboard', '/orders', '/pos', '/products', '/categories', '/suppliers', '/analytics'];
  const hiddenPaths = ['/login', '/register'];
  if (
    hiddenPaths.includes(location.pathname) ||
    staffPaths.some((p) => location.pathname.startsWith(p))
  ) {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => navigate('/store'),
      active: location.pathname === '/store' && !new URLSearchParams(location.search).get('category'),
    },
    {
      id: 'wishlist',
      label: 'Saved',
      icon: Heart,
      badge: wishlistCount,
      action: () => setIsWishlistOpen(true),
      active: false,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount,
      action: () => setIsCartOpen(true),
      active: false,
      primary: true,
    },
    {
      id: 'prescription',
      label: 'Rx Upload',
      icon: Upload,
      action: () => {
        if (!user) { setAuthModalMode('login'); setShowAuthModal(true); return; }
        navigate('/profile');
      },
      active: location.pathname === '/profile',
    },
    {
      id: 'profile',
      label: 'Account',
      icon: User,
      action: () => {
        if (!user) { setAuthModalMode('login'); setShowAuthModal(true); return; }
        navigate('/profile');
      },
      active: location.pathname === '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 block sm:hidden bg-white border-t border-slate-200 shadow-xl safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer
                ${item.primary
                  ? 'bg-black text-white w-14 h-14 -mt-5 rounded-full shadow-lg hover:bg-slate-800'
                  : item.active
                    ? 'text-rose-600'
                    : 'text-slate-400 hover:text-slate-800'
                }
              `}
            >
              <Icon className={`${item.primary ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!item.primary && (
                <span className="text-[9px] font-extrabold uppercase tracking-wider leading-none">
                  {item.label}
                </span>
              )}
              {item.badge > 0 && (
                <span className={`absolute text-[9px] font-black min-w-[16px] h-4 flex items-center justify-center rounded-full px-1
                  ${item.primary ? 'bg-rose-600 text-white -top-1 -right-1' : 'bg-rose-600 text-white -top-0.5 right-2'}
                `}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
