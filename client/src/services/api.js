const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('pharmacy_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getDemoUser = (email = 'user@pharmacy.com', name = null) => {
  const stored = localStorage.getItem('pharmacy_demo_user');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  const role = (email && email.toLowerCase().includes('admin')) ? 'Admin' : 'Customer';
  return {
    id: 1,
    name: name || (email ? email.split('@')[0] : 'Demo User'),
    email: email || 'demo@pharmacy.com',
    role: role,
    phone: '0771234567',
  };
};

const saveDemoUser = (user) => {
  localStorage.setItem('pharmacy_demo_user', JSON.stringify(user));
  localStorage.setItem('pharmacy_token', 'demo_token_' + Date.now());
};

const parseResponse = async (res) => {
  const text = await res.text();
  let data = {};
  if (text && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = { message: text };
    }
  }
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('pharmacy_token');
    }
    // Handle HTML 405/404 error responses gracefully
    if (res.status === 405 || res.status === 404 || text.includes('405 Not Allowed') || text.includes('<!DOCTYPE')) {
      const err = new Error('Static Host Demo Mode (No backend endpoint)');
      err.isStaticHostError = true;
      throw err;
    }
    const errorMsg = data.message || data.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await parseResponse(res);
    } catch (err) {
      if (err.isStaticHostError || err.message?.includes('Failed to fetch') || err.message?.includes('405')) {
        console.warn('Backend unavailable (405/Static host). Activating Demo User mode.');
        const user = getDemoUser(email);
        const token = 'demo_token_' + Date.now();
        saveDemoUser(user);
        return { token, user };
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await parseResponse(res);
    } catch (err) {
      if (err.isStaticHostError || err.message?.includes('Failed to fetch') || err.message?.includes('405')) {
        console.warn('Backend unavailable (405/Static host). Registering Demo User.');
        const user = {
          id: Date.now(),
          name: userData.name || 'New Patient',
          email: userData.email || 'patient@pharmacy.com',
          role: 'Customer',
          phone: userData.phone || '0770000000',
        };
        const token = 'demo_token_' + Date.now();
        saveDemoUser(user);
        return { token, user };
      }
      throw err;
    }
  },

  googleAuth: async (googleData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      });
      return await parseResponse(res);
    } catch (err) {
      if (err.isStaticHostError || err.message?.includes('Failed to fetch') || err.message?.includes('405')) {
        console.warn('Backend unavailable (405/Static host). Logging in with Google Demo User.');
        const user = {
          id: Date.now(),
          name: googleData.name || googleData.email?.split('@')[0] || 'Google Patient',
          email: googleData.email || 'googlepatient@gmail.com',
          role: 'Customer',
          phone: '0770000000',
        };
        const token = 'demo_token_' + Date.now();
        saveDemoUser(user);
        return { token, user };
      }
      throw err;
    }
  },

  forgotPassword: async (email, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    return parseResponse(res);
  },

  sendOtp: async (email, type) => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type }),
    });
    return parseResponse(res);
  },

  verifyOtpRegister: async (data) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  verifyOtpResetPassword: async (data) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return parseResponse(res);
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  getMe: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      return await parseResponse(res);
    } catch (err) {
      if (err.isStaticHostError || err.message?.includes('Failed to fetch') || err.message?.includes('405')) {
        const token = localStorage.getItem('pharmacy_token');
        if (token) {
          const user = getDemoUser();
          return { user };
        }
      }
      throw err;
    }
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/users`, { headers: getHeaders() });
    return parseResponse(res);
  },

  updateUserRole: async (id, role) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return parseResponse(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
    return parseResponse(res);
  },

  createCategory: async (category) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(category),
    });
    return parseResponse(res);
  },

  updateCategory: async (id, category) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(category),
    });
    return parseResponse(res);
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`, { headers: getHeaders() });
    return parseResponse(res);
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return parseResponse(res);
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return parseResponse(res);
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  // Suppliers
  getSuppliers: async () => {
    const res = await fetch(`${API_BASE}/suppliers`, { headers: getHeaders() });
    return parseResponse(res);
  },

  createSupplier: async (supplier) => {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(supplier),
    });
    return parseResponse(res);
  },

  updateSupplier: async (id, supplier) => {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(supplier),
    });
    return parseResponse(res);
  },

  deleteSupplier: async (id) => {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  getPurchaseOrders: async () => {
    const res = await fetch(`${API_BASE}/suppliers/purchase-orders`, { headers: getHeaders() });
    return parseResponse(res);
  },

  generatePO: async (supplierId) => {
    const res = await fetch(`${API_BASE}/suppliers/purchase-orders`, { headers: getHeaders() });
    return parseResponse(res);
  },

  // Sales / POS
  createSale: async (saleData) => {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(saleData),
    });
    return parseResponse(res);
  },

  getSales: async () => {
    const res = await fetch(`${API_BASE}/sales`, { headers: getHeaders() });
    return parseResponse(res);
  },

  getSaleById: async (id) => {
    const res = await fetch(`${API_BASE}/sales/${id}`, { headers: getHeaders() });
    return parseResponse(res);
  },

  // Online Customer Orders
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return parseResponse(res);
  },

  uploadPrescriptions: async (formData) => {
    const token = localStorage.getItem('pharmacy_token');
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return parseResponse(res);
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, { headers: getHeaders() });
    return parseResponse(res);
  },

  getAllOrders: async (status = 'all') => {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/orders${query}`, { headers: getHeaders() });
    return parseResponse(res);
  },

  updateOrderStatus: async (id, order_status) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ order_status }),
    });
    return parseResponse(res);
  },

  // Reports & Overview
  getDashboardOverview: async () => {
    const res = await fetch(`${API_BASE}/reports/overview`, { headers: getHeaders() });
    return parseResponse(res);
  },

  getRevenueAnalytics: async () => {
    const res = await fetch(`${API_BASE}/reports/revenue`, { headers: getHeaders() });
    return parseResponse(res);
  },

  getExpiryLossReport: async () => {
    const res = await fetch(`${API_BASE}/reports/expiry-loss`, { headers: getHeaders() });
    return parseResponse(res);
  },

  getProductMovement: async () => {
    const res = await fetch(`${API_BASE}/reports/product-movement`, { headers: getHeaders() });
    return parseResponse(res);
  },

  // Live Support Chat
  sendChatMessage: async (message, customer_id = null) => {
    const res = await fetch(`${API_BASE}/support/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, customer_id }),
    });
    return parseResponse(res);
  },

  getChatMessages: async (customer_id = null) => {
    const query = customer_id ? `?customer_id=${customer_id}` : '';
    const res = await fetch(`${API_BASE}/support/messages${query}`, { headers: getHeaders() });
    return parseResponse(res);
  },

  getSupportConversations: async () => {
    const res = await fetch(`${API_BASE}/support/conversations`, { headers: getHeaders() });
    return parseResponse(res);
  },

  markChatRead: async (customer_id = null) => {
    const res = await fetch(`${API_BASE}/support/read`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ customer_id }),
    });
    return parseResponse(res);
  },

  endChat: async (customer_id = null) => {
    const res = await fetch(`${API_BASE}/support/end`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ customer_id }),
    });
    return parseResponse(res);
  },

  // Newsletter
  subscribeNewsletter: async (email) => {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return parseResponse(res);
  },
};
