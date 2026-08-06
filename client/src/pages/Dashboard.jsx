import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Pill,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  Package,
  Activity,
  ShieldCheck,
  ClipboardList,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Loading Telemetry &amp; Inventory Data...</p>
      </div>
    );
  }

  const { metrics, lowStockAlerts = [], nearExpiryAlerts = [] } = data || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Telemetry Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white border border-blue-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow orb background effect */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-extrabold text-blue-200 border border-white/20 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-400" />
              Live Pharmacy Operations Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pharmacy Executive Dashboard
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm font-medium">
              Real-time batch tracking, stock depletion warnings, digital prescription queue, and sales performance metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/pos"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 shrink-0 active:scale-95 border border-blue-400/30"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Launch POS Terminal</span>
            </Link>
            <Link
              to="/orders"
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full font-bold text-xs transition-all border border-white/20 flex items-center gap-2 shrink-0 backdrop-blur-md"
            >
              <ClipboardList className="w-4 h-4 text-blue-300" />
              <span>Prescription Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="premium-card p-5 rounded-2xl bg-white/90 border border-blue-100/90 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Rs. {parseFloat(metrics?.totalRevenue || 0).toFixed(2)}
            </h2>
            <span className="text-[11px] text-blue-600 font-bold flex items-center mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-blue-600" /> Gross Lifetime Volume
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Medicines */}
        <div className="premium-card p-5 rounded-2xl bg-white/90 border border-blue-100/90 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Inventory</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {metrics?.totalProducts || 0}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium flex items-center mt-1">
              <Package className="w-3.5 h-3.5 mr-1 text-slate-400" /> {metrics?.totalCategories || 0} Categories
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-xs">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Low Stock Alert */}
        <div className="premium-card p-5 rounded-2xl bg-white/90 border border-blue-100/90 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
            <h2 className="text-2xl font-black text-amber-600 mt-1">
              {metrics?.lowStockCount || 0}
            </h2>
            <span className="text-[11px] text-amber-700 font-semibold flex items-center mt-1">
              Below Safety Threshold
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Near Expiry Alert */}
        <div className="premium-card p-5 rounded-2xl bg-white/90 border border-blue-100/90 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Near Expiry (&lt;90 Days)</p>
            <h2 className="text-2xl font-black text-rose-600 mt-1">
              {metrics?.nearExpiryCount || 0}
            </h2>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center mt-1">
              Requires Quarantine
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watchlist */}
        <div className="bg-white/95 rounded-2xl border border-blue-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Low Stock Replenishment List</h3>
                <p className="text-[11px] text-slate-400 font-normal">Products requiring purchase orders</p>
              </div>
            </div>
            <Link
              to="/suppliers"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
            >
              Restock <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {lowStockAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-semibold">
              ✨ All products maintain healthy stock levels.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {lowStockAlerts.map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{prod.product_name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Generic: {prod.generic_name || 'N/A'} • {prod.category?.category_name || 'General'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {prod.stock_quantity} left (Min: {prod.minimum_threshold})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Near Expiry Watchlist */}
        <div className="bg-white/95 rounded-2xl border border-blue-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Batch Expiration Telemetry</h3>
                <p className="text-[11px] text-slate-400 font-normal">Batches expiring within 90 days</p>
              </div>
            </div>
            <Link
              to="/reports"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
            >
              Loss Report <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {nearExpiryAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-semibold">
              👍 No expiring medicine batches detected.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {nearExpiryAlerts.map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{prod.product_name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Batch #: {prod.batch_number || 'DEFAULT'}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Exp: {prod.expiry_date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
