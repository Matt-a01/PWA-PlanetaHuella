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

// Detecta si la cuenta tiene permisos de Administrador (en 'role' o en el arreglo 'roles' de MongoDB)
export const esUsuarioAdmin = (user?: User | null): boolean => {
  if (!user) return false;
  const rolTexto = String(user.role || '').toLowerCase();
  const enArreglo =
    Array.isArray(user.roles) &&
    user.roles.some((r) => String(r).toLowerCase().includes('admin'));
  return rolTexto.includes('admin') || enArreglo;
};

const normalizarUsuario = (user: User | null): User | null => {
  if (!user) return null;
  const esAdmin = esUsuarioAdmin(user);
  return {
    ...user,
    role: esAdmin ? 'admin' : 'user',
    roles: esAdmin ? ['user', 'admin'] : ['user'],
  };
};

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
  user: savedUser ? normalizarUsuario(JSON.parse(savedUser)) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,

  login: (user: User, token: string) => {
    const userConRol = normalizarUsuario(user)!;
    localStorage.setItem('ph_user', JSON.stringify(userConRol));
    localStorage.setItem('ph_token', token);
    set({ user: userConRol, token, isAuthenticated: true });
  },

  // Consulta en MongoDB si al usuario se le asignó el rol 'admin' desde la base de datos
  sincronizarRolDesdeBD: async () => {
    const actual = get().user;
    if (!actual) return;

    const actualizadoBD = await fetchUserFromDB(actual.id, actual.email);
    if (actualizadoBD) {
      const nuevoUsuario = normalizarUsuario({
        ...actual,
        ...actualizadoBD,
      })!;
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
