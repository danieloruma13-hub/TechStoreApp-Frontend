import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
  isOpen: false,
  setIsOpen: (val) => set({ isOpen: val }),
  
  addToCart: (product) => {
    set((state) => ({ cart: [...state.cart, product] }));
  },

  fetchCart: async () => {
    // Logic for syncing with backend if needed
    console.log("Fetching cart...");
  }
}));

// --- WISHLIST STORE ---
export const useWishlistStore = create((set) => ({
  wishlist: [],
  fetchWishlist: async () => {
    console.log("Fetching wishlist...");
  }
}));
