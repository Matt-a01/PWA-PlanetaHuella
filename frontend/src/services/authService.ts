import { apiGet, apiPost, ApiError } from './apiClient';

export interface AuthUserDTO {
  id: string;
  fullName: string;
  email: string;
  role?: 'user' | 'admin';
  roles?: string[];
  authProvider?: 'local' | 'google' | 'apple';
  emailVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  ok: boolean;
  message?: string;
  error?: string;
  user?: AuthUserDTO;
  token?: string;
  requiresVerification?: boolean;
  email?: string;
  emailDelivery?: {
    provider: 'brevo' | 'resend' | 'smtp' | 'simulation';
    sent: boolean;
  };
  devCode?: string;
  devEmailHtml?: string;
}

export interface OAuthLoginPayload {
  provider: 'google' | 'apple';
  idToken?: string;
  accessToken?: string;
  email?: string;
  fullName?: string;
}

const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor. Verifica tu conexión a internet.';

const manejarErrorRed = (error: unknown): never => {
  if (error instanceof ApiError && error.isNetworkError) {
    throw new Error(MENSAJE_SIN_CONEXION);
  }
  throw error;
};

// Registra una nueva cuenta y envía código OTP de 6 dígitos al correo electrónico
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
    return manejarErrorRed(error);
  }
};

// Verifica el código OTP de 6 dígitos enviado al correo electrónico
export const verifyEmailCode = async (
  email: string,
  code: string
): Promise<AuthResponse> => {
  try {
    return await apiPost<AuthResponse>('/auth/verify-email', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    });
  } catch (error) {
    return manejarErrorRed(error);
  }
};

// Reenvía un nuevo código OTP de 6 dígitos para verificar la cuenta
export const resendVerificationCode = async (email: string): Promise<AuthResponse> => {
  try {
    return await apiPost<AuthResponse>('/auth/resend-verification', {
      email: email.trim().toLowerCase(),
    });
  } catch (error) {
    return manejarErrorRed(error);
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
    return manejarErrorRed(error);
  }
};

// Solicita envío de código OTP de 6 dígitos para restablecer la contraseña olvidada
export const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
  try {
    return await apiPost<AuthResponse>('/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    });
  } catch (error) {
    return manejarErrorRed(error);
  }
};

// Valida el código OTP de 6 dígitos y establece la nueva contraseña de la cuenta
export const resetPasswordWithCode = async (
  email: string,
  code: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    return await apiPost<AuthResponse>('/auth/reset-password', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
      newPassword,
    });
  } catch (error) {
    return manejarErrorRed(error);
  }
};

// Autentica o registra al usuario mediante Google o Apple OAuth
export const oauthLogin = async (payload: OAuthLoginPayload): Promise<AuthResponse> => {
  try {
    return await apiPost<AuthResponse>('/auth/oauth', payload);
  } catch (error) {
    return manejarErrorRed(error);
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
