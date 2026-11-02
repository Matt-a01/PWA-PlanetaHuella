import express, { type Request, type Response, type NextFunction } from 'express';
import Task from '../models/Task.js';
import Pet from '../models/Pet.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { createTaskSchema, objectIdSchema } from '../schemas/validation.schemas.js';

const router = express.Router();

// Todas las rutas de tareas requieren sesión JWT válida
router.use(requireAuth);

const detectarIcono = (titulo: string, iconoManual?: string): string => {
  if (iconoManual && iconoManual.length > 0) return iconoManual;
  const t = titulo.toLowerCase();
  if (t.includes('agua') || t.includes('bebedero') || t.includes('humedad') || t.includes('filtro')) {
    return 'droplet';
  }
  if (t.includes('paseo') || t.includes('caminata') || t.includes('ejercicio') || t.includes('juego') || t.includes('jugar')) {
    return 'footprints';
  }
  if (t.includes('cepillar') || t.includes('pelaje') || t.includes('limpiar') || t.includes('arenero') || t.includes('jaula') || t.includes('dientes')) {
    return 'scissors';
  }
  return 'bone';
};

// GET /api/tasks - Obtiene únicamente las tareas vinculadas a las mascotas del usuario autenticado
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const petIdQuery = typeof req.query.petId === 'string' ? req.query.petId.trim() : '';

    if (petIdQuery) {
      const petIdValido = objectIdSchema.parse(petIdQuery);
      const mascota = await Pet.findById(petIdValido).select('_id ownerId');
      if (!mascota) {
        res.status(404).json({ ok: false, error: 'Mascota asociada no encontrada.' });
        return;
      }
      if (String(mascota.ownerId) !== req.user!.id) {
        res.status(403).json({
          ok: false,
          error: 'No tienes permiso para consultar las tareas de esta mascota.',
        });
        return;
      }

      const tasks = await Task.find({ petId: mascota._id }).populate('petId', 'name species');
      res.json({ ok: true, tasks });
      return;
    }

    const mascotasUsuario = await Pet.find({ ownerId: req.user!.id }).select('_id');
    const idsMascotas = mascotasUsuario.map((m) => m._id);

    const tasks = await Task.find({ petId: { $in: idsMascotas } }).populate(
      'petId',
      'name species'
    );
    res.json({ ok: true, tasks });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Registra una tarea personalizada verificando que la mascota pertenezca al usuario
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, iconType, petId } = createTaskSchema.parse(req.body);

    const mascota = await Pet.findById(petId).select('_id ownerId');
    if (!mascota) {
      res.status(404).json({ ok: false, error: 'Mascota asociada no encontrada.' });
      return;
    }

    if (String(mascota.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para agregar tareas a esta mascota.',
      });
      return;
    }

    const nuevaTarea = await Task.create({
      title,
      iconType: detectarIcono(title, iconType),
      isCompleted: false,
      petId: mascota._id,
    });

    const tareaConMascota = await nuevaTarea.populate('petId', 'name species');
    res.status(201).json({ ok: true, task: tareaConMascota });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id - Alterna el estado completado/pendiente verificando propiedad de la mascota
router.patch('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = objectIdSchema.parse(req.params.id);
    const tarea = await Task.findById(taskId);

    if (!tarea) {
      res.status(404).json({ ok: false, error: 'Tarea no encontrada.' });
      return;
    }

    const mascota = await Pet.findById(tarea.petId).select('_id ownerId');
    if (!mascota) {
      res.status(404).json({ ok: false, error: 'Mascota asociada no encontrada.' });
      return;
    }

    if (String(mascota.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para modificar esta tarea.',
      });
      return;
    }

    tarea.isCompleted = !tarea.isCompleted;
    await tarea.save();

    const tareaActualizada = await tarea.populate('petId', 'name species');
    res.json({ ok: true, task: tareaActualizada });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Elimina una tarea verificando propiedad de la mascota asociada
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = objectIdSchema.parse(req.params.id);
    const tarea = await Task.findById(taskId);

    if (!tarea) {
      res.status(404).json({ ok: false, error: 'Tarea no encontrada.' });
      return;
    }

    const mascota = await Pet.findById(tarea.petId).select('_id ownerId');
    if (!mascota) {
      res.status(404).json({ ok: false, error: 'Mascota asociada no encontrada.' });
      return;
    }

    if (String(mascota.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para eliminar esta tarea.',
      });
      return;
    }

    await tarea.deleteOne();
    res.json({ ok: true, message: 'Tarea eliminada.' });
  } catch (error) {
    next(error);
  }
});

export default router;
