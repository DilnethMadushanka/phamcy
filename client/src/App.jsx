import React from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { DarkModeProvider } from './context/DarkModeContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';
import MobileBottomNav from './components/MobileBottomNav';
import SupportChatWidget from './components/SupportChatWidget';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrdersAdmin from './pages/OrdersAdmin';
import Suppliers from './pages/Suppliers';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Reports from './pages/Reports';
import Users from './pages/Users';
import SupportAdmin from './pages/SupportAdmin';

import Store from './pages/customer/Store';
import PrescriptionUpload from './pages/customer/PrescriptionUpload';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-blue-50/50">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/store" replace />;
  }
  return <Outlet />;
};

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-blue-50/70 flex flex-col font-sans">
      <Navbar />
      <CartDrawer />
      <WishlistDrawer />
      <AuthModal />
      <MobileBottomNav />
      <SupportChatWidget />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

const StaffLayout = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white border-b border-blue-800/60 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md group-hover:scale-105 transition-transform">
              F
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-white block leading-none">FOUAD PHARMACY</span>
              <span className="text-[10px] text-blue-200 font-semibold tracking-widest uppercase">Admin Workspace</span>
            </div>
          </Link>
          <span className="hidden sm:inline-block text-xs bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full font-bold border border-blue-400/30">
            {user?.role || 'Staff'} Access
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/store"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all border border-white/20 hidden sm:flex items-center gap-1.5"
          >
            <span>🛍️ View Store Front</span>
          </Link>
          <div className="flex items-center space-x-3 border-l border-blue-800/80 pl-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-extrabold text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-blue-300 font-medium">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white px-3 py-1.5 rounded-xl border border-rose-400/30 transition-all font-bold cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Routes with Header & Footer */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/store" replace />} />
                <Route path="/store" element={<Store />} />
                <Route path="/upload-prescription" element={<PrescriptionUpload />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Protected Staff Workspace Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Cashier']} />}>
                <Route element={<StaffLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/orders" element={<OrdersAdmin />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/products" element={<Inventory />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/analytics" element={<Reports />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/support" element={<SupportAdmin />} />
                </Route>
              </Route>

              {/* Fallback Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/store" replace />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
