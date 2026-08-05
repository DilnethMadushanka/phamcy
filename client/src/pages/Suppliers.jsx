import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
} from 'lucide-react';
import PurchaseOrderModal from '../components/PurchaseOrderModal';

const Suppliers = () => {
  const { isPharmacist, isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);

  const [purchaseOrdersData, setPurchaseOrdersData] = useState(null);
  const [poModalOpen, setPoModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    supplier_name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.getSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditSupplier(supplier);
      setFormData({
        supplier_name: supplier.supplier_name,
        company_name: supplier.company_name,
        phone: supplier.phone,
        email: supplier.email || '',
        address: supplier.address || '',
      });
    } else {
      setEditSupplier(null);
      setFormData({
        supplier_name: '',
        company_name: '',
        phone: '',
        email: '',
        address: '',
      });
    }
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.supplier_name || !formData.company_name || !formData.phone) {
      setErrorMsg('Supplier Name, Company Name, and Phone are required!');
      return;
    }

    try {
      if (editSupplier) {
        await api.updateSupplier(editSupplier.id, formData);
      } else {
        await api.createSupplier(formData);
      }
      setModalOpen(false);
      loadSuppliers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier record?')) return;
    try {
      await api.deleteSupplier(id);
      loadSuppliers();
    } catch (err) {
      alert(err.message || 'Failed to delete supplier');
    }
  };

  const handleGeneratePO = async (supplierId = null) => {
    try {
      const data = await api.getPurchaseOrders();
      if (supplierId && data && data.purchase_orders) {
        const filteredOrders = data.purchase_orders.filter(
          (o) => String(o.supplier_id) === String(supplierId)
        );
        setPurchaseOrdersData({
          ...data,
          purchase_orders: filteredOrders,
        });
      } else {
        setPurchaseOrdersData(data);
      }
      setPoModalOpen(true);
    } catch (err) {
      alert(err.message || 'Failed to generate purchase order');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <Truck className="w-7 h-7 text-blue-300" />
            <span>Pharmaceutical Supply Chain &amp; Vendors</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium max-w-2xl">
            Manage pharmaceutical distributor contacts, generate low-stock purchase orders, and track vendor contracts.
          </p>
        </div>

        {isPharmacist && (
          <div className="flex items-center space-x-3 relative z-10 shrink-0">
            <button
              onClick={() => handleGeneratePO(null)}
              className="bg-white/10 hover:bg-white/20 text-white font-extrabold px-5 py-3 rounded-full text-xs shadow-md transition-all active:scale-95 border border-white/20 flex items-center space-x-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-300" />
              <span>Generate All Low-Stock POs</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold px-6 py-3 rounded-full text-xs shadow-lg shadow-blue-500/30 flex items-center space-x-2 transition-all active:scale-95 border border-blue-400/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-200" />
              <span>Add Supplier</span>
            </button>
          </div>
        )}
      </div>

      {/* Supplier Directory Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading supplier telemetry...
        </div>
      ) : suppliers.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold bg-white/90 rounded-2xl border border-blue-100">
          No pharmaceutical suppliers registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="premium-card p-6 bg-white/95 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {isPharmacist && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenModal(sup)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        title="Edit supplier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(sup.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                          title="Delete supplier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{sup.company_name}</h3>
                <p className="text-xs text-blue-700 font-semibold mt-0.5">Contact: {sup.supplier_name}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 font-normal">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                  {sup.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{sup.email}</span>
                    </div>
                  )}
                  {sup.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{sup.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor ID #{sup.id}</span>
                {isPharmacist && (
                  <button
                    onClick={() => handleGeneratePO(sup.id)}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Generate PO</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl max-w-md w-full p-6 sm:p-8 font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-blue-950 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                {editSupplier ? 'Edit Supplier Record' : 'Register New Supplier'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full p-2 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                ⚠ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Company / Distributor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Pfizer Pharma Distributors"
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Representative Name *</label>
                <input
                  type="text"
                  required
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  placeholder="e.g. Robert Smith"
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="orders@pfizerdist.com"
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="100 Pharma Way, Suite 400"
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-full text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-full text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editSupplier ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {poModalOpen && (
        <PurchaseOrderModal
          ordersData={purchaseOrdersData}
          data={purchaseOrdersData}
          onClose={() => setPoModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Suppliers;
