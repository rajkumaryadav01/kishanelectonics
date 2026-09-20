import {
  User,
  Product,
  Category,
  ProjectKit,
  Order,
  ShopSettings,
  NotificationItem,
  Address,
} from '../types';

const TOKEN_KEY = 'kishan_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Guest ID for guest carts
export function getGuestId(): string {
  let guestId = localStorage.getItem('kishan_guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('kishan_guest_id', guestId);
  }
  return guestId;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const guestId = getGuestId();
  headers.set('x-guest-id', guestId);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => fetchJson<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => fetchJson<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => fetchJson<{ user: User; addresses: Address[]; defaultAddress: Address | null }>('/api/auth/me'),
  updateProfile: (payload: { name: string; phone: string }) => fetchJson<{ message: string; user: User }>('/api/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (payload: any) => fetchJson<{ message: string }>('/api/auth/password', { method: 'PUT', body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => fetchJson<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Addresses
  getAddresses: () => fetchJson<Address[]>('/api/auth/addresses'),
  addAddress: (payload: any) => fetchJson<Address>('/api/auth/addresses', { method: 'POST', body: JSON.stringify(payload) }),
  updateAddress: (id: string, payload: any) => fetchJson<Address>(`/api/auth/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAddress: (id: string) => fetchJson<{ message: string }>(`/api/auth/addresses/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => fetchJson<ShopSettings>('/api/settings'),

  // Products
  getProducts: (params: Record<string, string | number | boolean> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return fetchJson<{ total: number; page: number; totalPages: number; products: Product[] }>(`/api/products?${query.toString()}`);
  },
  getProduct: (id: string) => fetchJson<Product>(`/api/products/${id}`),
  searchSuggestions: (q: string) => fetchJson<any[]>(`/api/products?suggest=true&search=${encodeURIComponent(q)}`),
  compareProducts: (ids: string[]) => fetchJson<{ products: Product[]; specificationKeys: string[] }>(`/api/products/compare?ids=${ids.join(',')}`),
  submitReview: (productId: string, payload: { rating: number; comment: string }) => fetchJson<any>(`/api/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(payload) }),
  submitQuestion: (productId: string, question: string) => fetchJson<any>(`/api/products/${productId}/questions`, { method: 'POST', body: JSON.stringify({ question }) }),

  // Categories
  getCategories: () => fetchJson<Category[]>('/api/categories'),
  getCategory: (idOrSlug: string) => fetchJson<Category & { products: Product[] }>(`/api/categories/${idOrSlug}`),

  // Project Kits
  getProjectKits: () => fetchJson<ProjectKit[]>('/api/project-kits'),
  getProjectKit: (idOrSlug: string) => fetchJson<ProjectKit>(`/api/project-kits/${idOrSlug}`),

  // Build My Project
  getBuildProjects: (category?: string) => {
    const url = category ? `/api/build-my-project/projects?category=${encodeURIComponent(category)}` : '/api/build-my-project/projects';
    return fetchJson<any[]>(url);
  },
  addBuildProjectToCart: (projectId: string) => fetchJson<any>('/api/build-my-project/add-all', { method: 'POST', body: JSON.stringify({ projectId }) }),

  // Cart
  getCart: () => fetchJson<{ items: any[]; subtotal: number; deliveryFee: number; freeDeliveryThreshold: number; total: number; currency: string }>('/api/cart'),
  addToCart: (productId: string, quantity = 1, isKit = false) => fetchJson<any>('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity, isKit }) }),
  updateCartItem: (itemId: string, quantity: number) => fetchJson<any>(`/api/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (itemId: string) => fetchJson<any>(`/api/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => fetchJson<any>('/api/cart', { method: 'DELETE' }),

  // Orders
  checkoutOrder: (payload: any) => fetchJson<{ message: string; order: Order }>('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: () => fetchJson<Order[]>('/api/orders/my'),
  getUserOrders: () => fetchJson<Order[]>('/api/orders/my'),
  getOrder: (id: string) => fetchJson<Order>(`/api/orders/${id}`),
  cancelOrder: (id: string, reason?: string) => fetchJson<any>(`/api/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Contact
  submitContactForm: (payload: any) => fetchJson<any>('/api/notifications/contact', { method: 'POST', body: JSON.stringify(payload) }),

  // Wishlist
  getWishlist: () => fetchJson<{ productIds: string[]; products: Product[] }>('/api/wishlist'),
  toggleWishlist: (productId: string) => fetchJson<{ wishlisted: boolean; productIds: string[] }>('/api/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),

  // Notifications
  getNotifications: () => fetchJson<{ items: NotificationItem[]; unreadCount: number }>('/api/notifications'),
  markNotificationRead: (id: string) => fetchJson<any>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => fetchJson<any>('/api/notifications/read-all', { method: 'POST' }),

  // Admin APIs
  admin: {
    getStats: () => fetchJson<any>('/api/admin/stats'),
    getReports: (params: any = {}) => {
      const q = new URLSearchParams(params).toString();
      return fetchJson<any>(`/api/admin/reports?${q}`);
    },
    getProducts: () => fetchJson<Product[]>('/api/admin/products'),
    createProduct: (payload: any) => fetchJson<Product>('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
    updateProduct: (id: string, payload: any) => fetchJson<Product>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteProduct: (id: string) => fetchJson<any>(`/api/admin/products/${id}`, { method: 'DELETE' }),
    updateStock: (id: string, payload: any) => fetchJson<any>(`/api/admin/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify(payload) }),
    createCategory: (payload: any) => fetchJson<Category>('/api/admin/categories', { method: 'POST', body: JSON.stringify(payload) }),
    updateCategory: (id: string, payload: any) => fetchJson<Category>(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteCategory: (id: string) => fetchJson<any>(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    getOrders: (params: any = {}) => {
      const q = new URLSearchParams(params).toString();
      return fetchJson<Order[]>(`/api/admin/orders?${q}`);
    },
    updateOrderStatus: (id: string, status: string, note?: string) => fetchJson<any>(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) }),
    getCustomers: () => fetchJson<any[]>('/api/admin/customers'),
    createProjectKit: (payload: any) => fetchJson<ProjectKit>('/api/admin/project-kits', { method: 'POST', body: JSON.stringify(payload) }),
    updateProjectKit: (id: string, payload: any) => fetchJson<ProjectKit>(`/api/admin/project-kits/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteProjectKit: (id: string) => fetchJson<any>(`/api/admin/project-kits/${id}`, { method: 'DELETE' }),
    answerQuestion: (id: string, answer: string) => fetchJson<any>(`/api/admin/questions/${id}/answer`, { method: 'POST', body: JSON.stringify({ answer }) }),
    deleteReview: (id: string) => fetchJson<any>(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
    getSettings: () => fetchJson<ShopSettings>('/api/admin/settings'),
    updateSettings: (payload: any) => fetchJson<any>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(payload) }),
    uploadImage: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return fetchJson<{ url: string; filename: string }>('/api/upload/image', { method: 'POST', body: fd });
    },
    uploadDatasheet: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return fetchJson<{ url: string; filename: string }>('/api/upload/datasheet', { method: 'POST', body: fd });
    },
  },
};
