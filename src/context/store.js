import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('ts_user')) || null,
  token: localStorage.getItem('ts_token') || null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
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
      const res = await api.post('/auth/register', { full_name, email, password });
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

  updateProfile: async (data) => {
    try {
      const res = await api.put('/auth/me', data);
      const user = res.data.user;
      localStorage.setItem('ts_user', JSON.stringify(user));
      set({ user });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
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
      const res = await api.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('ts_user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      localStorage.clear();
      set({ user: null, token: null });
    }
  }
}));

export const useCartStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('ts_cart') || '[]'),
  count: JSON.parse(localStorage.getItem('ts_cart') || '[]').reduce((a,i) => a+i.quantity, 0),
  subtotal: JSON.parse(localStorage.getItem('ts_cart') || '[]').reduce((a,i) => a+parseFloat(i.price)*i.quantity, 0),
  drawerOpen: false,

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  addToCart: (product) => {
    set((state) => {
      const exists = state.items.find(i => i.id === product.id);
      const items = exists
        ? state.items.map(i => i.id === product.id ? {...i, quantity: i.quantity+1} : i)
        : [...state.items, {...product, quantity: 1}];
      const count = items.reduce((a,i) => a+i.quantity, 0);
      const subtotal = items.reduce((a,i) => a+parseFloat(i.price)*i.quantity, 0);
      localStorage.setItem('ts_cart', JSON.stringify(items));
      return { items, count, subtotal };
    });
  },

  updateQty: (id, qty) => {
    set((state) => {
      const items = qty <= 0
        ? state.items.filter(i => i.id !== id)
        : state.items.map(i => i.id===id ? {...i, quantity:qty} : i);
      const count = items.reduce((a,i) => a+i.quantity, 0);
      const subtotal = items.reduce((a,i) => a+parseFloat(i.price)*i.quantity, 0);
      localStorage.setItem('ts_cart', JSON.stringify(items));
      return { items, count, subtotal };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const items = state.items.filter(i => i.id !== id);
      const count = items.reduce((a,i) => a+i.quantity, 0);
      const subtotal = items.reduce((a,i) => a+parseFloat(i.price)*i.quantity, 0);
      localStorage.setItem('ts_cart', JSON.stringify(items));
      return { items, count, subtotal };
    });
  },

  clearCart: () => {
    localStorage.removeItem('ts_cart');
    set({ items: [], count: 0, subtotal: 0 });
  },

  fetchCart: async () => {}
}));

export const useWishlistStore = create((set) => ({
  wishlist: JSON.parse(localStorage.getItem('ts_wishlist') || '[]'),

  addToWishlist: (product) => {
    set((state) => {
      const exists = state.wishlist.find(i => i.id === product.id);
      if (exists) return state;
      const wishlist = [...state.wishlist, product];
      localStorage.setItem('ts_wishlist', JSON.stringify(wishlist));
      return { wishlist };
    });
  },

  removeFromWishlist: (id) => {
    set((state) => {
      const wishlist = state.wishlist.filter(i => i.id !== id);
      localStorage.setItem('ts_wishlist', JSON.stringify(wishlist));
      return { wishlist };
    });
  },

  fetchWishlist: async () => {}
}));
