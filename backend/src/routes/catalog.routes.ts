import express, { type Request, type Response, type NextFunction } from 'express';
import { Breed, Tip } from '../models/Catalog.js';
import { sembrarCatalogoInicial } from '../seeds/catalog.seed.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  createBreedSchema,
  updateBreedSchema,
  createTipSchema,
  updateTipSchema,
  objectIdSchema,
} from '../schemas/validation.schemas.js';

const router = express.Router();

// Normaliza cualquier documento de raza en MongoDB para garantizar compatibilidad en todos los roles
const normalizarRaza = (doc: any) => {
  const especieTexto = String(doc.category || doc.species || '').toLowerCase();
  let category: 'Perros' | 'Gatos' | 'Otros' = 'Perros';
  if (doc.category === 'Perros' || doc.category === 'Gatos' || doc.category === 'Otros') {
    category = doc.category;
  } else if (especieTexto.includes('gato')) {
    category = 'Gatos';
  } else if (!especieTexto.includes('perro')) {
    category = 'Otros';
  }

  return {
    _id: doc._id,
    name: doc.name || 'Mascota',
    category,
    desc: doc.desc || doc.description || 'Compañero leal y cariñoso',
    img: doc.img ?? doc.imageUrl ?? '',
    bg: doc.bg || 'bg-green-50',
    suggestedTasks:
      Array.isArray(doc.suggestedTasks) && doc.suggestedTasks.length > 0
        ? doc.suggestedTasks
        : ['Dar alimento adecuado', 'Agua fresca', 'Cuidado diario'],
  };
};

// Normaliza cualquier documento de recomendación en MongoDB
const normalizarTip = (doc: any) => ({
  _id: doc._id,
  title: doc.title || 'Consejo de bienestar',
  desc: doc.desc || doc.summary || 'Recomendación para el cuidado diario',
  detail: doc.detail || doc.content || doc.desc || '',
  species: doc.species || 'Todos',
  iconType: doc.iconType || 'footprints',
});

// GET /api/catalog/razas - Público: obtiene todas las razas y animales desde MongoDB
router.get('/razas', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let items = await Breed.find().sort({ createdAt: 1 });
    if (items.length === 0) {
      await sembrarCatalogoInicial();
      items = await Breed.find().sort({ createdAt: 1 });
    }
    res.json({ ok: true, items: items.map(normalizarRaza) });
  } catch (error) {
    next(error);
  }
});

// POST /api/catalog/razas - Solo Administrador: agrega una nueva raza o animal validado con Zod
router.post(
  '/razas',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, category, desc, img, bg, suggestedTasks } = createBreedSchema.parse(req.body);

      const nuevaRaza = await Breed.create({
        name,
        category,
        desc,
        img,
        bg: bg || 'bg-green-50',
        suggestedTasks:
          Array.isArray(suggestedTasks) && suggestedTasks.length > 0
            ? suggestedTasks
            : ['Dar alimento adecuado', 'Renovar agua fresca', 'Revisión y cuidado diario'],
      });

      res.status(201).json({ ok: true, item: normalizarRaza(nuevaRaza) });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/catalog/razas/:id - Solo Administrador: edita una raza existente en MongoDB
router.put(
  '/razas/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const breedId = objectIdSchema.parse(req.params.id);
      const datos = updateBreedSchema.parse(req.body);

      const raza = await Breed.findById(breedId);
      if (!raza) {
        res.status(404).json({ ok: false, error: 'Raza no encontrada.' });
        return;
      }

      if (datos.name !== undefined) raza.name = datos.name;
      if (datos.category !== undefined) raza.category = datos.category;
      if (datos.desc !== undefined) raza.desc = datos.desc;
      if (datos.img !== undefined) raza.img = datos.img;
      if (datos.bg !== undefined) raza.bg = datos.bg;
      if (datos.suggestedTasks !== undefined) raza.suggestedTasks = datos.suggestedTasks;

      await raza.save();
      res.json({ ok: true, item: normalizarRaza(raza) });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/catalog/razas/:id - Solo Administrador: elimina una raza del catálogo
router.delete(
  '/razas/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const breedId = objectIdSchema.parse(req.params.id);
      const eliminada = await Breed.findByIdAndDelete(breedId);
      if (!eliminada) {
        res.status(404).json({ ok: false, error: 'Raza no encontrada.' });
        return;
      }
      res.json({ ok: true, message: 'Elemento eliminado del catálogo.' });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/catalog/recomendaciones - Público: obtiene los tips desde MongoDB
router.get(
  '/recomendaciones',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let tips = await Tip.find().sort({ createdAt: 1 });
      if (tips.length === 0) {
        await sembrarCatalogoInicial();
        tips = await Tip.find().sort({ createdAt: 1 });
      }
      res.json({ ok: true, recomendaciones: tips.map(normalizarTip) });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/catalog/recomendaciones - Solo Administrador: agrega nuevos tips validados con Zod
router.post(
  '/recomendaciones',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, desc, detail, species, iconType } = createTipSchema.parse(req.body);

      const nuevoTip = await Tip.create({
        title,
        desc,
        detail: detail && detail.length > 0 ? detail : desc,
        species,
        iconType,
      });

      res.status(201).json({ ok: true, tip: normalizarTip(nuevoTip) });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/catalog/recomendaciones/:id - Solo Administrador: edita un tip existente en MongoDB
router.put(
  '/recomendaciones/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tipId = objectIdSchema.parse(req.params.id);
      const datos = updateTipSchema.parse(req.body);

      const tip = await Tip.findById(tipId);
      if (!tip) {
        res.status(404).json({ ok: false, error: 'Recomendación no encontrada.' });
        return;
      }

      if (datos.title !== undefined) tip.title = datos.title;
      if (datos.desc !== undefined) tip.desc = datos.desc;
      if (datos.detail !== undefined) tip.detail = datos.detail;
      if (datos.species !== undefined) tip.species = datos.species;
      if (datos.iconType !== undefined) tip.iconType = datos.iconType;

      await tip.save();
      res.json({ ok: true, tip: normalizarTip(tip) });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/catalog/recomendaciones/:id - Solo Administrador: elimina un tip
router.delete(
  '/recomendaciones/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tipId = objectIdSchema.parse(req.params.id);
      const eliminado = await Tip.findByIdAndDelete(tipId);
      if (!eliminado) {
        res.status(404).json({ ok: false, error: 'Recomendación no encontrada.' });
        return;
      }
      res.json({ ok: true, message: 'Recomendación eliminada.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
