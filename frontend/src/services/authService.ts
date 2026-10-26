// Detecta si la app corre en entorno local o en producción (Render) para evitar bloqueos CORS loopback
const isLocalhost =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const rawEnvUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '');
const API_BASE_URL = rawEnvUrl
  ? rawEnvUrl.endsWith('/api/auth')
    ? rawEnvUrl
    : rawEnvUrl.endsWith('/api')
      ? `${rawEnvUrl}/auth`
      : `${rawEnvUrl}/api/auth`
  : isLocalhost
    ? 'http://localhost:3000/api/auth'
    : '';

export interface AuthResponse {
  ok: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role?: 'user' | 'admin';
    roles?: string[];
    createdAt?: string;
  };
  token?: string;
}

interface StoredLocalUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  roles?: string[];
  createdAt: string;
}

const LOCAL_USERS_KEY = 'ph_registered_users';

const getLocalUsers = (): StoredLocalUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email: normalizedEmail, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrar el usuario.');
      }

      return data;
    } catch (error: any) {
      if (error.message && !error.message.includes('Failed to fetch')) {
        throw error;
      }
    }
  }

  const users = getLocalUsers();
  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error('Este correo electrónico ya está registrado. Por favor inicia sesión.');
  }

  // Todo usuario nuevo inicia con rol 'user'; el rol 'admin' solo se otorga en la base de datos
  const newUser: StoredLocalUser = {
    id: `usr_${Date.now()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: 'user',
    roles: ['user'],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

  return {
    ok: true,
    message: '¡Usuario registrado exitosamente!',
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      roles: newUser.roles,
      createdAt: newUser.createdAt,
    },
    token: `token_${newUser.id}`,
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas.');
      }

      return data;
    } catch (error: any) {
      if (error.message && !error.message.includes('Failed to fetch')) {
        throw error;
      }
    }
  }

  const users = getLocalUsers();
  const found = users.find((u) => u.email === normalizedEmail);

  if (found) {
    if (found.password !== password) {
      throw new Error('Credenciales inválidas. Correo o contraseña incorrectos.');
    }
    const rolCalculado: 'user' | 'admin' =
      found.role === 'admin' || found.roles?.includes('admin') ? 'admin' : 'user';
    return {
      ok: true,
      message: '¡Bienvenido de vuelta!',
      user: {
        id: found.id,
        fullName: found.fullName,
        email: found.email,
        role: rolCalculado,
        roles: found.roles || [rolCalculado],
        createdAt: found.createdAt,
      },
      token: `token_${found.id}`,
    };
  }

  const fallbackName = normalizedEmail.split('@')[0] || 'Usuario';
  const demoUser: StoredLocalUser = {
    id: `usr_${Date.now()}`,
    fullName: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
    email: normalizedEmail,
    password,
    role: 'user',
    roles: ['user'],
    createdAt: new Date().toISOString(),
  };

  users.push(demoUser);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

  return {
    ok: true,
    message: '¡Bienvenido de vuelta!',
    user: {
      id: demoUser.id,
      fullName: demoUser.fullName,
      email: demoUser.email,
      role: demoUser.role,
      roles: demoUser.roles,
      createdAt: demoUser.createdAt,
    },
    token: `token_${demoUser.id}`,
  };
};

// Consulta el usuario directamente en MongoDB para reflejar cambios de rol hechos en la base de datos
export const fetchUserFromDB = async (userId: string): Promise<AuthResponse['user'] | null> => {
  if (API_BASE_URL && userId && !userId.startsWith('usr_')) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`);
      const data = await response.json();
      if (data.ok && data.user) {
        return data.user;
      }
    } catch {
      // Si no hay conexión con el servidor, verifica el registro local
    }
  }

  const found = getLocalUsers().find((u) => u.id === userId);
  if (found) {
    const rolCalculado: 'user' | 'admin' =
      found.role === 'admin' || found.roles?.includes('admin') ? 'admin' : 'user';
    return {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      role: rolCalculado,
      roles: found.roles || [rolCalculado],
      createdAt: found.createdAt,
    };
  }

  return null;
};
