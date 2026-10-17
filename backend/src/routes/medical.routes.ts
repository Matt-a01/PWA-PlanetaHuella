// backend/src/routes/medical.routes.ts
import express from 'express';
import MedicalRecord from '../models/MedicalRecord.js';

const router = express.Router();

// GET /api/medical/:petId - Obtener los registros médicos de una mascota
router.get('/:petId', async (req, res) => {
    try {
        const records = await MedicalRecord.find({ petId: req.params.petId }).sort({ date: -1 });
        res.json({ ok: true, records });
    } catch (error) {
        console.error('Error al obtener historial médico:', error);
        res.status(500).json({ ok: false, error: 'Error al obtener el historial médico.' });
    }
});

// POST /api/medical - Agregar vacuna, desparasitación o cita veterinaria
router.post('/', async (req, res) => {
    try {
        const { type, date, notes, petId } = req.body;

        if (!type || !date || !petId) {
            res.status(400).json({ ok: false, error: 'Tipo, fecha y mascota son obligatorios.' });
            return;
        }

        const nuevoRegistro = await MedicalRecord.create({
            type,
            date: new Date(date),
            notes: notes || '',
            petId
        });

        res.status(201).json({ ok: true, record: nuevoRegistro });
    } catch (error) {
        console.error('Error al guardar registro médico:', error);
        res.status(500).json({ ok: false, error: 'Error al guardar el registro médico.' });
    }
});

// DELETE /api/medical/:id - Eliminar un registro médico
router.delete('/:id', async (req, res) => {
    try {
        await MedicalRecord.findByIdAndDelete(req.params.id);
        res.json({ ok: true, message: 'Registro médico eliminado.' });
    } catch (error) {
        console.error('Error al eliminar registro médico:', error);
        res.status(500).json({ ok: false, error: 'Error al eliminar el registro médico.' });
    }
});

export default router;
