import express, { type Request, type Response, type NextFunction } from 'express';
import Task from '../models/Task.js';
import Pet from '../models/Pet.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { createTaskSchema, objectIdSchema } from '../schemas/validation.schemas.js';

const router = express.Router();

const PATRON_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export const obtenerFechaLocalISO = (fecha = new Date()): string => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

export const obtenerFechaReferencia = (queryDate?: unknown, bodyDate?: unknown): string => {
  if (typeof queryDate === 'string' && PATRON_FECHA_ISO.test(queryDate.trim())) {
    return queryDate.trim();
  }
  if (typeof bodyDate === 'string' && PATRON_FECHA_ISO.test(bodyDate.trim())) {
    return bodyDate.trim();
  }
  return obtenerFechaLocalISO();
};

export const formatearTareaParaFecha = (tareaDoc: unknown, todayStr: string) => {
  const raw =
    tareaDoc &&
    typeof tareaDoc === 'object' &&
    'toObject' in tareaDoc &&
    typeof (tareaDoc as { toObject: () => Record<string, unknown> }).toObject === 'function'
      ? (tareaDoc as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(tareaDoc as Record<string, unknown>) };

  const lastCompletedDate =
    typeof raw.lastCompletedDate === 'string' ? raw.lastCompletedDate : null;

  return {
    ...raw,
    lastCompletedDate,
    isCompleted: lastCompletedDate === todayStr,
  };
};

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

// GET /api/tasks - Obtiene las tareas del usuario calculando isCompleted según la fecha del día (?date=YYYY-MM-DD)
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todayStr = obtenerFechaReferencia(req.query.date);
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

      const tasksDocs = await Task.find({ petId: mascota._id }).populate('petId', 'name species');
      const tasks = tasksDocs.map((t) => formatearTareaParaFecha(t, todayStr));
      res.json({ ok: true, tasks });
      return;
    }

    const mascotasUsuario = await Pet.find({ ownerId: req.user!.id }).select('_id');
    const idsMascotas = mascotasUsuario.map((m) => m._id);

    const tasksDocs = await Task.find({ petId: { $in: idsMascotas } }).populate(
      'petId',
      'name species'
    );
    const tasks = tasksDocs.map((t) => formatearTareaParaFecha(t, todayStr));
    res.json({ ok: true, tasks });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Registra una tarea personalizada verificando que la mascota pertenezca al usuario
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todayStr = obtenerFechaReferencia(req.query.date);
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
      lastCompletedDate: null,
      petId: mascota._id,
    });

    const tareaConMascota = await nuevaTarea.populate('petId', 'name species');
    res.status(201).json({ ok: true, task: formatearTareaParaFecha(tareaConMascota, todayStr) });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id - Alterna el estado completado del día usando lastCompletedDate para reinicio automático diario
router.patch('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todayStr = obtenerFechaReferencia(
      req.query.date,
      (req.body as { date?: unknown } | undefined)?.date
    );
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

    if (tarea.lastCompletedDate === todayStr) {
      tarea.lastCompletedDate = null;
      tarea.isCompleted = false;
    } else {
      tarea.lastCompletedDate = todayStr;
      tarea.isCompleted = true;
    }
    await tarea.save();

    const tareaActualizada = await tarea.populate('petId', 'name species');
    res.json({ ok: true, task: formatearTareaParaFecha(tareaActualizada, todayStr) });
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
