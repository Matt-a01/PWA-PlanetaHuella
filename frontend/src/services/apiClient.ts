// Cliente HTTP centralizado con inyección automática de JWT Bearer, timeout e interceptor 401

const REQUEST_TIMEOUT_MS = 35_000;

const resolverApiBase = (): string => {
  const rawLimpio = (import.meta.env.VITE_API_URL as string | undefined)
    ?.trim()
    .replace(/^["']+|["']+$/g, '')
    .trim()
    .replace(/\/+$/, '');

  if (rawLimpio) {
    const conProtocolo =
      rawLimpio.startsWith('http://') ||
      rawLimpio.startsWith('https://') ||
      rawLimpio.startsWith('/')
        ? rawLimpio
        : `https://${rawLimpio}`;

    if (conProtocolo.toLowerCase().endsWith('/api/auth')) {
      return conProtocolo.slice(0, -5);
    }
    if (conProtocolo.toLowerCase().endsWith('/api')) {
      return conProtocolo;
    }
    return `${conProtocolo}/api`;
  }

  const esEntornoLocal =
    typeof window === 'undefined' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (esEntornoLocal) {
    return 'http://localhost:3000/api';
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('planeta-huella-frontend') &&
    window.location.hostname.endsWith('.onrender.com')
  ) {
    const backendHost = window.location.hostname.replace(
      'planeta-huella-frontend',
      'planeta-huella-backend'
    );
    return `https://${backendHost}/api`;
  }

  return '/api';
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
  headers.set('Accept', 'application/json');
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = obtenerTokenAlmacenado();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      method,
      headers,
      signal: init?.signal ?? controller.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(
        'El servidor tardó demasiado en responder. Si el backend en Render estaba en reposo, intenta nuevamente en unos segundos.',
        0,
        true
      );
    }
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet o la configuración del backend.',
      0,
      true
    );
  } finally {
    clearTimeout(timeoutId);
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

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const rawText = await response.text().catch(() => '');

  let data: (Record<string, unknown> & { error?: string; message?: string }) | null = null;
  if (rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText) as Record<string, unknown> & {
        error?: string;
        message?: string;
      };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const mensaje =
      (typeof data?.error === 'string' && data.error) ||
      (typeof data?.message === 'string' && data.message) ||
      `Error del servidor (${response.status}). Verifica que VITE_API_URL apunte al servicio Backend en Render.`;
    throw new ApiError(mensaje, response.status, false);
  }

  // Detecta cuando un sitio estático devuelve index.html (text/html) por falta de VITE_API_URL
  if (data === null || contentType.includes('text/html')) {
    throw new ApiError(
      'No se recibió respuesta de la API (se recibió HTML estático). Configura VITE_API_URL en el Frontend de Render apuntando a la URL de tu Backend.',
      502,
      false
    );
  }

  return data as T;
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
