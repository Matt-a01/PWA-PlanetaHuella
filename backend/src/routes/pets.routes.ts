import express from 'express';
import Pet from '../models/Pet.js';
import Task from '../models/Task.js';
import MedicalRecord from '../models/MedicalRecord.js';

const router = express.Router();

// GET /api/pets?ownerId=... - Obtiene únicamente las mascotas registradas por el usuario activo
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) {
      res.json({ ok: true, pets: [] });
      return;
    }

    const pets = await Pet.find({ ownerId: String(ownerId) }).sort({ createdAt: -1 });
    res.json({ ok: true, pets });
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener las mascotas.' });
  }
});

// GET /api/pets/:id - Obtiene el perfil de una mascota junto con su historial médico
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

// POST /api/pets - Registra una mascota con su foto asociada al usuario y genera sus tareas diarias
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
      ownerId,
    });

    // Protocolo diario inicial de cuidado asignado automáticamente a la mascota
    await Task.insertMany([
      { title: 'Dar comida', iconType: 'bone', isCompleted: false, petId: nuevaMascota._id },
      { title: 'Cambiar agua', iconType: 'droplet', isCompleted: false, petId: nuevaMascota._id },
      { title: 'Pasear', iconType: 'footprints', isCompleted: false, petId: nuevaMascota._id },
      { title: 'Cepillar', iconType: 'scissors', isCompleted: false, petId: nuevaMascota._id },
    ]);

    res.status(201).json({
      ok: true,
      message: 'Mascota e imagen guardadas en la base de datos',
      pet: nuevaMascota,
    });
  } catch (error) {
    console.error('Error al guardar mascota:', error);
    res.status(500).json({ ok: false, error: 'Error al guardar la mascota.' });
  }
});

// PUT /api/pets/:id - Actualiza los datos y reemplaza la foto previa en MongoDB para evitar acumular imágenes
router.put('/:id', async (req, res) => {
  try {
    const { name, species, breed, age, gender, imageUrl, ownerId } = req.body;

    const mascotaExistente = await Pet.findById(req.params.id);
    if (!mascotaExistente) {
      res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
      return;
    }

    if (ownerId && String(mascotaExistente.ownerId) !== String(ownerId)) {
      res.status(403).json({ ok: false, error: 'No tienes permiso para modificar esta mascota.' });
      return;
    }

    mascotaExistente.name = name ?? mascotaExistente.name;
    mascotaExistente.species = species ?? mascotaExistente.species;
    mascotaExistente.breed = breed ?? mascotaExistente.breed;
    mascotaExistente.age = age !== undefined ? Number(age) : mascotaExistente.age;
    mascotaExistente.gender = gender ?? mascotaExistente.gender;

    if (imageUrl !== undefined) {
      mascotaExistente.imageUrl = imageUrl;
    }

    await mascotaExistente.save();

    res.json({
      ok: true,
      message: 'Mascota actualizada correctamente',
      pet: mascotaExistente,
    });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ ok: false, error: 'Error al actualizar la mascota.' });
  }
});

// DELETE /api/pets/:id - Elimina la mascota junto con su imagen, tareas y registros médicos asociados
router.delete('/:id', async (req, res) => {
  try {
    const eliminada = await Pet.findByIdAndDelete(req.params.id);
    if (!eliminada) {
      res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
      return;
    }

    await Task.deleteMany({ petId: eliminada._id });
    await MedicalRecord.deleteMany({ petId: eliminada._id });

    res.json({ ok: true, message: 'Mascota e imagen eliminadas correctamente.' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({ ok: false, error: 'Error al eliminar la mascota.' });
  }
});

export default router;
