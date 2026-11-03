// Cliente HTTP centralizado con inyección automática de JWT Bearer e interceptor 401

const resolverApiBase = (): string => {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, '');
  if (raw) {
    if (raw.toLowerCase().endsWith('/api/auth')) {
      return raw.slice(0, -5);
    }
    if (raw.toLowerCase().endsWith('/api')) {
      return raw;
    }
    return `${raw}/api`;
  }

  const esEntornoLocal =
    typeof window === 'undefined' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  return esEntornoLocal ? 'http://localhost:3000/api' : '/api';
};

export const API_BASE = resolverApiBase();

export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;

  constructor(message: string, status = 0, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

type UnauthorizedHandler = () => void;

let onUnauthorizedCallback: UnauthorizedHandler | null = null;

// Permite a useAuthStore registrar el cierre de sesión limpio sin dependencias circulares
export const registerUnauthorizedHandler = (handler: UnauthorizedHandler): void => {
  onUnauthorizedCallback = handler;
};

const normalizarRuta = (endpoint: string): string => {
  const limpio = endpoint.trim();
  return limpio.startsWith('/') ? limpio : `/${limpio}`;
};

const obtenerTokenAlmacenado = (): string | null => {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('ph_token');
  } catch {
    return null;
  }
};

const ejecutarSolicitud = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: unknown,
  init?: RequestInit
): Promise<T> => {
  const ruta = normalizarRuta(endpoint);
  const url = `${API_BASE}${ruta}`;

  const headers = new Headers(init?.headers);
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = obtenerTokenAlmacenado();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      0,
      true
    );
  }

  const esRutaLogin = ruta === '/auth/login' || ruta.startsWith('/auth/login?');

  if (response.status === 401 && !esRutaLogin) {
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ph_token');
      localStorage.removeItem('ph_user');
    }
  }

  const data = (await response.json().catch(() => null)) as
    | (Record<string, unknown> & { error?: string; message?: string })
    | null;

  if (!response.ok) {
    const mensaje =
      (typeof data?.error === 'string' && data.error) ||
      (typeof data?.message === 'string' && data.message) ||
      'Ocurrió un error al procesar la solicitud.';
    throw new ApiError(mensaje, response.status, false);
  }

  return (data ?? ({ ok: true } as unknown)) as T;
};

export const apiGet = <T>(endpoint: string, init?: RequestInit): Promise<T> =>
  ejecutarSolicitud<T>('GET', endpoint, undefined, init);

export const apiPost = <T>(endpoint: string, body?: unknown, init?: RequestInit): Promise<T> =>
  ejecutarSolicitud<T>('POST', endpoint, body, init);

export const apiPut = <T>(endpoint: string, body?: unknown, init?: RequestInit): Promise<T> =>
  ejecutarSolicitud<T>('PUT', endpoint, body, init);

export const apiPatch = <T>(endpoint: string, body?: unknown, init?: RequestInit): Promise<T> =>
  ejecutarSolicitud<T>('PATCH', endpoint, body, init);

export const apiDelete = <T>(endpoint: string, init?: RequestInit): Promise<T> =>
  ejecutarSolicitud<T>('DELETE', endpoint, undefined, init);
