import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Flame,
  Turtle,
  DollarSign,
  Calendar,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [expiryData, setExpiryData] = useState(null);
  const [movementData, setMovementData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [rev, exp, mov] = await Promise.all([
        api.getRevenueAnalytics(),
        api.getExpiryLossReport(),
        api.getProductMovement(),
      ]);
      setRevenueData(rev);
      setExpiryData(exp);
      setMovementData(mov);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold gap-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Calculating financial analytics &amp; expiry telemetry...</span>
      </div>
    );
  }

  // 1. Revenue Line Chart Data
  const revLabels = revenueData?.chartData?.map((item) => item.date) || [];
  const revTotals = revenueData?.chartData?.map((item) => item.total) || [];

  const lineChartData = {
    labels: revLabels.length > 0 ? revLabels : ['Today'],
    datasets: [
      {
        label: 'Daily Revenue ($)',
        data: revTotals.length > 0 ? revTotals : [0],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#1D4ED8',
        pointRadius: 4,
      },
    ],
  };

  // 2. Product Velocity Bar Chart Data
  const fastNames = movementData?.fastMoving?.map((item) => item.product_name) || [];
  const fastQtys = movementData?.fastMoving?.map((item) => item.total_quantity_sold) || [];

  const barChartData = {
    labels: fastNames,
    datasets: [
      {
        label: 'Units Sold',
        data: fastQtys,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <BarChart3 className="w-7 h-7 text-blue-300" />
            <span>Reports &amp; Executive Financial Telemetry</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium max-w-2xl">
            Analyze daily revenue streams, product sales velocity, and potential financial loss from batch expiry.
          </p>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="premium-card p-6 bg-white/95 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Lifetime Revenue</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Rs. {parseFloat(revenueData?.summary?.totalRevenue || 0).toFixed(2)}
            </h2>
            <p className="text-[11px] text-blue-600 font-bold mt-1">
              {revenueData?.summary?.totalSalesCount || 0} Total Orders Processed
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="premium-card p-6 bg-white/95 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expired Batch Risk</p>
            <h2 className="text-2xl font-black text-rose-600 mt-1">
              Rs. {parseFloat(expiryData?.summary?.totalExpiredValue || 0).toFixed(2)}
            </h2>
            <p className="text-[11px] text-rose-700 font-semibold mt-1">
              {expiryData?.summary?.expiredCount || 0} Expired Batches
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="premium-card p-6 bg-white/95 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Near-Expiry Exposure</p>
            <h2 className="text-2xl font-black text-amber-600 mt-1">
              Rs. {parseFloat(expiryData?.summary?.totalNearExpiryValue || 0).toFixed(2)}
            </h2>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              {expiryData?.summary?.nearExpiryCount || 0} Batches (&lt;90 Days)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white/95 rounded-2xl border border-blue-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Revenue Trajectory</h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Daily Volume
            </span>
          </div>
          <div className="h-64">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: '#F1F5F9' } },
                },
              }}
            />
          </div>
        </div>

        {/* Product Velocity Bar Chart */}
        <div className="bg-white/95 rounded-2xl border border-blue-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Fast-Moving Medicines</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Top Sellers
            </span>
          </div>
          <div className="h-64">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: '#F1F5F9' } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Movement Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving Items Table */}
        <div className="bg-white/95 rounded-2xl border border-blue-100 p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-blue-600" /> High Velocity Products
          </h3>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
            {movementData?.fastMoving?.map((prod, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{prod.product_name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{prod.generic_name}</p>
                </div>
                <div className="text-right font-extrabold text-blue-700">
                  {prod.total_quantity_sold} units sold
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving Items Table */}
        <div className="bg-white/95 rounded-2xl border border-blue-100 p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Turtle className="w-4 h-4 text-rose-500" /> Low Velocity / Dead Stock
          </h3>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
            {movementData?.slowMoving?.map((prod, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{prod.product_name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Stock: {prod.stock_quantity} left</p>
                </div>
                <div className="text-right font-bold text-rose-600">
                  {prod.total_quantity_sold || 0} units sold
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
