import express from 'express';
import Task from '../models/Task.js';
import Pet from '../models/Pet.js';

const router = express.Router();

// GET /api/tasks?ownerId=... - Obtiene las tareas vinculadas a las mascotas del usuario
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    let filtro = {};

    if (ownerId) {
      const mascotasUsuario = await Pet.find({ ownerId: String(ownerId) }).select('_id');
      const idsMascotas = mascotasUsuario.map((m) => m._id);
      filtro = { petId: { $in: idsMascotas } };
    }

    const tasks = await Task.find(filtro).populate('petId', 'name species');
    res.json({ ok: true, tasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener las tareas.' });
  }
});

// POST /api/tasks - Registra una nueva tarea diaria para una mascota
router.post('/', async (req, res) => {
  try {
    const { title, iconType, petId } = req.body;

    if (!title || !petId) {
      res.status(400).json({ ok: false, error: 'El título y la mascota son obligatorios.' });
      return;
    }

    const nuevaTarea = await Task.create({
      title,
      iconType: iconType || 'bone',
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

// DELETE /api/tasks/:id - Elimina una tarea específica
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
