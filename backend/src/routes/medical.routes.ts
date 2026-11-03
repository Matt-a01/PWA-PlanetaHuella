import express, { type Request, type Response, type NextFunction } from 'express';
import MedicalRecord from '../models/MedicalRecord.js';
import Pet from '../models/Pet.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createMedicalRecordSchema,
  objectIdSchema,
} from '../schemas/validation.schemas.js';

const router = express.Router();

// Todas las rutas de historial médico requieren sesión JWT válida
router.use(requireAuth);

// GET /api/medical/:petId - Consulta el historial médico verificando propiedad de la mascota
router.get('/:petId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const petId = objectIdSchema.parse(req.params.petId);
    const mascota = await Pet.findById(petId).select('_id ownerId');

    if (!mascota) {
      res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
      return;
    }

    if (String(mascota.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para consultar el historial médico de esta mascota.',
      });
      return;
    }

    const records = await MedicalRecord.find({ petId: mascota._id }).sort({ date: -1 });
    res.json({ ok: true, records });
  } catch (error) {
    next(error);
  }
});

// POST /api/medical - Registra una vacuna, desparasitación o cita verificando propiedad de la mascota
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, date, notes, petId } = createMedicalRecordSchema.parse(req.body);

    const mascota = await Pet.findById(petId).select('_id ownerId');
    if (!mascota) {
      res.status(404).json({ ok: false, error: 'Mascota asociada no encontrada.' });
      return;
    }

    if (String(mascota.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para agregar registros médicos a esta mascota.',
      });
      return;
    }

    const nuevoRegistro = await MedicalRecord.create({
      type,
      date: new Date(date),
      notes,
      petId: mascota._id,
    });

    res.status(201).json({ ok: true, record: nuevoRegistro });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/medical/:id - Elimina un registro médico verificando propiedad de la mascota asociada
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const recordId = objectIdSchema.parse(req.params.id);
    const registro = await MedicalRecord.findById(recordId);

    if (!registro) {
      res.status(404).json({ ok: false, error: 'Registro médico no encontrado.' });
      return;
    }

    const mascota = await Pet.findById(registro.petId).select('_id ownerId');
    if (!mascota) {
      res.status(404).json({ ok: false, error: 'Mascota asociada no encontrada.' });
      return;
    }

    if (String(mascota.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para eliminar este registro médico.',
      });
      return;
    }

    await registro.deleteOne();
    res.json({ ok: true, message: 'Registro médico eliminado.' });
  } catch (error) {
    next(error);
  }
});

export default router;
