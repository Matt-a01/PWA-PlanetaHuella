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

// Límite ampliado a 5MB para permitir recibir fotos de mascotas comprimidas en Base64
app.use(cors());
app.use(express.json({ limit: '5mb' }));

conectarDB();

// Endpoints principales de la API RESTful
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/catalog', catalogRoutes);

app.get('/', (_req, res) => {
  res.json({
    mensaje: 'API de Planeta Huella funcionando correctamente',
    status: 'online',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
