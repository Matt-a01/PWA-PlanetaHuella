// backend/src/Index.ts
import express from 'express';
import cors from 'cors';
import conectarDB from './database.js';
import authRoutes from './routes/auth.routes.js';
import petsRoutes from './routes/pets.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import medicalRoutes from './routes/medical.routes.js';
import catalogRoutes from './routes/catalog.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Iniciar la conexión a la base de datos MongoDB Atlas
conectarDB();

// Rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/catalog', catalogRoutes);

// Ruta de prueba
app.get('/', (_req, res) => {
    res.json({
        mensaje: 'API de Planeta Huella funcionando correctamente',
        status: 'online'
    });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});