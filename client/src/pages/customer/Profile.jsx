import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User, Mail, MapPin, Phone, ShieldCheck, FileCheck2, Clock, CheckCircle2,
  Package, ChevronRight, Upload, FileText, Download, Camera, RefreshCw, AlertCircle,
  Sparkles, Heart, ShoppingBag, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';


const Profile = () => {
  const { user, logout, loading, setShowAuthModal, setAuthModalMode, changePassword, updateProfile, sendOtp } = useAuth();
  const navigate = useNavigate();

  // Edit Profile State
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [profileOtp, setProfileOtp] = useState('');
  const [profileOtpSent, setProfileOtpSent] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const handleSendProfileOtp = async (e) => {
    if (e) e.preventDefault();
    if (!editName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // If email hasn't changed, update name directly
    if (editEmail.trim().toLowerCase() === (user?.email || '').toLowerCase()) {
      setUpdatingProfile(true);
      try {
        const res = await updateProfile({ name: editName.trim(), email: editEmail.trim() });
        toast.success(res.message || '🎉 Profile name updated successfully!');
      } catch (err) {
        toast.error(err.message || 'Failed to update profile.');
      } finally {
        setUpdatingProfile(false);
      }
      return;
    }

    // Email changed -> Request OTP
    setUpdatingProfile(true);
    try {
      const res = await sendOtp(editEmail.trim(), 'profile_update');
      setProfileOtpSent(true);
      if (res.devOtp) {
        setProfileOtp(res.devOtp);
        toast.success(`🔑 Demo OTP Code: ${res.devOtp} (Auto-filled)`, { duration: 6000 });
      } else {
        toast.success(`✉ Verification OTP code sent to ${editEmail}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP code to new email.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleVerifyAndUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileOtp || profileOtp.length < 6) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        otp: profileOtp,
      });
      toast.success(res.message || '🎉 Profile & Email address updated successfully!');
      setProfileOtpSent(false);
      setProfileOtp('');
    } catch (err) {
      toast.error(err.message || 'Failed to verify OTP code.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      toast.success(res.message || '🔑 Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Guest guard: if not logged in, bounce back to store & open auth modal
  useEffect(() => {
    if (!loading && !user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      navigate('/store', { replace: true });
    }
  }, [user, loading]);

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'upload' | 'info'

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Loyalty Points (10 pts per $1 spent)
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Prescription Upload State
  const [files, setFiles] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Reorder handler
  const handleReorder = (order) => {
    toast.success(`🔁 Re-order for Order #${order.id || order.order_id} placed! (Demo)`);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await api.getMyOrders();
      let fetchedOrders = [];
      if (Array.isArray(data)) {
        fetchedOrders = data;
      } else if (data && Array.isArray(data.orders)) {
        fetchedOrders = data.orders;
      }
      setOrders(fetchedOrders);
      // Calculate loyalty points: 10 pts per $1 of completed orders
      const totalSpent = fetchedOrders
        .filter((o) => o.status === 'Completed' || o.status === 'Delivered')
        .reduce((sum, o) => sum + Number(o.total_amount || o.total || 0), 0);
      setLoyaltyPoints(Math.floor(totalSpent * 10));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };


  // Prescription File Handlers
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Only image files are allowed.');
    }

    if (files.length + validFiles.length > 5) {
      toast.error('You can only upload up to 5 photos.');
      return;
    }

    const newFilesWithPreview = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFilesWithPreview]);
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one prescription photo.');
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('prescriptions', file);
      });

      const uploadRes = await api.uploadPrescriptions(formData);
      const imageUrls = uploadRes.urls;

      await api.createOrder({
        items: [],
        prescription_image_url: imageUrls,
        delivery_address: deliveryAddress,
        notes: notes,
        payment_method: 'Cash on Delivery'
      });

      toast.success('🎉 Prescription submitted! Pharmacist is verifying your order.');
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      setDeliveryAddress('');
      setNotes('');
      fetchOrders();
      setActiveTab('orders');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err?.message || 'Prescription submission failed.');
    } finally {
      setUploading(false);
    }
  };

  // 1-Click Tax Invoice PDF Generator
  const downloadInvoicePDF = (order) => {
    const printWindow = window.open('', '_blank');
    const orderItemsHTML = order.items && order.items.length > 0
      ? order.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.product_name || 'Prescription Medication'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.price || 24.50).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(Number(item.price || 24.50) * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" style="padding: 10px; border-bottom: 1px solid #eee;">Rx Prescription Order (Verified by Pharmacist)</td></tr>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fouad Pharmacies Official Tax Invoice #${order.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .title { font-size: 24px; font-weight: bold; color: #e11d48; letter-spacing: 2px; }
          .subtitle { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .info-table th { background: #f8fafc; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; border-top: 2px solid #1e293b; padding-top: 10px; }
          .stamp { margin-top: 40px; border: 2px dashed #059669; background: #ecfdf5; color: #047857; padding: 15px; border-radius: 12px; font-size: 11px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">FOUAD PHARMACIES PVT LTD</div>
            <div class="subtitle">Official Licensed Pharmacy Tax Invoice / Receipt</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold;">INVOICE #${order.id}</div>
            <div style="font-size: 12px; color: #64748b;">${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px; font-size: 12px;">
          <strong>Customer:</strong> ${user?.name || 'Valued Patient'}<br/>
          <strong>Email:</strong> ${user?.email || 'N/A'}<br/>
          <strong>Delivery Address:</strong> ${order.delivery_address || 'Campus Location'}
        </div>

        <table class="info-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${orderItemsHTML}</tbody>
        </table>

        <div class="total">Total Paid: $${Number(order.total_amount || 25.00).toFixed(2)}</div>

        <div class="stamp">
          ✔ <strong>VERIFIED &amp; DISPATCHED BY LICENSED PHARMACIST</strong><br/>
          License No: SL-PHARM-2026-889 • Fouad Pharmacies Head Office, Colombo.<br/>
          Payment Method: ${order.payment_method || 'Cash on Delivery'}
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 font-sans px-2 sm:px-4">
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600 } }} />

      {/* ── 1. CUSTOMER PROFILE HEADER CARD ── */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-rose-100 border-2 border-rose-200 text-rose-600 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-black tracking-tight">{user?.name || 'Customer Account'}</h1>
              <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200 uppercase">
                {user?.role || 'Customer'}
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Patient
              </span>
            </div>

            <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user?.email || 'patient@pharmacy.com'}
            </p>
          </div>
        </div>

        {/* Header Stats */}
        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
          <div className="text-center px-3">
            <span className="text-2xl font-black text-black block">{orders.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          </div>

          <div className="text-center px-3 border-l border-slate-200">
            <span className="text-2xl font-black text-rose-600 block">
              {orders.filter(o => o.prescription_image_url).length}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prescriptions</span>
          </div>

          <div className="text-center px-3 border-l border-slate-200">
            <span className="text-2xl font-black text-amber-500 block">🪙 {loyaltyPoints}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reward Pts</span>
          </div>
        </div>
      </section>

      {/* ── LOYALTY POINTS BANNER ── */}
      {loyaltyPoints > 0 && (
        <section className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shrink-0">🪙</div>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-black">You have <span className="text-amber-600">{loyaltyPoints} Fouad Reward Points!</span></p>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Earned from completed orders. Redeem at checkout for discounts (100 pts = $1 off).</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-black text-amber-600 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">${(loyaltyPoints / 100).toFixed(2)} Value</span>
          </div>
        </section>
      )}


      {/* ── 2. NAVIGATION TABS ── */}
      <div className="flex border-b border-slate-200 space-x-4 sm:space-x-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 text-xs sm:text-sm font-extrabold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-black text-black'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Past Orders &amp; Live Tracking ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`py-3 text-xs sm:text-sm font-extrabold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upload'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Upload className="w-4 h-4 text-rose-600" />
          <span>Upload Prescription</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 text-xs sm:text-sm font-extrabold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'info'
              ? 'border-black text-black'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Info</span>
        </button>
      </div>

      {/* ── 3. TAB 1: PAST ORDERS & LIVE TRACKING ── */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-black uppercase tracking-tight">Order History &amp; Delivery Telemetry</h2>
            <button
              onClick={fetchOrders}
              className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>

          {loadingOrders ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs font-bold text-slate-400">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-black">No past orders found</h3>
              <p className="text-xs text-slate-500 font-medium">Upload a doctor prescription or shop from our store.</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-all cursor-pointer"
              >
                Upload Doctor Prescription
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const status = order.order_status || order.status || 'Pending';
                const stepIndex =
                  status === 'Pending' ? 1 :
                  status === 'Approved' ? 2 :
                  status === 'Out for Delivery' ? 3 : 4;

                return (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
                    {/* Top Row: ID, Date, Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-black">Order #{order.id}</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            ${Number(order.total_amount || 25.00).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleString()} • {order.payment_method || 'Cash on Delivery'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadInvoicePDF(order)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Download Official Tax Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-rose-600" />
                          <span>Receipt PDF</span>
                        </button>
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3.5 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Re-order the same items"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>
                      </div>
                    </div>


                    {/* Visual 4-Step Stepper */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        <span className={stepIndex >= 1 ? 'text-black font-black' : ''}>1. Submitted</span>
                        <span className={stepIndex >= 2 ? 'text-black font-black' : ''}>2. Pharmacist Verified</span>
                        <span className={stepIndex >= 3 ? 'text-black font-black' : ''}>3. Out for Delivery</span>
                        <span className={stepIndex >= 4 ? 'text-emerald-700 font-black' : ''}>4. Delivered</span>
                      </div>

                      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-500"
                          style={{
                            width:
                              stepIndex === 1 ? '25%' :
                              stepIndex === 2 ? '50%' :
                              stepIndex === 3 ? '75%' : '100%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Prescription Photo Attachment if present */}
                    {order.prescription_image_url && (
                      <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-3">
                        <Camera className="w-5 h-5 text-rose-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-extrabold text-black block">Doctor Prescription Image Attached</span>
                          <span className="text-[10px] text-slate-500 font-semibold truncate block">
                            Verified by Licensed Pharmacist • Status: {status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 4. TAB 2: UPLOAD PRESCRIPTION DIRECTLY FROM PROFILE ── */}
      {activeTab === 'upload' && (
        <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Digital Pharmacist Verification
              </span>
              <h2 className="text-xl font-extrabold text-black mt-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-600" />
                Upload Doctor Prescription Photo
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Snap or select photos of your doctor's prescription. Our licensed pharmacist will verify the medication and dispatch it immediately.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50 hover:bg-rose-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-xs border border-slate-200">
                <Upload className="w-6 h-6" />
              </div>

              <h3 className="font-bold text-black text-xs">
                Drag &amp; drop prescription photo, or <span className="text-rose-600 underline">browse</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Supports JPEG, PNG, WEBP (Max 5 photos)
              </p>
            </div>

            {/* Uploaded Previews */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {files.map((file, index) => (
                  <div key={index} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={file.preview} alt={`Prescription ${index + 1}`} className="w-full h-28 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-rose-600 text-white rounded-full p-1 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              Delivery Destination &amp; Pharmacist Instructions
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter campus hall, room number or delivery address..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-black font-medium focus:outline-none focus:border-black min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Dosage / Pharmacist Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prefer generic substitutes if brand out of stock"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-black font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || files.length === 0 || !deliveryAddress}
            className="w-full py-4 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FileCheck2 className="w-5 h-5 text-rose-400" />
                <span>Submit Prescription for Pharmacist Verification</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ── 5. TAB 3: PERSONAL INFO & SECURITY ── */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Edit Profile & Account Details Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-black uppercase tracking-wider flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Update Profile &amp; Gmail Address</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Changing your Gmail address requires 6-digit OTP email verification for security.
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                OTP Protected
              </span>
            </div>

            {!profileOtpSent ? (
              <form onSubmit={handleSendProfileOtp} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Gmail / Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{updatingProfile ? 'Processing...' : (editEmail.trim().toLowerCase() !== user?.email?.toLowerCase() ? 'Send OTP to Verify New Email' : 'Save Name Changes')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full sm:w-auto px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Sign Out Account
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Enter OTP Code for New Email */
              <form onSubmit={handleVerifyAndUpdateProfile} className="space-y-4 max-w-md bg-blue-50/50 p-6 rounded-2xl border border-blue-200">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">Enter 6-Digit Email OTP</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Verification code sent to <strong>{editEmail}</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={profileOtp}
                    onChange={(e) => setProfileOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] text-xl font-black py-3 bg-white border-2 border-blue-300 rounded-xl text-blue-900 placeholder:tracking-normal focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile || profileOtp.length < 6}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{updatingProfile ? 'Verifying...' : 'Verify OTP & Update Email'}</span>
                </button>

                <div className="flex justify-between items-center text-xs font-bold pt-1">
                  <button
                    type="button"
                    onClick={() => setProfileOtpSent(false)}
                    className="text-slate-500 hover:text-black cursor-pointer"
                  >
                    ← Cancel / Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleSendProfileOtp}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <span>🔐 Change Password</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Update your account password to keep your profile and order history secure.
              </p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="px-6 py-3 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 transition-all"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
