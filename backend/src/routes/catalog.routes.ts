import express, { type Request, type Response, type NextFunction } from 'express';
import { Breed, Tip } from '../models/Catalog.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  createBreedSchema,
  updateBreedSchema,
  createTipSchema,
  updateTipSchema,
  objectIdSchema,
} from '../schemas/validation.schemas.js';

const router = express.Router();

// Datos semilla iniciales que se guardan en MongoDB automáticamente si la colección está vacía
const razasSemilla = [
  {
    name: 'Labrador',
    category: 'Perros',
    desc: 'Amigable y activo',
    img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Paseo activo de 45 min', 'Juego de cobro con pelota'],
  },
  {
    name: 'Golden Retriever',
    category: 'Perros',
    desc: 'Cariñoso y leal',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Paseo diario de 40 min', 'Cepillar pelaje largo'],
  },
  {
    name: 'Bulldog',
    category: 'Perros',
    desc: 'Tranquilo y noble',
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Porción medida de comida', 'Agua fresca', 'Caminata suave de 20 min', 'Limpiar pliegues faciales'],
  },
  {
    name: 'Beagle',
    category: 'Perros',
    desc: 'Curioso y enérgico',
    img: 'https://images.unsplash.com/photo-1537151608804-ea6f23b207eb?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Paseo de exploración y olfato', 'Revisar orejas caídas'],
  },
  {
    name: 'Poodle',
    category: 'Perros',
    desc: 'Inteligente y dócil',
    img: 'https://images.unsplash.com/photo-1616149562385-1d84e79478bb?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Desenredar pelaje rizado', 'Juego de estimulación mental'],
  },
  {
    name: 'Pastor Alemán',
    category: 'Perros',
    desc: 'Valiente y protector',
    img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Ración alta en proteína', 'Agua fresca', 'Ejercicio físico intenso', 'Cepillado de subpelo'],
  },
  {
    name: 'Chihuahua',
    category: 'Perros',
    desc: 'Pequeño, alerta y leal',
    img: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Porción pequeña de alimento', 'Agua fresca', 'Paseo corto de 15 min', 'Cuidar del frío'],
  },
  {
    name: 'Husky Siberiano',
    category: 'Perros',
    desc: 'Atlético, expresivo y sociable',
    img: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alimento rico en energía', 'Agua abundante y fresca', 'Carrera o caminata larga', 'Cepillado profundo de doble capa'],
  },
  {
    name: 'Pug',
    category: 'Perros',
    desc: 'Simpático, afectuoso y juguetón',
    img: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Controlar porción de comida', 'Agua fresca', 'Paseo en horario fresco', 'Limpiar arrugas faciales'],
  },
  {
    name: 'Schnauzer',
    category: 'Perros',
    desc: 'Obediente, activo y guardián',
    img: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Limpiar barba después de comer', 'Paseo diario de 30 min'],
  },
  {
    name: 'Europeo',
    category: 'Gatos',
    desc: 'Cariñoso y adaptable',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Servir alimento para gato', 'Renovar agua fresca', 'Limpiar caja de arena', 'Jugar con caña o rascador'],
  },
  {
    name: 'Siamés',
    category: 'Gatos',
    desc: 'Sociable y curioso',
    img: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Servir alimento húmedo/seco', 'Renovar agua fresca', 'Limpiar arenero', 'Sesión de juego interactivo'],
  },
  {
    name: 'Persa',
    category: 'Gatos',
    desc: 'Tranquilo y elegante',
    img: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Servir alimento para pelo largo', 'Renovar agua fresca', 'Cepillado diario de pelaje largo', 'Limpiar contorno de ojos'],
  },
  {
    name: 'Maine Coon',
    category: 'Gatos',
    desc: 'Grande, gentil y juguetón',
    img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Ración adecuada a su tamaño', 'Fuente de agua fresca', 'Cepillar melena y cola', 'Juego de trepar en rascador'],
  },
  {
    name: 'Bengalí',
    category: 'Gatos',
    desc: 'Ágil, curioso y muy activo',
    img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alimento rico en proteína', 'Agua en movimiento o fresca', 'Juegos de caza y agilidad', 'Limpiar arenero'],
  },
  {
    name: 'Azul Ruso',
    category: 'Gatos',
    desc: 'Sereno, limpio y afectuoso',
    img: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Servir alimento balanceado', 'Renovar agua fresca', 'Limpiar caja de arena', 'Cepillado suave semanal'],
  },
  {
    name: 'Aves',
    category: 'Otros',
    desc: 'Canarios, loros, periquitos...',
    bg: 'bg-green-50',
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Cambiar semillas y fruta', 'Lavar bebedero de agua', 'Limpiar bandeja de la jaula'],
  },
  {
    name: 'Conejos',
    category: 'Otros',
    desc: 'Tiernos y juguetones',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Rellenar heno fresco', 'Dar hojas verdes lavadas', 'Agua limpia en bebedero', 'Cepillar y revisar dientes'],
  },
  {
    name: 'Hámsters',
    category: 'Otros',
    desc: 'Pequeños grandes amigos',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Servir mezcla de semillas', 'Revisar bebedero de gota', 'Limpiar rincón húmedo del sustrato'],
  },
  {
    name: 'Peces',
    category: 'Otros',
    desc: 'Acuáticos y cuidados',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alimentar en pequeñas dosis', 'Verificar filtro y temperatura', 'Retirar restos de comida'],
  },
  {
    name: 'Reptiles',
    category: 'Otros',
    desc: 'Iguanas, geckos, serpientes...',
    bg: 'bg-emerald-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Revisar lámpara térmica UVB', 'Rociar humedad en terrario', 'Ofrecer alimento según especie'],
  },
  {
    name: 'Hurones',
    category: 'Otros',
    desc: 'Curiosos y activos',
    bg: 'bg-rose-50',
    img: 'https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Dar comida alta en proteína', 'Agua fresca', 'Tiempo de juego fuera de jaula', 'Limpiar esquinero'],
  },
  {
    name: 'Tortugas',
    category: 'Otros',
    desc: 'Tranquilas, longevas y dóciles',
    bg: 'bg-lime-50',
    img: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Ofrecer vegetales y calcio', 'Lavar zona de agua', 'Exposición a luz solar o UVB'],
  },
  {
    name: 'Cuyos / Cobayas',
    category: 'Otros',
    desc: 'Sociables, tiernos y comunicativos',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno disponible todo el día', 'Verdura rica en vitamina C', 'Agua fresca en bebedero'],
  },
];

