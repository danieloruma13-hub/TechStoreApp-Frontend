import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'https://techstoreapp-gobr.onrender.com/api';

// --- AUTH STORE ---
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('ts_user')) || null,
  token: localStorage.getItem('ts_token') || null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = res.data;
      localStorage.setItem('ts_token', token);
      localStorage.setItem('ts_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return { success: true, role: user.role };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (full_name, email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { full_name, email, password });
      const { token, user } = res.data;
      localStorage.setItem('ts_token', token);
      localStorage.setItem('ts_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  refreshUser: async () => {
    const token = localStorage.getItem('ts_token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: res.data.user });
    } catch (err) {
      localStorage.clear();
      set({ user: null, token: null });
    }
  }
}));

// --- CART STORE ---
export const useCartStore = create((set, get) => ({
  cart: [],
  count: 0,
  isOpen: false,

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),

  addToCart: (product) => {
    set((state) => {
      const exists = state.cart.find(i => i.id === product.id);
      const cart = exists
        ? state.cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state.cart, { ...product, qty: 1 }];
      const count = cart.reduce((a, i) => a + i.qty, 0);
      return { cart, count };
    });
  },

  removeFromCart: (id) => {
    set((state) => {
      const cart = state.cart.filter(i => i.id !== id);
      const count = cart.reduce((a, i) => a + i.qty, 0);
      return { cart, count };
    });
  },

  clearCart: () => set({ cart: [], count: 0 }),

  fetchCart: async () => {
    console.log("Cart ready");
  }
}));

// --- WISHLIST STORE ---
export const useWishlistStore = create((set) => ({
  wishlist: [],

  addToWishlist: (product) => {
    set((state) => {
      const exists = state.wishlist.find(i => i.id === product.id);
      if (exists) return state;
      return { wishlist: [...state.wishlist, product] };
    });
  },

  removeFromWishlist: (id) => {
    set((state) => ({ wishlist: state.wishlist.filter(i => i.id !== id) }));
  },

  fetchWishlist: async () => {
    console.log("Wishlist ready");
  }
}));
