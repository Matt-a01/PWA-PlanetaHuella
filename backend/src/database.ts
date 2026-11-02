import mongoose from 'mongoose';
import { env } from './config/env.js';

const conectarDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('¡Conexión exitosa a MongoDB Atlas!');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    // Detiene el proceso si falla la conexión inicial con MongoDB Atlas
    process.exit(1);
  }
};

export default conectarDB;