const tipsSemilla = [
  {
    title: 'Rutina de ejercicio',
    desc: 'Ideal para su raza y nivel de energía',
    detail: 'Dedica entre 30 y 45 minutos diarios a paseos o juegos activos según la edad y raza de tu mascota.',
    species: 'Todos',
    iconType: 'footprints',
  },
  {
    title: 'Cuidado del pelaje',
    desc: 'Mantén su pelaje sano y libre de nudos',
    detail: 'Cepilla de 2 a 3 veces por semana en razas de pelo corto y diariamente en razas de pelo largo.',
    species: 'Todos',
    iconType: 'sparkles',
  },
  {
    title: 'Salud dental e higiene',
    desc: 'Previene acumulación de sarro e infecciones',
    detail: 'Revisa encías, dientes y orejas cada semana para detectar molestias a tiempo.',
    species: 'Todos',
    iconType: 'heart',
  },
  {
    title: 'Hidratación constante',
    desc: 'Agua limpia y fresca disponible todo el día',
    detail: 'Lava el plato o bebedero diariamente y cambia el agua al menos dos veces al día.',
    species: 'Todos',
    iconType: 'heart',
  },
  {
    title: 'Calendario de vacunación y desparasitación',
    desc: 'Protección preventiva anual y semestral',
    detail: 'Registra en el perfil médico cada vacuna y desparasitación interna o externa.',
    species: 'Todos',
    iconType: 'heart',
  },
  {
    title: 'Paseos seguros y socialización',
    desc: 'Estimulación olfativa y convivencia sana',
    detail: 'Permite que tu perro olfatee durante el paseo; evita el pavimento muy caliente al mediodía.',
    species: 'Perro',
    iconType: 'footprints',
  },
  {
    title: 'Enriquecimiento ambiental felino',
    desc: 'Rascadores, alturas y juego de caza',
    detail: 'Los gatos necesitan rascadores verticales y sesiones cortas de juego interactivo.',
    species: 'Gato',
    iconType: 'sparkles',
  },
  {
    title: 'Higiene del arenero',
    desc: 'Bienestar y prevención de estrés en gatos',
    detail: 'Retira los desechos diariamente y ubica la caja de arena lejos de su plato de comida.',
    species: 'Gato',
    iconType: 'sparkles',
  },
  {
    title: 'Desgaste dental natural con heno',
    desc: 'Indispensable para conejos y roedores',
    detail: 'El heno fresco debe representar el 80% de la dieta de los conejos para su digestión y dientes.',
    species: 'Conejo',
    iconType: 'heart',
  },
  {
    title: 'Cuidado de jaula e iluminación',
    desc: 'Ambiente limpio y ventilado para aves',
    detail: 'Ubica la jaula en un lugar iluminado sin corrientes directas de aire y limpia las perchas.',
    species: 'Ave',
    iconType: 'sparkles',
  },
];

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

// GET /api/catalog/razas - Público: obtiene todas las razas y animales desde MongoDB (inicializa si está vacío)
router.get('/razas', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let items = await Breed.find().sort({ createdAt: 1 });
    if (items.length === 0) {
      await Breed.insertMany(razasSemilla);
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

// GET /api/catalog/recomendaciones - Público: obtiene los tips desde MongoDB (inicializa si está vacío)
router.get(
  '/recomendaciones',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let tips = await Tip.find().sort({ createdAt: 1 });
      if (tips.length === 0) {
        await Tip.insertMany(tipsSemilla);
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
