// backend/src/index.ts
import express from 'express';
import conectarDB from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir que el servidor entienda formato JSON
app.use(express.json());

// Iniciar la conexión a la base de datos
conectarDB();

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Planeta Huella funcionando correctamente');
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});