import mongoose from 'mongoose';
import { env } from './config/env.js';

const conectarDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('¡Conexión exitosa a MongoDB Atlas!');
  } catch (error) {
    console.error(
      'Error al conectar a MongoDB Atlas (verifica MONGO_URI y que Network Access en Atlas permita 0.0.0.0/0 para Render):',
      error
    );
    // Detiene el proceso si falla la conexión inicial con MongoDB Atlas
    process.exit(1);
  }
};

export default conectarDB;
