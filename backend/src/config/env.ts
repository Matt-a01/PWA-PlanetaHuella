import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
});

const limpiarValorEnv = (valor: unknown): unknown => {
  if (typeof valor !== 'string') return valor;
  return valor.trim().replace(/^["']+|["']+$/g, '').trim();
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce
    .number({ error: 'PORT debe ser un número válido.' })
    .int('PORT debe ser un número entero.')
    .positive('PORT debe ser mayor a 0.')
    .default(3000),
  MONGO_URI: z.preprocess(
    limpiarValorEnv,
    z
      .string({ error: 'La variable de entorno MONGO_URI es obligatoria.' })
      .min(1, 'La variable de entorno MONGO_URI no puede estar vacía.')
      .refine(
        (uri) => uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'),
        'MONGO_URI debe comenzar con mongodb:// o mongodb+srv://'
      )
  ),
  JWT_SECRET: z.preprocess(
    limpiarValorEnv,
    z
      .string({ error: 'La variable de entorno JWT_SECRET es obligatoria.' })
      .min(
        16,
        'JWT_SECRET debe tener al menos 16 caracteres (se recomiendan 32 o más caracteres aleatorios).'
      )
  ),
  CORS_ORIGIN: z
    .string()
    .trim()
    .default(
      'http://localhost:5173,http://localhost:4173,https://planeta-huella-frontend.onrender.com,https://planeta-huella-frontend-lsf3.onrender.com'
    ),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error crítico en la configuración de variables de entorno:');
  for (const issue of parsedEnv.error.issues) {
    console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const normalizarOrigenCors = (origenRaw: string): string => {
  const limpio = origenRaw
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim()
    .replace(/\/+$/, '');

  if (!limpio) return '';
  if (limpio.startsWith('http://') || limpio.startsWith('https://')) {
    return limpio;
  }
  return `https://${limpio}`;
};

const origenesPorDefecto = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://planeta-huella-frontend.onrender.com',
  'https://planeta-huella-frontend-lsf3.onrender.com',
];

const corsOrigins = Array.from(
  new Set([
    ...origenesPorDefecto,
    ...parsedEnv.data.CORS_ORIGIN.split(',')
      .map(normalizarOrigenCors)
      .filter((origin) => origin.length > 0),
  ])
);

const PATRON_FRONTEND_RENDER = /^https:\/\/planeta-huella-frontend(-[a-z0-9]+)?\.onrender\.com$/i;

export const esOrigenPermitido = (origin?: string | null): boolean => {
  if (!origin) return true;
  const normalizado = normalizarOrigenCors(origin);
  if (!normalizado) return true;
  if (corsOrigins.includes(normalizado)) return true;
  return PATRON_FRONTEND_RENDER.test(normalizado);
};

export const env = {
  ...parsedEnv.data,
  corsOrigins,
} as const;
