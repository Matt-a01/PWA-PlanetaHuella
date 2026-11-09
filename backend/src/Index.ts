import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import { env, esOrigenPermitido } from './config/env.js';
import conectarDB, { obtenerUltimoErrorDB } from './database.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import petsRoutes from './routes/pets.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import medicalRoutes from './routes/medical.routes.js';
import catalogRoutes from './routes/catalog.routes.js';

const app = express();

// Necesario detrás del balanceador / reverse proxy de Render para X-Forwarded-For y express-rate-limit
app.set('trust proxy', 1);

// Configuración de CORS aplicada ANTES de Helmet y rate-limiting para garantizar preflights OPTIONS 204
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (esOrigenPermitido(origin)) {
      callback(null, true);
      return;
    }
    console.warn(
      `⚠️ Petición bloqueada por CORS desde el origen "${origin}". Orígenes permitidos: ${env.corsOrigins.join(', ')}`
    );
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('/{*splat}', cors(corsOptions));

// Cabeceras HTTP de seguridad (OWASP) permitiendo consumo cross-origin desde el Frontend en Render
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());

// Límite controlado de 2 MB para payloads JSON e imágenes comprimidas
app.use(express.json({ limit: '2mb' }));

// Limitador general de peticiones sobre la API
app.use('/api', apiLimiter);

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

  res.status(200).json({
    ok: conectado,
    status: conectado ? 'online' : 'degraded',
    database: estadosConexion[readyState] ?? 'unknown',
    ...(obtenerUltimoErrorDB() ? { dbError: obtenerUltimoErrorDB() } : {}),
    timestamp: new Date().toISOString(),
  });
});

// Garantiza conexión activa a MongoDB Atlas antes de procesar rutas de datos (evitando 502 sin cabeceras CORS)
app.use('/api', async (_req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
    return;
  }

  const conectado = await conectarDB();
  if (!conectado) {
    res.status(503).json({
      ok: false,
      error:
        'El servidor backend está activo, pero no pudo conectarse a MongoDB Atlas. Verifica MONGO_URI en Render y que Network Access en MongoDB Atlas tenga permitido 0.0.0.0/0.',
    });
    return;
  }

  next();
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

const iniciarServidor = (): void => {
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${env.PORT}`);
    void conectarDB();
  });
};

iniciarServidor();
