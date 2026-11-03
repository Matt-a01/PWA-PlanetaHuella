import { apiGet, apiPost, ApiError } from './apiClient';

export interface AuthUserDTO {
  id: string;
  fullName: string;
  email: string;
  role?: 'user' | 'admin';
  roles?: string[];
  createdAt?: string;
}

export interface AuthResponse {
  ok: boolean;
  message?: string;
  error?: string;
  user?: AuthUserDTO;
  token?: string;
}

const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor. Verifica tu conexión a internet.';

// Registra una nueva cuenta directamente contra el backend (rol inicial estricto: 'user')
export const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    return await apiPost<AuthResponse>('/auth/register', {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  } catch (error) {
    if (error instanceof ApiError && error.isNetworkError) {
      throw new Error(MENSAJE_SIN_CONEXION);
    }
    throw error;
  }
};

// Autentica al usuario mediante credenciales reales verificadas en MongoDB Atlas
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    return await apiPost<AuthResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
  } catch (error) {
    if (error instanceof ApiError && error.isNetworkError) {
      throw new Error(MENSAJE_SIN_CONEXION);
    }
    throw error;
  }
};

// Consulta GET /api/auth/me para validar el JWT activo y obtener el rol y token sincronizados
export const fetchCurrentUser = async (): Promise<AuthResponse | null> => {
  try {
    const data = await apiGet<AuthResponse>('/auth/me');
    if (data.ok && data.user) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
};
