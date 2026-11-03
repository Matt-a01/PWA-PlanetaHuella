import { create } from 'zustand';
import { registerUnauthorizedHandler } from '../services/apiClient';
import { fetchCurrentUser } from '../services/authService';
import { usePetStore } from './usePetStore';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role?: 'user' | 'admin';
  roles?: string[];
  createdAt?: string;
}

const normalizarValorRol = (valor: unknown): string =>
  String(valor ?? '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim()
    .toLowerCase();

// Detecta con comparación estricta si la cuenta posee el rol 'admin' en 'role' o en 'roles'
export const esUsuarioAdmin = (user?: User | null): boolean => {
  if (!user) return false;
  const esAdminDirecto = normalizarValorRol(user.role) === 'admin';
  const esAdminEnArreglo =
    Array.isArray(user.roles) &&
    user.roles.some((r) => normalizarValorRol(r) === 'admin');
  return esAdminDirecto || esAdminEnArreglo;
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

const leerSesionInicial = (): { user: User | null; token: string | null } => {
  try {
    if (typeof localStorage === 'undefined') {
      return { user: null, token: null };
    }
    // Limpia cualquier residuo histórico inseguro de versiones previas
    localStorage.removeItem('ph_registered_users');

    const savedUserRaw = localStorage.getItem('ph_user');
    const savedToken = localStorage.getItem('ph_token');

    if (!savedUserRaw || !savedToken) {
      return { user: null, token: null };
    }

    const parsedUser = JSON.parse(savedUserRaw) as User;
    return {
      user: normalizarUsuario(parsedUser),
      token: savedToken,
    };
  } catch {
    return { user: null, token: null };
  }
};

const sesionInicial = leerSesionInicial();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: sesionInicial.user,
  token: sesionInicial.token,
  isAuthenticated: Boolean(sesionInicial.token && sesionInicial.user),

  login: (user: User, token: string) => {
    const userConRol = normalizarUsuario(user)!;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ph_user', JSON.stringify(userConRol));
      localStorage.setItem('ph_token', token);
    }
    set({ user: userConRol, token, isAuthenticated: true });
  },

  // Sincroniza usuario y JWT actualizado mediante GET /api/auth/me (ej. tras promoción a admin en Atlas)
  sincronizarRolDesdeBD: async () => {
    const { user: actual, token: tokenActual } = get();
    if (!actual || !tokenActual) return;

    const respuesta = await fetchCurrentUser();
    if (respuesta?.ok && respuesta.user) {
      const nuevoUsuario = normalizarUsuario({
        ...actual,
        ...respuesta.user,
      })!;
      const nuevoToken = respuesta.token || tokenActual;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ph_user', JSON.stringify(nuevoUsuario));
        localStorage.setItem('ph_token', nuevoToken);
      }

      set({
        user: nuevoUsuario,
        token: nuevoToken,
        isAuthenticated: true,
      });
    }
  },

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ph_user');
      localStorage.removeItem('ph_token');
    }
    usePetStore.getState().resetStore();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

// Conecta el interceptor global 401 de apiClient con el cierre limpio de sesión
registerUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
