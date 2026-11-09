import mongoose from 'mongoose';
import { env } from './config/env.js';
import { sembrarCatalogoInicial } from './seeds/catalog.seed.js';

let ultimoErrorDB: string | null = null;
let promesaConexionEnCurso: Promise<boolean> | null = null;

export const obtenerUltimoErrorDB = (): string | null => ultimoErrorDB;

const conectarDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    ultimoErrorDB = null;
    return true;
  }

  if (promesaConexionEnCurso) {
    return promesaConexionEnCurso;
  }

  promesaConexionEnCurso = (async () => {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      ultimoErrorDB = null;
      console.log('¡Conexión exitosa a MongoDB Atlas!');
      await sembrarCatalogoInicial();
      return true;
    } catch (error: unknown) {
      ultimoErrorDB =
        error instanceof Error ? error.message : 'Error desconocido al conectar a MongoDB Atlas';
      console.error(
        'Error al conectar a MongoDB Atlas (verifica MONGO_URI y que Network Access en Atlas permita 0.0.0.0/0 para Render):',
        error
      );
      return false;
    } finally {
      promesaConexionEnCurso = null;
    }
  })();

  return promesaConexionEnCurso;
};

export default conectarDB;
