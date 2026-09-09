/**
 * Carlton Valley — Axios API Client
 *
 * Single Axios instance with:
 * - JWT request interceptor (auto-attach access token)
 * - Response interceptor for 401 → auto refresh + retry
 * - Typed helper wrappers for each API area
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// ─── Config ───────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TOKEN_KEY   = 'cv_access_token';
const REFRESH_KEY = 'cv_refresh_token';

// ─── Axios Instance ───────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ─── Token Helpers ────────────────────────────────────────────────────────
export const tokenStore = {
  getAccess:  () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY)   : null),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  setAccess:  (t: string) => localStorage.setItem(TOKEN_KEY, t),
  setRefresh: (t: string) => localStorage.setItem(REFRESH_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Request Interceptor — attach access token ────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — auto-refresh on 401 ───────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      (error.response?.data as any)?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStore.getRefresh();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        tokenStore.setAccess(data.accessToken);
        tokenStore.setRefresh(data.refreshToken);

        processQueue(null, data.accessToken);
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        // Redirect to login
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API Helper: extract error message ───────────────────────────────────
export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e: any) => e.msg).join(', ');
    }
    return data?.message || err.message || 'Request failed';
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

// ─── API Namespaces ───────────────────────────────────────────────────────

// AUTH
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; username?: string; phone?: string; address?: string; country?: string }) =>
    api.post('/api/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/api/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

// PRODUCTS
export const productsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get('/api/products', {
      params: { ...params, _t: Date.now() },
    }),
  getById: (id: string) =>
    api.get(`/api/products/${id}`, {
      params: { _t: Date.now() },
    }),
  create: (data: Record<string, unknown>) =>
    api.post('/api/products', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/products/${id}`, data),
  delete: (id: string) =>
    api.delete(`/api/products/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ success: boolean; url: string; filename: string }>('/api/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultipleImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return api.post<{ success: boolean; urls: string[]; count: number }>('/api/products/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (productId: string, colorId: string, files: File[]) => {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('colorId', colorId);
    files.forEach(f => formData.append('images', f));
    return api.post(`/api/products/${productId}/colors/${colorId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (productId: string, colorId: string, imageUrl: string) =>
    api.delete(`/api/products/${productId}/colors/${colorId}/images`, { data: { imageUrl } }),
};

// ORDERS
export const ordersApi = {
  list: (params?: Record<string, string | number>) =>
    api.get('/api/orders', {
      params: { ...params, _t: Date.now() },
    }),
  getById: (id: string) =>
    api.get(`/api/orders/${id}`, {
      params: { _t: Date.now() },
    }),
  create: (data: Record<string, unknown>) =>
    api.post('/api/orders', data),
  updateStatus: (id: string, status: string, trackingNumber?: string) =>
    api.patch(`/api/orders/${id}/status`, { status, trackingNumber }),
  delete: (id: string) =>
    api.delete(`/api/orders/${id}`),
  getLocations: () =>
    api.get('/api/orders/locations'),
};

// CATEGORIES
export const categoriesApi = {
  list: () =>
    api.get('/api/categories', {
      params: { _t: Date.now() },
    }),
  getById: (id: string) =>
    api.get(`/api/categories/${id}`, {
      params: { _t: Date.now() },
    }),
  create: (data: Record<string, unknown>) => api.post('/api/categories', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`),
};

// REVIEWS
export const reviewsApi = {
  list: (params?: { productId?: string; status?: string }) =>
    api.get('/api/reviews', { params }),
  submit: (data: Record<string, unknown>) =>
    api.post('/api/reviews', data),
  adminSubmit: (data: Record<string, unknown>) =>
    api.post('/api/reviews/admin', data),
  updateStatus: (id: string, status: 'approved' | 'rejected' | 'pending') =>
    api.patch(`/api/reviews/${id}/status`, { status }),
  delete: (id: string) =>
    api.delete(`/api/reviews/${id}`),
};

// DASHBOARD
export const dashboardApi = {
  stats: () => api.get('/api/dashboard/stats'),
};

// ANALYTICS
export const analyticsApi = {
  /**
   * Fire-and-forget: record a view, click, or add_to_bag event.
   * Silently swallows errors so it never breaks the user flow.
   */
  track: (productId: string, event: 'view' | 'click' | 'add_to_bag', country?: string) => {
    // Use a simple session fingerprint stored in sessionStorage
    let sessionId: string | null = null;
    if (typeof window !== 'undefined') {
      sessionId = sessionStorage.getItem('cv_session_id');
      if (!sessionId) {
        sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('cv_session_id', sessionId);
      }
    }
    return api
      .post('/api/analytics/track', { productId, event, sessionId, country })
      .catch(() => {}); // swallow — never block UI
  },

  /**
   * Admin: fetch per-product view/click/add_to_bag counts.
   * @param days  0 = all time, 7 = last 7 days, 30 = last 30 days
   */
  summary: (days: number = 0) =>
    api.get<{
      success: boolean;
      data: Record<string, { views: number; clicks: number; addToBag: number }>;
    }>('/api/analytics/summary', { params: { days } }),

  /**
   * Admin: clear all analytics data (wipe product_views table).
   */
  clear: () =>
    api.delete<{ success: boolean; message: string }>('/api/analytics/clear'),
};

