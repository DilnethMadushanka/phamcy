import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users as UsersIcon, Shield, Mail, CheckCircle2, UserPlus, X, Lock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Users = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Staff creation modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Pharmacist',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      toast.success('User role updated successfully!');
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.register(staffForm);
      toast.success(`Staff account created for ${staffForm.name} (${staffForm.role})!`);
      setShowAddModal(false);
      setStaffForm({ name: '', email: '', password: '', role: 'Pharmacist' });
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create staff account.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600 } }} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <UsersIcon className="w-7 h-7 text-blue-300" />
            <span>Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium max-w-2xl">
            Manage system permissions and assign roles (Admin, Pharmacist, Cashier, Customer) with DB authorization.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all border border-blue-400/30 shrink-0 cursor-pointer active:scale-95 relative z-10"
        >
          <UserPlus className="w-4 h-4 text-blue-200" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white/95 rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading user accounts from database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 text-blue-900 font-extrabold uppercase tracking-wider border-b border-blue-100">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4 text-center">Modify System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          u.role === 'Admin'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : u.role === 'Pharmacist'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : u.role === 'Cashier'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-blue-50/70 border border-blue-200 rounded-full px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-blue-100 relative font-sans">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-blue-950 uppercase tracking-wide mb-1">Create Staff Account</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Create an Admin, Pharmacist, or Cashier staff account with DB authorization.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Dr. Alex Mercer"
                  className="w-full px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="alex@pharmacy.com"
                  className="w-full px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Staff Role</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all mt-2 cursor-pointer shadow-md shadow-blue-500/30"
              >
                {creating ? 'Creating Account...' : 'Create Staff Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
