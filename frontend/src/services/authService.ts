// frontend/src/services/authService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';

export interface AuthResponse {
  ok: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    createdAt?: string;
  };
  token?: string;
}

export const registerUser = async (fullName: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Ocurrió un error al registrar el usuario.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'No se pudo conectar con el servidor.');
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Credenciales inválidas.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'No se pudo conectar con el servidor.');
  }
};

export const getMe = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Sesión no válida.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Error al validar la sesión.');
  }
};