// HOMEPAGE VIDEOS
export interface HomepageVideoItem {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  description?: string;
  videoUrl: string;
  posterUrl?: string;
  isActive: number | boolean;
  updatedAt?: string;
  createdAt?: string;
}

export const homepageVideosApi = {
  list: () => api.get<{ success: boolean; videos: HomepageVideoItem[] }>('/api/homepage-videos'),
  getByKey: (key: string) => api.get<{ success: boolean; video: HomepageVideoItem }>(`/api/homepage-videos/${key}`),
  uploadVideoFile: (file: File, sectionKey?: string) => {
    const formData = new FormData();
    formData.append('video', file);
    if (sectionKey) formData.append('sectionKey', sectionKey);
    return api.post<{ success: boolean; videoUrl: string; filename: string }>('/api/homepage-videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: string, data: Partial<HomepageVideoItem> | FormData) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return api.put<{ success: boolean; video: HomepageVideoItem; message: string }>(`/api/homepage-videos/${id}`, data, {
      headers,
    });
  },
  reset: () => api.post<{ success: boolean; message: string }>('/api/homepage-videos/reset'),
};

// ─── USERS ─────────────────────────────────────────────────────────────────
export interface UserItem {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  country?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt?: string;
  ordersCount?: number;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  customerCount: number;
  countries: { [key: string]: number };
}

export const usersApi = {
  list: (params?: { role?: string; country?: string; search?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; users: UserItem[]; total: number; stats: UserStats }>('/api/users', {
      params: { ...params, _t: Date.now() },
    }),
  create: (data: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'customer';
    country?: string;
    phone?: string;
    address?: string;
  }) => api.post<{ success: boolean; message: string; user: UserItem }>('/api/users', data),
  update: (id: string, data: Partial<UserItem> & { password?: string }) =>
    api.put<{ success: boolean; message: string; user: UserItem }>(`/api/users/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/api/users/${id}`),
};

// ─── COMMUNITY SPOTLIGHT ───────────────────────────────────────────────────
export interface CommunitySpotlightItem {
  id: string;
  username: string;
  image: string;
  productTagged?: string;
  link?: string;
  sortOrder?: number;
  isActive: number | boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const communitySpotlightApi = {
  list: (params?: { activeOnly?: boolean }) =>
    api.get<{ success: boolean; spotlights: CommunitySpotlightItem[] }>('/api/community-spotlight', {
      params: { ...params, _t: Date.now() },
    }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ success: boolean; imageUrl: string; filename: string }>(
      '/api/community-spotlight/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
  create: (data: Partial<CommunitySpotlightItem> | FormData) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return api.post<{ success: boolean; message: string; spotlight: CommunitySpotlightItem }>(
      '/api/community-spotlight',
      data,
      { headers }
    );
  },
  update: (id: string, data: Partial<CommunitySpotlightItem> | FormData) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return api.put<{ success: boolean; message: string; spotlight: CommunitySpotlightItem }>(
      `/api/community-spotlight/${id}`,
      data,
      { headers }
    );
  },
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/community-spotlight/${id}`),
  reset: () =>
    api.post<{ success: boolean; message: string }>('/api/community-spotlight/reset'),
};

/**
 * Normalizes image URLs from local public paths, backend uploads, or full URLs.
 * Provides safe fallback if image is missing.
 */
export function getImageUrl(url?: string | null, fallback = '/images/cat_shop_all.jpg'): string {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/api/uploads/')) {
    const backend = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    return backend ? `${backend}${trimmed}` : trimmed;
  }
  return trimmed;
}

