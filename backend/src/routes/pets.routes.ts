// backend/src/routes/pets.routes.ts
import express from 'express';
import Pet from '../models/Pet.js';
import Task from '../models/Task.js';
import MedicalRecord from '../models/MedicalRecord.js';

const router = express.Router();

// GET /api/pets?ownerId=... - Obtener las mascotas de un usuario
router.get('/', async (req, res) => {
    try {
        const { ownerId } = req.query;
        const filtro = ownerId ? { ownerId: String(ownerId) } : {};
        const pets = await Pet.find(filtro).sort({ createdAt: -1 });
        res.json({ ok: true, pets });
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        res.status(500).json({ ok: false, error: 'Error al obtener las mascotas.' });
    }
});

// GET /api/pets/:id - Obtener el detalle de una mascota y su historial médico
router.get('/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
            return;
        }

        const records = await MedicalRecord.find({ petId: pet._id }).sort({ date: -1 });
        res.json({ ok: true, pet, records });
    } catch (error) {
        console.error('Error al obtener detalle de mascota:', error);
        res.status(500).json({ ok: false, error: 'Error al cargar la mascota.' });
    }
});

// POST /api/pets - Registrar una nueva mascota y crear sus tareas del día
router.post('/', async (req, res) => {
    try {
        const { name, species, breed, age, gender, imageUrl, ownerId } = req.body;

        if (!name || !species || !breed || age === undefined || !gender || !ownerId) {
            res.status(400).json({ ok: false, error: 'Faltan datos obligatorios de la mascota.' });
            return;
        }

        const nuevaMascota = await Pet.create({
            name,
            species,
            breed,
            age: Number(age),
            gender,
            imageUrl: imageUrl || '',
            ownerId
        });

        // Crear protocolo diario básico de tareas para esta mascota
        await Task.insertMany([
            { title: 'Dar comida', iconType: 'bone', isCompleted: false, petId: nuevaMascota._id },
            { title: 'Cambiar agua', iconType: 'droplet', isCompleted: false, petId: nuevaMascota._id },
            { title: 'Pasear', iconType: 'footprints', isCompleted: false, petId: nuevaMascota._id },
            { title: 'Cepillar', iconType: 'scissors', isCompleted: false, petId: nuevaMascota._id }
        ]);

        res.status(201).json({
            ok: true,
            message: 'Mascota registrada con éxito',
            pet: nuevaMascota
        });
    } catch (error) {
        console.error('Error al guardar mascota:', error);
        res.status(500).json({ ok: false, error: 'Error al guardar la mascota.' });
    }
});

// PUT /api/pets/:id - Actualizar datos de una mascota
router.put('/:id', async (req, res) => {
    try {
        const mascotaActualizada = await Pet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!mascotaActualizada) {
            res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
            return;
        }

        res.json({ ok: true, pet: mascotaActualizada });
    } catch (error) {
        console.error('Error al actualizar mascota:', error);
        res.status(500).json({ ok: false, error: 'Error al actualizar la mascota.' });
    }
});

// DELETE /api/pets/:id - Eliminar mascota junto con sus tareas y registros médicos
router.delete('/:id', async (req, res) => {
    try {
        const eliminada = await Pet.findByIdAndDelete(req.params.id);
        if (!eliminada) {
            res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
            return;
        }

        await Task.deleteMany({ petId: eliminada._id });
        await MedicalRecord.deleteMany({ petId: eliminada._id });

        res.json({ ok: true, message: 'Mascota eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        res.status(500).json({ ok: false, error: 'Error al eliminar la mascota.' });
    }
});

export default router;
