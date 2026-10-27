import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const conectarDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('Falta la variable de entorno MONGO_URI');
    }

    await mongoose.connect(uri);
    console.log('¡Conexión exitosa a MongoDB Atlas!');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    // Detiene el proceso si falla la conexión inicial con MongoDB Atlas
    process.exit(1);
  }
};

export default conectarDB;
