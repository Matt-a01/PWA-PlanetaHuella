// frontend/src/services/authService.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';

export const registerUser = async (fullName: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar el usuario.');
  }
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Correo o contraseña incorrectos.');
  }
  return data;
};
