import express from 'express';
import Task from '../models/Task.js';
import Pet from '../models/Pet.js';

const router = express.Router();

const detectarIcono = (titulo: string, iconoManual?: string): string => {
  if (iconoManual) return iconoManual;
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

// GET /api/tasks?ownerId=... - Obtiene las tareas vinculadas a las mascotas del usuario
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) {
      res.json({ ok: true, tasks: [] });
      return;
    }

    const mascotasUsuario = await Pet.find({ ownerId: String(ownerId) }).select('_id');
    const idsMascotas = mascotasUsuario.map((m) => m._id);

    const tasks = await Task.find({ petId: { $in: idsMascotas } }).populate('petId', 'name species');
    res.json({ ok: true, tasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener las tareas.' });
  }
});

// POST /api/tasks - Registra una tarea personalizada para una mascota específica
router.post('/', async (req, res) => {
  try {
    const { title, iconType, petId } = req.body;

    if (!title || !petId) {
      res.status(400).json({ ok: false, error: 'El título y la mascota son obligatorios.' });
      return;
    }

    const nuevaTarea = await Task.create({
      title: title.trim(),
      iconType: detectarIcono(title, iconType),
      isCompleted: false,
      petId,
    });

    const tareaConMascota = await nuevaTarea.populate('petId', 'name species');
    res.status(201).json({ ok: true, task: tareaConMascota });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ ok: false, error: 'Error al crear la tarea.' });
  }
});

// PATCH /api/tasks/:id - Alterna el estado completado/pendiente de una tarea
router.patch('/:id', async (req, res) => {
  try {
    const tarea = await Task.findById(req.params.id);
    if (!tarea) {
      res.status(404).json({ ok: false, error: 'Tarea no encontrada.' });
      return;
    }

    tarea.isCompleted = !tarea.isCompleted;
    await tarea.save();

    const tareaActualizada = await tarea.populate('petId', 'name species');
    res.json({ ok: true, task: tareaActualizada });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ ok: false, error: 'Error al actualizar la tarea.' });
  }
});

// DELETE /api/tasks/:id - Elimina una tarea del perfil de la mascota
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: 'Tarea eliminada.' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ ok: false, error: 'Error al eliminar la tarea.' });
  }
});

export default router;
