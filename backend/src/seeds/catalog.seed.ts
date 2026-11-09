import { Breed, Tip } from '../models/Catalog.js';

export interface RazaSemilla {
  name: string;
  category: 'Perros' | 'Gatos' | 'Otros';
  desc: string;
  img: string;
  bg?: string;
  suggestedTasks: string[];
}

export interface TipSemilla {
  title: string;
  desc: string;
  detail: string;
  species: string;
  iconType: string;
}

export const razasSemilla: RazaSemilla[] = [
  {
    name: 'Labrador',
    category: 'Perros',
    desc: 'Amigable y activo',
    img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Dar alimento balanceado',
      'Agua fresca',
      'Paseo activo de 45 min',
      'Juego de cobro con pelota',
    ],
  },
  {
    name: 'Golden Retriever',
    category: 'Perros',
    desc: 'Cariñoso y leal',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Dar alimento balanceado',
      'Agua fresca',
      'Paseo diario de 40 min',
      'Cepillar pelaje largo',
    ],
  },
  {
    name: 'Bulldog',
    category: 'Perros',
    desc: 'Tranquilo y noble',
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Porción medida de comida',
      'Agua fresca',
      'Caminata suave de 20 min',
      'Limpiar pliegues faciales',
    ],
  },
  {
    name: 'Beagle',
    category: 'Perros',
    desc: 'Curioso y enérgico',
    img: 'https://images.unsplash.com/photo-1537151608804-ea6f23b207eb?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Dar alimento balanceado',
      'Agua fresca',
      'Paseo de exploración y olfato',
      'Revisar orejas caídas',
    ],
  },
  {
    name: 'Poodle',
    category: 'Perros',
    desc: 'Inteligente y dócil',
    img: 'https://images.unsplash.com/photo-1616149562385-1d84e79478bb?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Dar alimento balanceado',
      'Agua fresca',
      'Desenredar pelaje rizado',
      'Juego de estimulación mental',
    ],
  },
  {
    name: 'Pastor Alemán',
    category: 'Perros',
    desc: 'Valiente y protector',
    img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Ración alta en proteína',
      'Agua fresca',
      'Ejercicio físico intenso',
      'Cepillado de subpelo',
    ],
  },
  {
    name: 'Chihuahua',
    category: 'Perros',
    desc: 'Pequeño, alerta y leal',
    img: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Porción pequeña de alimento',
      'Agua fresca',
      'Paseo corto de 15 min',
      'Cuidar del frío',
    ],
  },
  {
    name: 'Husky Siberiano',
    category: 'Perros',
    desc: 'Atlético, expresivo y sociable',
    img: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Alimento rico en energía',
      'Agua abundante y fresca',
      'Carrera o caminata larga',
      'Cepillado profundo de doble capa',
    ],
  },
  {
    name: 'Pug',
    category: 'Perros',
    desc: 'Simpático, afectuoso y juguetón',
    img: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Controlar porción de comida',
      'Agua fresca',
      'Paseo en horario fresco',
      'Limpiar arrugas faciales',
    ],
  },
  {
    name: 'Schnauzer',
    category: 'Perros',
    desc: 'Obediente, activo y guardián',
    img: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Dar alimento balanceado',
      'Agua fresca',
      'Limpiar barba después de comer',
      'Paseo diario de 30 min',
    ],
  },
  {
    name: 'Europeo',
    category: 'Gatos',
    desc: 'Cariñoso y adaptable',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Servir alimento para gato',
      'Renovar agua fresca',
      'Limpiar caja de arena',
      'Jugar con caña o rascador',
    ],
  },
  {
    name: 'Siamés',
    category: 'Gatos',
    desc: 'Sociable y curioso',
    img: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Servir alimento húmedo/seco',
      'Renovar agua fresca',
      'Limpiar arenero',
      'Sesión de juego interactivo',
    ],
  },
  {
    name: 'Persa',
    category: 'Gatos',
    desc: 'Tranquilo y elegante',
    img: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Servir alimento para pelo largo',
      'Renovar agua fresca',
      'Cepillado diario de pelaje largo',
      'Limpiar contorno de ojos',
    ],
  },
  {
    name: 'Maine Coon',
    category: 'Gatos',
    desc: 'Grande, gentil y juguetón',
    img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Ración adecuada a su tamaño',
      'Fuente de agua fresca',
      'Cepillar melena y cola',
      'Juego de trepar en rascador',
    ],
  },
  {
    name: 'Bengalí',
    category: 'Gatos',
    desc: 'Ágil, curioso y muy activo',
    img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Alimento rico en proteína',
      'Agua en movimiento o fresca',
      'Juegos de caza y agilidad',
      'Limpiar arenero',
    ],
  },
  {
    name: 'Azul Ruso',
    category: 'Gatos',
    desc: 'Sereno, limpio y afectuoso',
    img: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Servir alimento balanceado',
      'Renovar agua fresca',
      'Limpiar caja de arena',
      'Cepillado suave semanal',
    ],
  },
  {
    name: 'Aves',
    category: 'Otros',
    desc: 'Canarios, loros, periquitos...',
    bg: 'bg-green-50',
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Cambiar semillas y fruta',
      'Lavar bebedero de agua',
      'Limpiar bandeja de la jaula',
    ],
  },
  {
    name: 'Conejos',
    category: 'Otros',
    desc: 'Tiernos y juguetones',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Rellenar heno fresco',
      'Dar hojas verdes lavadas',
      'Agua limpia en bebedero',
      'Cepillar y revisar dientes',
    ],
  },
  {
    name: 'Hámsters',
    category: 'Otros',
    desc: 'Pequeños grandes amigos',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Servir mezcla de semillas',
      'Revisar bebedero de gota',
      'Limpiar rincón húmedo del sustrato',
    ],
  },
  {
    name: 'Peces',
    category: 'Otros',
    desc: 'Acuáticos y cuidados',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Alimentar en pequeñas dosis',
      'Verificar filtro y temperatura',
      'Retirar restos de comida',
    ],
  },
  {
    name: 'Reptiles',
    category: 'Otros',
    desc: 'Iguanas, geckos, serpientes...',
    bg: 'bg-emerald-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Revisar lámpara térmica UVB',
      'Rociar humedad en terrario',
      'Ofrecer alimento según especie',
    ],
  },
  {
    name: 'Hurones',
    category: 'Otros',
    desc: 'Curiosos y activos',
    bg: 'bg-rose-50',
    img: 'https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Dar comida alta en proteína',
      'Agua fresca',
      'Tiempo de juego fuera de jaula',
      'Limpiar esquinero',
    ],
  },
  {
    name: 'Tortugas',
    category: 'Otros',
    desc: 'Tranquilas, longevas y dóciles',
    bg: 'bg-lime-50',
    img: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Ofrecer vegetales y calcio',
      'Lavar zona de agua',
      'Exposición a luz solar o UVB',
    ],
  },
  {
    name: 'Cuyos / Cobayas',
    category: 'Otros',
    desc: 'Sociables, tiernos y comunicativos',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: [
      'Heno disponible todo el día',
      'Verdura rica en vitamina C',
      'Agua fresca en bebedero',
    ],
  },
];

