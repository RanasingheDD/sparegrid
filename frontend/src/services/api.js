import axios from 'axios'

const api = axios.create({
  baseURL: //'http://localhost:8000',
  'https://sparegrid-4k4f.vercel.app',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler — clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const response = await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.results; // Returns array of {url, public_id}
  },
  deleteImage: async (publicId) => {
    const response = await api.delete(`/products/upload`, { params: { public_id: publicId } });
    return response.data;
  },
  update: (id, data) => api.put(`/products/${id}`, data),
  updateStock: (id, stock_count, status) => api.put(`/products/${id}/stock`, null, { params: { stock_count, status } }),
  delete: (id) => api.delete(`/products/${id}`),
  myProducts: () => api.get('/products/seller/my'),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (productId, data) => api.post(`/requests/${productId}`, data),
  checkStatus: (productId) => api.get(`/requests/check/${productId}`),
  getBuying: () => api.get('/orders/buying'),
  getSelling: () => api.get('/orders/selling'),
}

export const policyAPI = {
  getPublic: () => api.get('/policies/public'),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getProducts: (status) => api.get('/admin/products', { params: status ? { status } : {} }),
  approveProduct: (id, status) => api.put(`/admin/products/${id}/approve`, null, { params: { status } }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getRequests: (status) => api.get('/admin/requests', { params: status ? { status } : {} }),
  updateRequest: (id, data) => api.put(`/admin/requests/${id}`, data),
  getOrders: () => api.get('/admin/orders'),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserEarnings: (id, earnings) => api.put(`/admin/users/${id}/earnings`, { earnings }),
  updateUserRestriction: (id, is_restricted, reason) => api.put(`/admin/users/${id}/restriction`, { is_restricted, reason }),
}

export default api
