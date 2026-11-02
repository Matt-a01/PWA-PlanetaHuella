import express, { type Request, type Response, type NextFunction } from 'express';
import Pet from '../models/Pet.js';
import Task from '../models/Task.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { Breed } from '../models/Catalog.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createPetSchema,
  updatePetSchema,
  objectIdSchema,
} from '../schemas/validation.schemas.js';

const router = express.Router();

// Todas las rutas de mascotas requieren sesión JWT válida
router.use(requireAuth);

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

// GET /api/pets - Obtiene únicamente las mascotas registradas por el usuario autenticado (ignora ownerId externo)
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pets = await Pet.find({ ownerId: req.user!.id }).sort({ createdAt: -1 });
    res.json({ ok: true, pets });
  } catch (error) {
    next(error);
  }
});

// GET /api/pets/:id - Obtiene el perfil de una mascota verificando propiedad contra IDOR
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const petId = objectIdSchema.parse(req.params.id);
    const pet = await Pet.findById(petId);

    if (!pet) {
      res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
      return;
    }

    if (String(pet.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para acceder a esta mascota.',
      });
      return;
    }

    const [records, tasks] = await Promise.all([
      MedicalRecord.find({ petId: pet._id }).sort({ date: -1 }),
      Task.find({ petId: pet._id }).populate('petId', 'name species'),
    ]);

    res.json({ ok: true, pet, records, tasks });
  } catch (error) {
    next(error);
  }
});

// POST /api/pets - Registra una mascota asociada estrictamente al usuario del token JWT
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      species,
      breed,
      age,
      gender,
      characteristics,
      imageUrl,
      customTasks,
    } = createPetSchema.parse(req.body);

    const nuevaMascota = await Pet.create({
      name,
      species,
      breed,
      age,
      gender,
      characteristics,
      imageUrl,
      ownerId: req.user!.id,
    });

    // Usa las tareas elegidas por el usuario, o bien consulta las tareas sugeridas de su raza en MongoDB
    let listaTitulos: string[] = [];
    if (Array.isArray(customTasks) && customTasks.length > 0) {
      listaTitulos = customTasks;
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
    next(error);
  }
});

// PUT /api/pets/:id - Actualiza los datos de la mascota validando pertenencia al usuario autenticado
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const petId = objectIdSchema.parse(req.params.id);
    const datos = updatePetSchema.parse(req.body);

    const mascotaExistente = await Pet.findById(petId);
    if (!mascotaExistente) {
      res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
      return;
    }

    if (String(mascotaExistente.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para modificar esta mascota.',
      });
      return;
    }

    if (datos.name !== undefined) mascotaExistente.name = datos.name;
    if (datos.species !== undefined) mascotaExistente.species = datos.species;
    if (datos.breed !== undefined) mascotaExistente.breed = datos.breed;
    if (datos.age !== undefined) mascotaExistente.age = datos.age;
    if (datos.gender !== undefined) mascotaExistente.gender = datos.gender;
    if (datos.characteristics !== undefined) {
      mascotaExistente.characteristics = datos.characteristics;
    }
    if (datos.imageUrl !== undefined) {
      mascotaExistente.imageUrl = datos.imageUrl;
    }

    await mascotaExistente.save();

    res.json({
      ok: true,
      message: 'Mascota actualizada correctamente',
      pet: mascotaExistente,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/pets/:id - Elimina la mascota junto con sus tareas e historial médico verificando propiedad
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const petId = objectIdSchema.parse(req.params.id);
    const mascota = await Pet.findById(petId);

    if (!mascota) {
      res.status(404).json({ ok: false, error: 'Mascota no encontrada.' });
      return;
    }

    if (String(mascota.ownerId) !== req.user!.id) {
      res.status(403).json({
        ok: false,
        error: 'No tienes permiso para eliminar esta mascota.',
      });
      return;
    }

    await mascota.deleteOne();
    await Task.deleteMany({ petId: mascota._id });
    await MedicalRecord.deleteMany({ petId: mascota._id });

    res.json({ ok: true, message: 'Mascota e imagen eliminadas correctamente.' });
  } catch (error) {
    next(error);
  }
});

export default router;