export const tipsSemilla: TipSemilla[] = [
  {
    title: 'Rutina de ejercicio',
    desc: 'Ideal para su raza y nivel de energía',
    detail:
      'Dedica entre 30 y 45 minutos diarios a paseos o juegos activos según la edad y raza de tu mascota.',
    species: 'Todos',
    iconType: 'footprints',
  },
  {
    title: 'Cuidado del pelaje',
    desc: 'Mantén su pelaje sano y libre de nudos',
    detail:
      'Cepilla de 2 a 3 veces por semana en razas de pelo corto y diariamente en razas de pelo largo.',
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
    detail:
      'Permite que tu perro olfatee durante el paseo; evita el pavimento muy caliente al mediodía.',
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
    detail:
      'Retira los desechos diariamente y ubica la caja de arena lejos de su plato de comida.',
    species: 'Gato',
    iconType: 'sparkles',
  },
  {
    title: 'Desgaste dental natural con heno',
    desc: 'Indispensable para conejos y roedores',
    detail:
      'El heno fresco debe representar el 80% de la dieta de los conejos para su digestión y dientes.',
    species: 'Conejo',
    iconType: 'heart',
  },
  {
    title: 'Cuidado de jaula e iluminación',
    desc: 'Ambiente limpio y ventilado para aves',
    detail:
      'Ubica la jaula en un lugar iluminado sin corrientes directas de aire y limpia las perchas.',
    species: 'Ave',
    iconType: 'sparkles',
  },
];

let promesaSemillaEnCurso: Promise<void> | null = null;

// Inicializa razas y recomendaciones de forma idempotente (bulkWrite + upsert) evitando race conditions
export const sembrarCatalogoInicial = async (): Promise<void> => {
  if (promesaSemillaEnCurso) {
    return promesaSemillaEnCurso;
  }

  promesaSemillaEnCurso = (async () => {
    try {
      const [totalRazas, totalTips] = await Promise.all([
        Breed.countDocuments(),
        Tip.countDocuments(),
      ]);

      if (totalRazas === 0) {
        await Breed.bulkWrite(
          razasSemilla.map((raza) => ({
            updateOne: {
              filter: { name: raza.name },
              update: {
                $setOnInsert: {
                  ...raza,
                  bg: raza.bg ?? 'bg-green-50',
                },
              },
              upsert: true,
            },
          })),
          { ordered: false }
        );
      }

      if (totalTips === 0) {
        await Tip.bulkWrite(
          tipsSemilla.map((tip) => ({
            updateOne: {
              filter: { title: tip.title },
              update: {
                $setOnInsert: tip,
              },
              upsert: true,
            },
          })),
          { ordered: false }
        );
      }
    } catch (error) {
      console.error('Aviso al inicializar datos semilla del catálogo:', error);
    } finally {
      promesaSemillaEnCurso = null;
    }
  })();

  return promesaSemillaEnCurso;
};
