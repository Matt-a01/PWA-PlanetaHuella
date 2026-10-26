import express from 'express';
import Pet from '../models/Pet.js';
import Task from '../models/Task.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { Breed } from '../models/Catalog.js';

const router = express.Router();

// Determina el ícono adecuado según el texto de la actividad
const elegirIconoTarea = (titulo: string): string => {
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

// Tareas predeterminadas de respaldo según la especie si no se especificaron tareas personalizadas
const tareasPorEspecie = (species: string): string[] => {
  if (species === 'Gato') {
    return ['Servir alimento para gato', 'Renovar agua fresca', 'Limpiar caja de arena', 'Cepillar pelaje'];
  }
  if (species === 'Conejo') {
    return ['Rellenar heno fresco', 'Renovar agua del bebedero', 'Limpiar espacio y revisar dientes'];
  }
  if (species === 'Ave') {
    return ['Cambiar semillas y fruta', 'Lavar bebedero de agua', 'Limpiar bandeja de la jaula'];
  }
  return ['Dar alimento balanceado', 'Renovar agua fresca', 'Paseo diario de 30 min', 'Cepillar pelaje'];
};

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

// GET /api/pets/:id - Obtiene el perfil de una mascota junto con sus tareas e historial médico
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
      return;
    }

    const [records, tasks] = await Promise.all([
      MedicalRecord.find({ petId: pet._id }).sort({ date: -1 }),
      Task.find({ petId: pet._id }).populate('petId', 'name species'),
    ]);

    res.json({ ok: true, pet, records, tasks });
  } catch (error) {
    console.error('Error al obtener detalle de mascota:', error);
    res.status(500).json({ ok: false, error: 'Error al cargar la mascota.' });
  }
});

// POST /api/pets - Registra una mascota y asigna sus tareas personalizadas según especie, raza y selección del usuario
router.post('/', async (req, res) => {
  try {
    const { name, species, breed, age, gender, characteristics, imageUrl, ownerId, customTasks } = req.body;

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
      characteristics: characteristics || '',
      imageUrl: imageUrl || '',
      ownerId,
    });

    // Usa las tareas elegidas por el usuario, o bien consulta las tareas sugeridas de su raza en MongoDB
    let listaTitulos: string[] = [];
    if (Array.isArray(customTasks) && customTasks.length > 0) {
      listaTitulos = customTasks.filter((t: string) => t && t.trim().length > 0);
    } else {
      const razaEnCatalogo = await Breed.findOne({ name: breed });
      if (razaEnCatalogo && razaEnCatalogo.suggestedTasks.length > 0) {
        listaTitulos = razaEnCatalogo.suggestedTasks;
      } else {
        listaTitulos = tareasPorEspecie(species);
      }
    }

    if (listaTitulos.length > 0) {
      const documentosTareas = listaTitulos.map((titulo) => ({
        title: titulo.trim(),
        iconType: elegirIconoTarea(titulo),
        isCompleted: false,
        petId: nuevaMascota._id,
      }));
      await Task.insertMany(documentosTareas);
    }

    res.status(201).json({
      ok: true,
      message: 'Mascota y tareas personalizadas guardadas en la base de datos',
      pet: nuevaMascota,
    });
  } catch (error) {
    console.error('Error al guardar mascota:', error);
    res.status(500).json({ ok: false, error: 'Error al guardar la mascota.' });
  }
});

// PUT /api/pets/:id - Actualiza los datos de la mascota y reemplaza su foto previa en MongoDB
router.put('/:id', async (req, res) => {
  try {
    const { name, species, breed, age, gender, characteristics, imageUrl, ownerId } = req.body;

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
    mascotaExistente.characteristics = characteristics ?? mascotaExistente.characteristics;

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

// DELETE /api/pets/:id - Elimina la mascota junto con su imagen, tareas y registros médicos
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
