// frontend/src/store/useAuthStore.ts
import { create } from 'zustand';

export interface User {
  id: string;
  fullName: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const savedUser = localStorage.getItem('ph_user');
const savedToken = localStorage.getItem('ph_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,

  login: (user, token) => {
    localStorage.setItem('ph_user', JSON.stringify(user));
    localStorage.setItem('ph_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('ph_user');
    localStorage.removeItem('ph_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
