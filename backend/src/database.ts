// backend/src/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

const conectarDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("Falta la variable de entorno MONGO_URI");
        }
        
        // Conectamos a MongoDB Atlas
        await mongoose.connect(uri);
        console.log("¡Conexión exitosa a MongoDB Atlas!");
        
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        process.exit(1); // Detiene el servidor si hay un error crítico
    }
};

export default conectarDB;