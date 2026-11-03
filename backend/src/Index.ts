import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import conectarDB from './database.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import petsRoutes from './routes/pets.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import medicalRoutes from './routes/medical.routes.js';
import catalogRoutes from './routes/catalog.routes.js';

const app = express();

// Cabeceras HTTP de seguridad (OWASP) y compresión de respuestas
app.use(helmet());
app.use(compression());

// Configuración estricta de orígenes permitidos mediante CORS_ORIGIN
app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin?.trim().replace(/\/$/, '');
      if (!normalizedOrigin || env.corsOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origen no permitido por la política CORS.'));
    },
    credentials: true,
  })
);

// Límite controlado de 2 MB para payloads JSON e imágenes comprimidas
app.use(express.json({ limit: '2mb' }));

// Limitador general de peticiones sobre la API
app.use('/api', apiLimiter);

conectarDB();

// Endpoint de salud para monitoreo de estado del servidor y conexión a MongoDB
app.get('/api/health', (_req, res) => {
  const estadosConexion: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const readyState = mongoose.connection.readyState;
  const conectado = readyState === 1;

  res.status(conectado ? 200 : 503).json({
    ok: conectado,
    status: conectado ? 'online' : 'degraded',
    database: estadosConexion[readyState] ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Endpoints principales de la API RESTful
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/catalog', catalogRoutes);

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    mensaje: 'API de Planeta Huella funcionando correctamente',
    status: 'online',
  });
});

// Manejador centralizado de errores (debe registrarse después de todas las rutas)
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en el puerto ${env.PORT}`);
});
