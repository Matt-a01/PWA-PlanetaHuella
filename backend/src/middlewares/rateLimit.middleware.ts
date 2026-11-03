import { rateLimit } from 'express-rate-limit';

// Límite estricto contra fuerza bruta en endpoints de registro e inicio de sesión
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Demasiados intentos de autenticación desde esta dirección IP. Intenta de nuevo en 15 minutos.',
  },
});

// Límite general para proteger los endpoints bajo /api/*
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 150,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Se ha excedido el límite de peticiones por minuto. Intenta nuevamente en unos segundos.',
  },
});
