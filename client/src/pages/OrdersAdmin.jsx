import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Package, Search, Filter, ExternalLink, Check, X,
  FileText, CheckCircle2, Clock, Truck, AlertTriangle, RefreshCw, Eye
} from 'lucide-react';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Lightbox preview for Rx images
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAllOrders(statusFilter);
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
        if (data?.message) setError(data.message);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err?.message || 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} status changed to "${newStatus}"!`);
      await fetchOrders();
    } catch (err) {
      toast.error(err?.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const searchLower = searchQuery.toLowerCase();
    const customerName = order.customer?.name?.toLowerCase() || '';
    const orderId = String(order.id || '');
    return customerName.includes(searchLower) || orderId.includes(searchLower);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':          return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approved':         return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Out for Delivery': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Completed':        return 'bg-blue-600 text-white border-blue-700';
      case 'Cancelled':        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:                 return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':          return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'Approved':         return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Out for Delivery': return <Truck className="w-3.5 h-3.5 text-sky-600" />;
      case 'Completed':        return <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
      case 'Cancelled':        return <X className="w-3.5 h-3.5 text-rose-600" />;
      default:                 return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600 } }} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <Package className="w-7 h-7 text-blue-300" />
            <span>Digital Prescriptions &amp; Orders Verification</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium max-w-2xl">
            Pharmacist queue to verify uploaded doctor prescriptions, authorize orders, and update delivery status.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 transition-all text-xs font-bold flex items-center gap-2 shadow-xs shrink-0 cursor-pointer backdrop-blur-md relative z-10"
        >
          <RefreshCw className={`w-4 h-4 text-blue-300 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or Order ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-full text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex bg-blue-50/70 p-1 rounded-full space-x-1 text-xs font-bold overflow-x-auto custom-scrollbar border border-blue-100">
          {['all', 'Pending', 'Approved', 'Out for Delivery', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading online prescription queue...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold bg-white/90 rounded-2xl border border-blue-100">
          No online orders match your current filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = order.order_status || order.status || 'Pending';
            const rxUrl = order.prescription_image_url || order.prescription_url;
            const hasPrescription = Boolean(rxUrl);
            const isActionPending = actionLoading === order.id;

            return (
              <div
                key={order.id}
                className="p-6 bg-white/95 rounded-2xl border border-blue-100 shadow-sm space-y-4 hover:border-blue-200 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="font-black text-slate-900 text-base">Order #{order.id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(status)}`}>
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </span>
                    {hasPrescription && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-600" /> Digital Rx Attached
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {moment(order.createdAt).format('MMM D, YYYY • h:mm A')}
                  </span>
                </div>

                {/* Info Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Info</span>
                    <p className="font-bold text-slate-900">{order.customer?.name || 'Walk-in / Online Customer'}</p>
                    <p className="text-slate-500 font-medium">{order.customer?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Destination</span>
                    <p className="text-slate-800 font-medium">{order.delivery_address || 'Campus Pick-up'}</p>
                    {order.notes && (
                      <p className="text-[11px] text-blue-600 italic mt-0.5 font-semibold">Notes: "{order.notes}"</p>
                    )}
                  </div>

                  <div className="md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Bill &amp; Payment</span>
                    <p className="text-lg font-black text-blue-900">Rs. {parseFloat(order.total_amount || 0).toFixed(2)}</p>
                    <p className="text-[11px] text-blue-600 font-bold">{order.payment_method || 'Cash on Delivery'}</p>
                  </div>
                </div>

                {/* Prescription Document Preview Thumbnail & Lightbox View */}
                {hasPrescription && (
                  <div className="bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/70 p-4 rounded-xl border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-xs text-blue-950 uppercase tracking-wide">Doctor's Prescription Image</span>
                      </div>
                      <button
                        onClick={() => setPreviewImage(rxUrl)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-blue-200 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> View &amp; Inspect Prescription
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={rxUrl}
                        alt="Prescription Thumbnail"
                        onClick={() => setPreviewImage(rxUrl)}
                        className="w-24 h-24 object-cover rounded-xl border border-blue-200 cursor-pointer hover:opacity-90 transition-opacity shadow-xs"
                      />
                      <div className="text-xs text-slate-600 font-medium">
                        <p className="font-extrabold text-blue-900">Prescription File Attached</p>
                        <p className="text-[11px]">Click thumbnail to inspect dosage &amp; doctor authorization.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ordered Items</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-900">{it.product?.product_name || `Product #${it.product_id}`}</span>
                          <span className="font-semibold text-blue-600">{it.quantity} × Rs. {parseFloat(it.price || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Status Control Bar (Pharmacist Actions) */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-blue-50/40 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span>Pharmacist Status Control:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Approve Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order.id, 'Approved')}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        status === 'Approved'
                          ? 'bg-emerald-600 text-white border border-emerald-700 shadow-md ring-2 ring-emerald-300'
                          : 'bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{status === 'Approved' ? '✓ Approved' : 'Authorize & Approve'}</span>
                    </button>

                    {/* Dispatch Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order.id, 'Out for Delivery')}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        status === 'Out for Delivery'
                          ? 'bg-sky-600 text-white border border-sky-700 shadow-md ring-2 ring-sky-300'
                          : 'bg-white hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-300'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>{status === 'Out for Delivery' ? '✓ In Transit' : 'Dispatch Delivery'}</span>
                    </button>

                    {/* Complete Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order.id, 'Completed')}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        status === 'Completed'
                          ? 'bg-blue-700 text-white border border-blue-800 shadow-md ring-2 ring-blue-300'
                          : 'bg-white hover:bg-blue-700 hover:text-white text-blue-800 border border-blue-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{status === 'Completed' ? '✓ Delivered' : 'Mark Delivered'}</span>
                    </button>

                    {/* Reject / Cancel Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                      className={`px-3.5 py-2 rounded-full text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        status === 'Cancelled'
                          ? 'bg-rose-600 text-white border border-rose-700 shadow-md ring-2 ring-rose-300'
                          : 'bg-white hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-300'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>{status === 'Cancelled' ? '✕ Cancelled' : 'Reject Order'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Prescription Image Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative bg-white rounded-3xl p-5 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col items-center font-sans shadow-2xl border border-blue-100">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider mb-3">Prescription Document Inspection</h3>
            <img
              src={previewImage}
              alt="Full Doctor Prescription Inspection"
              className="max-h-[75vh] w-auto object-contain rounded-2xl border border-blue-100 shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;
