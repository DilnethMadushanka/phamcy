import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Package, Clock, CheckCircle2, XCircle, Truck, FileText,
  ExternalLink, ShoppingBag, ShieldCheck, Sparkles, Eye, RefreshCw, Download
} from 'lucide-react';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lightbox preview for Rx images
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'Pending':          return 1;
      case 'Approved':         return 2;
      case 'Out for Delivery': return 3;
      case 'Completed':        return 4;
      case 'Cancelled':        return 0;
      default:                 return 1;
    }
  };

  const parsePrescriptions = (urlData) => {
    if (!urlData) return [];
    if (Array.isArray(urlData)) return urlData;
    try {
      const parsed = JSON.parse(urlData);
      if (Array.isArray(parsed)) return parsed;
      return [urlData];
    } catch (e) {
      return [urlData];
    }
  };

  // 1-Click PDF Receipt Invoice Generator
  const downloadInvoicePDF = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = (order.items && order.items.length > 0)
      ? order.items.map(it => `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">${it.product?.product_name || `Product #${it.product_id}`}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${it.quantity}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">Rs. ${parseFloat(it.price || 0).toFixed(2)}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right; font-weight:bold;">Rs. ${(parseFloat(it.price || 0) * it.quantity).toFixed(2)}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" style="padding:16px; text-align:center; font-weight:bold; color:#475569;">Digital Doctor Prescription Order</td></tr>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FOUAD PHARMACIES - Receipt #${order.id}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0f172a; max-w-2xl; margin: auto; }
            .header { text-align: center; border-bottom: 3px solid #e11d48; padding-bottom: 16px; margin-bottom: 24px; }
            .heart { color: #e11d48; font-size: 24px; line-height: 1; }
            .logo { font-size: 22px; font-weight: 900; letter-spacing: 4px; color: #000; margin-top: 4px; }
            .sub { font-size: 9px; font-weight: 800; letter-spacing: 5px; color: #e11d48; text-transform: uppercase; }
            .meta { width: 100%; margin-bottom: 24px; font-size: 13px; border-collapse: collapse; }
            .meta td { vertical-align: top; padding: 4px 0; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            .table th { background: #f8fafc; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; font-weight: 800; }
            .total { text-align: right; font-size: 20px; font-weight: 900; color: #e11d48; margin-top: 16px; padding-top: 12px; border-top: 2px solid #0f172a; }
            .stamp { margin-top: 32px; text-align: center; border: 2px dashed #059669; color: #047857; display: block; padding: 12px; rounded-radius: 12px; font-weight: 800; font-size: 12px; background: #ecfdf5; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="heart">♥</div>
            <div class="logo">FOUAD PHARMACIES</div>
            <div class="sub">OFFICIAL TAX INVOICE &amp; RECEIPT</div>
          </div>

          <table class="meta">
            <tr>
              <td>
                <strong>Order Reference:</strong> #${order.id}<br>
                <strong>Date &amp; Time:</strong> ${moment(order.createdAt).format('MMMM D, YYYY • h:mm A')}<br>
                <strong>Verification Status:</strong> ${order.order_status || 'Approved'}
              </td>
              <td style="text-align:right;">
                <strong>Delivery Destination:</strong><br>
                ${order.delivery_address || 'Campus Location'}<br>
                <strong>Payment Method:</strong> ${order.payment_method || 'Cash on Delivery'}
              </td>
            </tr>
          </table>

          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total">
            TOTAL PAID: Rs. ${parseFloat(order.total_amount || 0).toFixed(2)}
          </div>

          <div class="stamp">
            ✓ AUTHORIZED &amp; VERIFIED BY FOUAD LICENSED PHARMACIST
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans px-2 sm:px-4">
      {/* Telemetry Live Header */}
      <section className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 border border-slate-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Order &amp; Rx Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            My Orders &amp; Prescription Telemetry
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-normal">
            Real-time status tracking for pharmacist verification, order approval, and campus delivery.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-black border border-slate-200 rounded-full font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-rose-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live</span>
        </button>
      </section>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold">
          ⚠ {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400 text-xs font-semibold">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
          <span>Fetching live status updates...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">No active orders yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            When you purchase products or upload a doctor prescription, live tracking progress will appear here.
          </p>
          <button
            onClick={() => navigate('/store')}
            className="px-6 py-3 bg-black hover:bg-slate-800 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Pharmacy Store</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIdx = getStatusStepIndex(order.order_status);
            const prescriptions = parsePrescriptions(order.prescription_image_url);
            const isCancelled = order.order_status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-black text-black text-lg">Order #{order.id}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                          order.order_status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : order.order_status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.order_status === 'Out for Delivery'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : order.order_status === 'Completed'
                            ? 'bg-black text-white border-black'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {order.order_status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {order.order_status === 'Approved' && <ShieldCheck className="w-3.5 h-3.5" />}
                        {order.order_status === 'Out for Delivery' && <Truck className="w-3.5 h-3.5" />}
                        {order.order_status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {order.order_status === 'Cancelled' && <XCircle className="w-3.5 h-3.5" />}
                        <span>{order.order_status}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      Placed on {moment(order.createdAt).format('MMMM D, YYYY • h:mm A')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => downloadInvoicePDF(order)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-black hover:text-white text-black border border-slate-200 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Download Official Tax Receipt PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      <span>Receipt PDF</span>
                    </button>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                      <span className="text-xl font-black text-black">Rs. {parseFloat(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* ── HIGH-FIDELITY LIVE VISUAL TRACKER STEPPER ── */}
                {!isCancelled ? (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-black border-b border-slate-200 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        Live Delivery Progress
                      </span>
                      <span className="text-emerald-700 font-extrabold text-[11px] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {stepIdx === 1 && 'Pending Pharmacist Review'}
                        {stepIdx === 2 && 'Prescription Verified & Approved'}
                        {stepIdx === 3 && 'Out for Campus Delivery (In Transit)'}
                        {stepIdx === 4 && 'Delivered & Completed'}
                      </span>
                    </div>

                    {/* Progress Bar & Stepper Nodes */}
                    <div className="relative py-2">
                      <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0">
                        <div
                          className="h-full bg-rose-600 rounded-full transition-all duration-700"
                          style={{
                            width:
                              stepIdx === 1 ? '15%' :
                              stepIdx === 2 ? '50%' :
                              stepIdx === 3 ? '85%' : '100%',
                          }}
                        />
                      </div>

                      <div className="relative z-10 grid grid-cols-4 text-center">
                        {/* Step 1: Rx Uploaded */}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                            stepIdx >= 1 ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-300'
                          }`}>
                            1
                          </div>
                          <span className="text-[10px] font-extrabold text-black uppercase">Rx Uploaded</span>
                        </div>

                        {/* Step 2: Pharmacist Verified */}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                            stepIdx >= 2 ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-300'
                          }`}>
                            2
                          </div>
                          <span className="text-[10px] font-extrabold text-black uppercase">Rx Verified</span>
                        </div>

                        {/* Step 3: Out for Delivery */}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                            stepIdx >= 3 ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-300'
                          }`}>
                            3
                          </div>
                          <span className="text-[10px] font-extrabold text-black uppercase">In Transit</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                            stepIdx >= 4 ? 'bg-black text-white border-black shadow-md' : 'bg-white text-slate-400 border-slate-300'
                          }`}>
                            4
                          </div>
                          <span className="text-[10px] font-extrabold text-black uppercase">Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-700 font-bold space-y-1">
                    <p> Order Cancelled / Rejected</p>
                    <p className="text-[11px] font-medium text-rose-600">The uploaded prescription could not be verified by the pharmacist.</p>
                  </div>
                )}

                {/* Delivery Destination & Payment Method */}
                <div className="text-xs space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Destination</span>
                    <p className="font-bold text-black">{order.delivery_address || 'Campus Pick-up Location'}</p>
                    {order.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">Notes: "{order.notes}"</p>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method</span>
                    <span className="font-extrabold text-rose-600">{order.payment_method || 'Cash on Delivery'}</span>
                  </div>
                </div>

                {/* Attached Prescriptions / Bank Slip Thumbnails */}
                {prescriptions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attached Prescriptions / Payment Slip</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {prescriptions.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewImage(url)}
                          className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-black hover:border-black transition-all cursor-pointer group"
                        >
                          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="truncate">Document #{idx + 1}</span>
                          <Eye className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-black shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Item List */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Items</span>
                    <div className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-black">{item.product?.product_name || `Product #${item.product_id}`}</span>
                            <span className="text-slate-400 ml-2 font-medium">Qty: {item.quantity}</span>
                          </div>
                          <span className="font-black text-black">Rs. {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Prescription Image Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative bg-white rounded-3xl p-4 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-100 hover:bg-slate-200 text-black rounded-full flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3">Document Preview</h3>
            <img
              src={previewImage}
              alt="Prescription or Slip Preview"
              className="max-h-[70vh] w-auto object-contain rounded-xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
