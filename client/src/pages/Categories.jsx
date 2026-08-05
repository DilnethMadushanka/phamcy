import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FolderTree, Plus, Edit2, Trash2, X, Package } from 'lucide-react';

const Categories = () => {
  const { isPharmacist, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditCategory(category);
      setFormData({
        category_name: category.category_name,
        description: category.description || '',
      });
    } else {
      setEditCategory(null);
      setFormData({ category_name: '', description: '' });
    }
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.category_name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    try {
      if (editCategory) {
        await api.updateCategory(editCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <FolderTree className="w-7 h-7 text-blue-300" />
            <span>Medicine &amp; Healthcare Departments</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium max-w-2xl">
            Organize pharmaceutical products into clear categories (General, Skin Care, Dental, Baby Care, Surgical).
          </p>
        </div>

        {isPharmacist && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold px-6 py-3 rounded-full text-xs shadow-lg shadow-blue-500/30 flex items-center space-x-2 transition-all active:scale-95 border border-blue-400/30 shrink-0 cursor-pointer relative z-10"
          >
            <Plus className="w-4 h-4 text-blue-200" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold bg-white/90 rounded-2xl border border-blue-100">
          No categories registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="premium-card p-6 bg-white/95 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                    <Package className="w-5 h-5" />
                  </div>
                  {isPharmacist && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{cat.category_name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-normal line-clamp-2">
                  {cat.description || 'Verified pharmacy category department.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Department ID: #{cat.id}</span>
                <span className="text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-extrabold border border-blue-100">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl max-w-md w-full p-6 sm:p-8 font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-blue-950 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                {editCategory ? 'Edit Category' : 'Create Category'}
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
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  placeholder="e.g. Skin Care & Derm"
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category department description..."
                  className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
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
                  {editCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
