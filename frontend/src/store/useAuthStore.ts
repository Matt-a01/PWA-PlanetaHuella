import { create } from 'zustand';
import { fetchUserFromDB } from '../services/authService';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role?: 'user' | 'admin';
  roles?: string[];
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  sincronizarRolDesdeBD: () => Promise<void>;
  logout: () => void;
}

const savedUser = localStorage.getItem('ph_user');
const savedToken = localStorage.getItem('ph_token');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,

  login: (user: User, token: string) => {
    const esAdmin = user.role === 'admin' || user.roles?.includes('admin');
    const userConRol: User = {
      ...user,
      role: esAdmin ? 'admin' : 'user',
      roles: user.roles?.length ? user.roles : [esAdmin ? 'admin' : 'user'],
    };
    localStorage.setItem('ph_user', JSON.stringify(userConRol));
    localStorage.setItem('ph_token', token);
    set({ user: userConRol, token, isAuthenticated: true });
  },

  // Consulta en MongoDB si al usuario se le asignó el rol 'admin' desde la base de datos
  sincronizarRolDesdeBD: async () => {
    const actual = get().user;
    if (!actual) return;

    const actualizadoBD = await fetchUserFromDB(actual.id);
    if (actualizadoBD) {
      const esAdmin =
        actualizadoBD.role === 'admin' || actualizadoBD.roles?.includes('admin');
      const nuevoUsuario: User = {
        ...actual,
        ...actualizadoBD,
        role: esAdmin ? 'admin' : 'user',
      };
      localStorage.setItem('ph_user', JSON.stringify(nuevoUsuario));
      set({ user: nuevoUsuario });
    }
  },

  logout: () => {
    localStorage.removeItem('ph_user');
    localStorage.removeItem('ph_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
