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

// Fotografías verificadas por arquetipo morfológico para carga rápida en caché Workbox
const IMG_PERRO = {
  retriever: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
  labrador: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=300&q=80',
  pastor: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=300&q=80',
  collie: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=300&q=80',
  spitz: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80',
  moloso: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=300&q=80',
  braquicefalo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80',
  pug: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=300&q=80',
  sabueso: 'https://images.unsplash.com/photo-1537151608804-ea6f23b207eb?auto=format&fit=crop&w=300&q=80',
  terrier: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
  pequeno: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=300&q=80',
  rizado: 'https://images.unsplash.com/photo-1616149562385-1d84e79478bb?auto=format&fit=crop&w=300&q=80',
  teckel: 'https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=300&q=80',
  schnauzer: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=300&q=80',
  boxer: 'https://images.unsplash.com/photo-1543071220-6ee5bf71a54e?auto=format&fit=crop&w=300&q=80',
  mestizo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
};

const IMG_GATO = {
  europeo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
  siames: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=300&q=80',
  persa: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=300&q=80',
  mainecoon: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=300&q=80',
  bengali: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=300&q=80',
  azul: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=300&q=80',
  ragdoll: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=300&q=80',
  british: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=300&q=80',
  sphynx: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=300&q=80',
  angora: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=300&q=80',
  fold: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&w=300&q=80',
  tabby: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=300&q=80',
};

const TAREAS_PERRO = {
  pastor: ['Ración alta en proteína', 'Agua fresca constante', 'Ejercicio activo y agility (60 min)', 'Cepillado de manto y subpelo'],
  moloso: ['Ración medida en 2 tomas diarias', 'Agua fresca abundante', 'Paseo estructurado con correa', 'Revisión articular y limpieza de belfos'],
  braqui: ['Porción controlada de alimento', 'Agua fresca todo el día', 'Paseo suave evitando calor', 'Limpiar y secar pliegues faciales'],
  terrier: ['Alimento balanceado para su talla', 'Agua limpia', 'Paseo con juegos de rastreo', 'Cepillado dental y de manto'],
  teckel: ['Control estricto de porción (cuidar peso)', 'Agua fresca', 'Caminata en plano (evitar saltos altos)', 'Limpieza de orejas caídas'],
  spitz: ['Dieta energética de calidad', 'Agua fresca abundante', 'Caminata larga en horario fresco', 'Cepillado profundo de doble capa'],
  sabueso: ['Ración controlada (prevenir sobrepeso)', 'Agua limpia', 'Paseo largo de olfato y rastro', 'Limpiar y ventilar orejas largas'],
  muestra: ['Alimento para perros de alta actividad', 'Agua fresca', 'Carrera y ejercicio aeróbico', 'Revisión de almohadillas y oídos'],
  cobrador: ['Ración medida de alimento balanceado', 'Agua fresca', 'Paseo activo y juego de cobro', 'Cepillado y secado de orejas'],
  compania: ['Croqueta pequeña de alta digestibilidad', 'Agua fresca en plato limpio', 'Paseo tranquilo de 25 min', 'Cepillado diario e higiene ocular'],
  peloLargo: ['Alimento con ácidos grasos Omega 3', 'Agua limpia', 'Desenredado y cepillado diario', 'Paseo recreativo de 30 min'],
  primitivo: ['Alimento hipoalergénico de calidad', 'Agua fresca', 'Hidratar y proteger piel del sol', 'Paseo diario y abrigo en clima frío'],
  lebrel: ['Dieta digestible en tomas pequeñas', 'Agua fresca', 'Carrera segura en área cercada', 'Cama acolchada y abrigo térmico'],
};

const TAREAS_GATO = {
  corto: ['Servir alimento balanceado felino', 'Renovar agua fresca', 'Limpiar caja de arena', 'Sesión de juego con caña o rascador'],
  largo: ['Alimento control bolas de pelo', 'Agua fresca en fuente', 'Cepillado diario de manto largo', 'Limpiar arenero y contorno ocular'],
  activo: ['Dieta alta en proteína animal', 'Agua en movimiento (fuente)', 'Juegos intensos de caza y trepado', 'Higiene diaria del arenero'],
  sinPelo: ['Ración energética (metabolismo alto)', 'Agua limpia', 'Limpiar piel y pliegues con paño húmedo', 'Mantener refugio cálido y arenero limpio'],
  rizado: ['Alimento rico en nutrientes dérmicos', 'Agua fresca', 'Limpieza suave de orejas grandes', 'Higiene de arenero y juego interactivo'],
  gigante: ['Ración acorde a talla grande', 'Fuente amplia de agua fresca', 'Cepillar melena, pecho y cola', 'Rascador alto y limpieza de arenero'],
};

type EntradaPerro = [string, string, keyof typeof IMG_PERRO, keyof typeof TAREAS_PERRO];
type EntradaGato = [string, string, keyof typeof IMG_GATO, keyof typeof TAREAS_GATO];

// ==================== 100 RAZAS DE PERROS RECONOCIDAS (FCI / AKC) ====================
const CATALOGO_100_PERROS: EntradaPerro[] = [
  // Grupo 1: Pastores y Boyeros (16)
  ['Pastor Alemán', 'Leal, inteligente, valiente y protector familiar', 'pastor', 'pastor'],
  ['Pastor Belga Malinois', 'Atlético, alerta, trabajador y de gran energía', 'pastor', 'pastor'],
  ['Pastor Belga Groenendael', 'Elegante pastor negro de pelo largo y gran devoción', 'pastor', 'pastor'],
  ['Pastor Belga Tervueren', 'Ágil, vigilante y de manto leonado carbonado', 'pastor', 'pastor'],
  ['Border Collie', 'Considerado el perro más inteligente y ágil en pastoreo', 'collie', 'pastor'],
  ['Pastor Australiano (Aussie)', 'Dinámico, afectuoso y excelente en deportes caninos', 'collie', 'pastor'],
  ['Collie de Pelo Largo', 'Dulce, familiar y famoso por su abundante melena', 'collie', 'peloLargo'],
  ['Pastor de Shetland (Sheltie)', 'Pequeño pastor ágil, obediente y muy sensible', 'collie', 'peloLargo'],
  ['Antiguo Pastor Inglés (Bobtail)', 'Abundante pelaje gris y blanco, carácter bonachón', 'rizado', 'peloLargo'],
  ['Welsh Corgi Pembroke', 'Pequeño boyero galés alegre, despierto y sociable', 'pequeno', 'teckel'],
  ['Welsh Corgi Cardigan', 'Boyero galés de cola larga, leal y equilibrado', 'pequeno', 'teckel'],
  ['Pastor Blanco Suizo', 'Gentil, atento, familiar y de manto blanco puro', 'pastor', 'pastor'],
  ['Pastor Ganadero Australiano', 'Resistente, incansable y sumamente leal (Blue Heeler)', 'pastor', 'pastor'],
  ['Kelpie Australiano', 'Ágil pastor de trabajo con energía inagotable', 'pastor', 'pastor'],
  ['Pastor de Brie (Briard)', 'Rústico, alegre y protector de pelaje largo', 'rizado', 'peloLargo'],
  ['Komondor', 'Guardián húngaro de característico manto acordonado', 'rizado', 'peloLargo'],

  // Grupo 2: Pinscher, Schnauzer, Molosos y Boyeros Suizos (20)
  ['Rottweiler', 'Fuerte, seguro, tranquilo y guardián devoto', 'moloso', 'moloso'],
  ['Doberman', 'Elegante, atlético, leal y de gran inteligencia', 'moloso', 'pastor'],
  ['Pinscher Miniatura', 'Vivaz, intrépido y lleno de energía en talla pequeña', 'pequeno', 'compania'],
  ['Schnauzer Miniatura', 'Obediente, alerta, cariñoso y sin muda excesiva', 'schnauzer', 'terrier'],
  ['Schnauzer Estándar', 'Vigoroso, barbudo, guardián y excelente compañero', 'schnauzer', 'terrier'],
  ['Schnauzer Gigante', 'Imponente, noble y de gran capacidad de trabajo', 'schnauzer', 'pastor'],
  ['Boxer', 'Juguetón, paciente con los niños y protector', 'boxer', 'moloso'],
  ['Bulldog Inglés', 'Tranquilo, afectuoso, valiente y de porte robusto', 'braquicefalo', 'braqui'],
  ['Gran Danés (Dogo Alemán)', 'El gigante gentil: noble, afectuoso y majestuoso', 'moloso', 'moloso'],
  ['San Bernardo', 'Gigante alpino bondadoso, sereno y rescatista histórico', 'moloso', 'moloso'],
  ['Terranova (Newfoundland)', 'Dulce gigante amante del agua y protector familiar', 'moloso', 'moloso'],
  ['Boyero de Berna (Bernés)', 'Tricolor suizo afectuoso, tranquilo y familiar', 'collie', 'peloLargo'],
  ['Cane Corso (Mastín Italiano)', 'Guardián atlético, leal y muy apegado a su tutor', 'moloso', 'moloso'],
  ['Dogo Argentino', 'Potente, valiente, fiel y de manto blanco corto', 'moloso', 'moloso'],
  ['Dogo de Burdeos', 'Moloso francés calmado, afectuoso y de gran presencia', 'moloso', 'braqui'],
  ['Bullmastiff', 'Guardián silencioso, equilibrado y protector del hogar', 'moloso', 'moloso'],
  ['Mastín Napolitano', 'Imponente, leal y caracterizado por sus pliegues', 'moloso', 'braqui'],
  ['Mastín Español', 'Noble guardián de campo, sereno y muy resistente', 'moloso', 'moloso'],
  ['Mastín Tibetano (Dogo del Tíbet)', 'Majestuoso, independiente y de densa melena', 'spitz', 'peloLargo'],
  ['Shar Pei', 'Tranquilo, independiente y de característicos pliegues cutáneos', 'braquicefalo', 'braqui'],

  // Grupo 3: Terriers (11)
  ['Yorkshire Terrier', 'Pequeño, valiente y de manto largo sedoso acero y fuego', 'terrier', 'peloLargo'],
  ['Jack Russell Terrier', 'Incansable, alegre, inteligente y sumamente ágil', 'terrier', 'terrier'],
  ['Bull Terrier Inglés', 'Musculoso, afectuoso, juguetón y de perfil ovalado único', 'moloso', 'terrier'],
  ['Staffordshire Bull Terrier', 'Cariñoso con la familia, valiente y muy tenaz', 'moloso', 'terrier'],
  ['American Staffordshire Terrier', 'Fuerte, leal, sociable y de gran corazón', 'moloso', 'moloso'],
  ['West Highland White Terrier (Westie)', 'Pequeño terrier escocés blanco, alegre y confiado', 'terrier', 'terrier'],
  ['Scottish Terrier', 'Digno, independiente y de inconfundible silueta', 'schnauzer', 'terrier'],
  ['Fox Terrier de Pelo Duro', 'Vivaz, alerta, curioso y siempre listo para jugar', 'terrier', 'terrier'],
  ['Airedale Terrier', 'El rey de los terriers: versátil, noble y deportista', 'terrier', 'terrier'],
  ['Cairn Terrier', 'Rústico, despierto, alegre y muy resistente', 'terrier', 'terrier'],
  ['Bull Terrier Miniatura', 'Compacto, simpático y lleno de vitalidad', 'terrier', 'terrier'],

  // Grupo 4: Teckels / Dachshund (3)
  ['Dachshund (Salchicha Pelo Corto)', 'Valiente, ingenioso y muy apegado a su familia', 'teckel', 'teckel'],
  ['Dachshund de Pelo Largo', 'Elegante, afectuoso y de manto suave ondulado', 'teckel', 'teckel'],
  ['Dachshund de Pelo Duro', 'intrépido, simpático y con cejas y barba pobladas', 'teckel', 'teckel'],

  // Grupo 5: Spitz y Tipo Primitivo (15)
  ['Husky Siberiano', 'Atlético, sociable, expresivo y amante de correr', 'spitz', 'spitz'],
  ['Alaskan Malamute', 'Poderoso perro nórdico de trineo, noble y afectuoso', 'spitz', 'spitz'],
  ['Samoyedo', 'Famoso por su sonrisa permanente y manto blanco esponjoso', 'spitz', 'spitz'],
  ['Pomerania (Spitz Alemán Enano)', 'Pequeño, esponjoso, vivaz y muy cariñoso', 'pequeno', 'peloLargo'],
  ['Akita Inu', 'Digno, silencioso, valiente y de fidelidad legendaria', 'spitz', 'spitz'],
  ['Akita Americano', 'Robusto, protector, noble y de porte imponente', 'spitz', 'spitz'],
  ['Shiba Inu', 'Ágil, limpio, alerta y de carácter independiente', 'spitz', 'spitz'],
  ['Chow Chow', 'Sereno, reservado, de lengua azulada y melena de león', 'spitz', 'peloLargo'],
  ['Xoloitzcuintle (Estándar)', 'Joya ancestral mexicana sin pelo, cálido y tranquilo', 'pequeno', 'primitivo'],
  ['Xoloitzcuintle Miniatura', 'Variedad pequeña del perro azteca, leal y hogareño', 'pequeno', 'primitivo'],
  ['Calupoh (Perro Lobo de México)', 'Raza mexicana ancestral noble, ágil y muy familiar', 'pastor', 'pastor'],
  ['Perro Sin Pelo del Perú', 'Patrimonio andino afectuoso, despierto y elegante', 'pequeno', 'primitivo'],
  ['Basenji', 'Primitivo africano limpio, ágil y que no ladra', 'pequeno', 'terrier'],
  ['Keeshond (Spitz Lobo)', 'Alegre, atento y de abundante pelaje gris plateado', 'spitz', 'spitz'],
  ['Eurasier', 'Equilibrado, calmado y profundamente apegado a los suyos', 'spitz', 'spitz'],

  // Grupo 6: Sabuesos, Rastro y Semejantes (7)
  ['Beagle', 'Alegre, curioso, sociable y de olfato extraordinario', 'sabueso', 'sabueso'],
  ['Basset Hound', 'Tranquilo, tenaz, de orejas largas y mirada dulce', 'sabueso', 'sabueso'],
  ['Dálmata', 'Atlético, activo, leal y de inconfundible manto moteado', 'sabueso', 'muestra'],
  ['Bloodhound (San Huberto)', 'El mejor rastreador del mundo, gentil y paciente', 'sabueso', 'sabueso'],
  ['Rhodesian Ridgeback', 'Atlético, valiente, leal y con cresta dorsal única', 'sabueso', 'muestra'],
  ['Sabueso Español', 'Noble, tranquilo y de voz profunda y melodiosa', 'sabueso', 'sabueso'],
  ['Petit Basset Griffon Vendéen', 'Sabueso de pelo duro alegre, vivaz y sociable', 'sabueso', 'sabueso'],

  // Grupo 7: Perros de Muestra (6)
  ['Braco Alemán de Pelo Corto', 'Polivalente, atlético, noble y amante del campo', 'sabueso', 'muestra'],
  ['Weimaraner (Braco de Weimar)', 'Elegante manto gris plata, enérgico y muy fiel', 'sabueso', 'muestra'],
  ['Vizsla (Braco Húngaro)', 'Afectuoso, sensible, deportivo y de color dorado rojizo', 'sabueso', 'muestra'],
  ['Setter Irlandés Rojo', 'Entusiasta, amistoso y de brillante pelaje caoba', 'retriever', 'muestra'],
  ['Setter Inglés', 'Dulce, caballeroso, activo y de manto moteado', 'retriever', 'muestra'],
  ['Pointer Inglés', 'Veloz, resistente, bondadoso y de postura atlética', 'sabueso', 'muestra'],

  // Grupo 8: Cobradores, Levantadores y Perros de Agua (7)
  ['Labrador Retriever', 'Amigable, inteligente, paciente y compañero ideal', 'labrador', 'cobrador'],
  ['Golden Retriever', 'Cariñoso, dócil, familiar y siempre dispuesto a agradar', 'retriever', 'cobrador'],
  ['Cocker Spaniel Inglés', 'Alegre, afectuoso, juguetón y de orejas sedosas', 'retriever', 'cobrador'],
  ['Cocker Spaniel Americano', 'Dulce, sociable y de abundante manto ondulado', 'retriever', 'peloLargo'],
  ['Springer Spaniel Inglés', 'Activo, obediente, sociable y amante del agua', 'retriever', 'cobrador'],
  ['Perro de Agua Español', 'Rústico, inteligente, fiel y de pelaje rizado lanoso', 'rizado', 'cobrador'],
  ['Perro de Agua Portugués', 'Nadador incansable, despierto y hipoalergénico', 'rizado', 'cobrador'],

  // Grupo 9: Perros de Compañía (11)
  ['Poodle (Caniche Estándar)', 'Brillante, elegante, hipoalergénico y muy leal', 'rizado', 'peloLargo'],
  ['Poodle Toy / Miniatura', 'Pequeño, alegre, inteligente y adaptable a departamento', 'rizado', 'peloLargo'],
  ['Chihuahua de Pelo Corto', 'La raza más pequeña del mundo: valiente, alerta y fiel', 'pequeno', 'compania'],
  ['Chihuahua de Pelo Largo', 'Pequeño, dulce y con flecos suaves en orejas y cola', 'pequeno', 'compania'],
  ['Bulldog Francés', 'Sociable, simpático, compacto y de orejas de murciélago', 'braquicefalo', 'braqui'],
  ['Pug (Carlino)', 'Encantador, afectuoso, alegre y de gran expresión', 'pug', 'braqui'],
  ['Shih Tzu', 'Cariñoso, hogareño, sociable y de manto largo imperial', 'terrier', 'peloLargo'],
  ['Bichón Maltés', 'Blanco puro, dulce, elegante y sumamente afectuoso', 'rizado', 'peloLargo'],
  ['Bichón Frisé', 'Alegre, esponjoso como una nube y muy sociable', 'rizado', 'peloLargo'],
  ['Cavalier King Charles Spaniel', 'Gentil, afectuoso, sereno y adaptable a toda familia', 'retriever', 'compania'],
  ['Papillón (Spaniel Continental)', 'Despierto, ágil y con orejas en forma de mariposa', 'pequeno', 'compania'],

  // Grupo 10: Lebreles y Mestizos (4)
  ['Galgo Español', 'Noble, sensible, silencioso en casa y veloz en carrera', 'sabueso', 'lebrel'],
  ['Greyhound (Galgo Inglés)', 'Dulce, calmado en el hogar y atleta de velocidad', 'sabueso', 'lebrel'],
  ['Whippet', 'Lebrel mediano afectuoso, limpio, dócil y adaptable', 'sabueso', 'lebrel'],
  ['Mestizo / Criollo Canino', 'Ejemplar único, noble, resistente y eternamente agradecido', 'mestizo', 'cobrador'],
];

// ==================== 100 RAZAS Y VARIEDADES DE GATOS (TICA / CFA / FIFe / WCF) ====================
const CATALOGO_100_GATOS: EntradaGato[] = [
  ['Europeo de Pelo Corto', 'Equilibrado, cariñoso, ágil y excelente compañero', 'europeo', 'corto'],
  ['Siamés Moderno', 'Esbelto, vocal, afectuoso y de ojos azules intensos', 'siames', 'activo'],
  ['Siamés Tradicional (Thai)', 'Complexión redondeada, sociable y muy comunicativo', 'siames', 'activo'],
  ['Persa Clásico', 'Sereno, dulce, hogareño y de manto largo exuberante', 'persa', 'largo'],
  ['Persa Chinchilla', 'Elegante persa de manto blanco con puntas plateadas', 'persa', 'largo'],
  ['Maine Coon', 'El gigante gentil norteamericano, sociable y juguetón', 'mainecoon', 'gigante'],
  ['Bengalí (Bengal)', 'Atlético, curioso y con rosetas similares al leopardo', 'bengali', 'activo'],
  ['Azul Ruso', 'Tranquilo, limpio, leal y de manto gris azulado plateado', 'azul', 'corto'],
  ['Ragdoll', 'Sumamente dócil, relajado y de ojos azules profundos', 'ragdoll', 'largo'],
  ['Ragamuffin', 'Cariñoso, paciente y de pelaje semilargo afelpado', 'ragdoll', 'largo'],
  ['British Shorthair', 'Robusto, calmado y de manto corto denso como peluche', 'british', 'corto'],
  ['British Longhair', 'Variedad de pelo semilargo del británico, sereno y noble', 'british', 'largo'],
  ['Sphynx (Esfinge)', 'Sin pelo, cálido al tacto, extrovertido y muy afectuoso', 'sphynx', 'sinPelo'],
  ['Angora Turco', 'Esbelto, inteligente, activo y de manto sedoso', 'angora', 'largo'],
  ['Van Turco', 'Famoso por su gusto por el agua y manchas en cabeza y cola', 'angora', 'largo'],
  ['Scottish Fold', 'Dulce, pacífico y caracterizado por sus orejas plegadas', 'fold', 'corto'],
  ['Scottish Straight', 'Hermano de orejas rectas del Fold, equilibrado y sano', 'british', 'corto'],
  ['Highland Fold', 'Variedad de pelo semilargo del Scottish Fold, muy dócil', 'fold', 'largo'],
  ['Abisinio', 'Ágil, curioso, expresivo y de manto ticked ancestral', 'bengali', 'activo'],
  ['Somalí', 'Versión de pelo semilargo del Abisinio con cola de zorro', 'mainecoon', 'largo'],
  ['Bosque de Noruega', 'Grande, rústico, trepador y de doble manto impermeable', 'mainecoon', 'gigante'],
  ['Siberiano', 'Robusto gato de bosque ruso, afectuoso e hipoalergénico', 'mainecoon', 'gigante'],
  ['Neva Masquerade', 'Variante colorpoint del gato Siberiano de ojos azules', 'ragdoll', 'gigante'],
  ['Sagrado de Birmania (Birman)', 'Dulce, de ojos azules y cuatro patitas blancas (guantes)', 'ragdoll', 'largo'],
  ['Burmés (Burmese)', 'Compacto, afectuoso, juguetón y de ojos dorados', 'siames', 'corto'],
  ['Burmilla', 'Gentil, sociable y de hermoso manto sombreado plateado', 'azul', 'corto'],
  ['Bombay', 'Manto negro charol brillante y ojos color cobre como pantera', 'azul', 'corto'],
  ['Cartujo (Chartreux)', 'Raza francesa silenciosa, robusta y de manto gris azulado', 'azul', 'corto'],
  ['Exótico de Pelo Corto', 'Carita dulce de Persa con pelaje corto y fácil de cuidar', 'british', 'corto'],
  ['Himalayo (Colorpoint Persa)', 'Manto largo de Persa con patrón de puntas oscuras de Siamés', 'persa', 'largo'],
  ['Balinés', 'Elegante versión de pelo semilargo del Siamés, muy inteligente', 'siames', 'largo'],
  ['Javanés (Colorpoint Longhair)', 'Vocal, atlético y de pelaje sedoso semilargo', 'siames', 'largo'],
  ['Oriental de Pelo Corto', 'Esbelto, de grandes orejas y más de 300 colores de manto', 'siames', 'activo'],
  ['Oriental de Pelo Largo', 'Fino, sociable y de manto semilargo pegado al cuerpo', 'siames', 'largo'],
  ['Cornish Rex', 'Pelaje corto rizado en ondas, cuerpo atlético y juguetón', 'sphynx', 'rizado'],
  ['Devon Rex', 'Grandes orejas, mirada de duende y pelo corto ondulado', 'sphynx', 'rizado'],
  ['Selkirk Rex', 'El gato con pelaje rizado abundante tipo oveja, muy paciente', 'persa', 'rizado'],
  ['LaPerm', 'Cariñoso, curioso y de rizos suaves y esponjosos', 'mainecoon', 'rizado'],
  ['German Rex', 'Primera raza europea de pelo rizado aterciopelado y carácter dulce', 'british', 'rizado'],
  ['American Shorthair', 'Fuerte, longevo, sociable y famoso en patrón silver tabby', 'tabby', 'corto'],
  ['American Wirehair', 'Pelaje corto elástico y rizado con temperamento amigable', 'tabby', 'rizado'],
  ['American Curl', 'Orejas curvadas hacia atrás, juguetón y eterno cachorro', 'europeo', 'corto'],
  ['American Bobtail', 'Robusto, afectuoso y de cola corta natural expresiva', 'tabby', 'corto'],
  ['Bobtail Japonés', 'Símbolo de buena suerte en Japón con cola en pompón', 'europeo', 'activo'],
  ['Bobtail Kuriliano', 'Originario de las islas Kuriles, gran saltador y pescador', 'mainecoon', 'activo'],
  ['Mekong Bobtail', 'Patrón siamés con cola corta natural y gran lealtad', 'siames', 'activo'],
  ['Pixie-Bob', 'Aspecto de lince montés con temperamento sumamente dócil', 'tabby', 'corto'],
  ['Manx', 'Originario de la Isla de Man, sin cola y gran cazador', 'british', 'corto'],
  ['Cymric (Manx de Pelo Largo)', 'Variedad de pelo semilargo del Manx, redondo y tranquilo', 'persa', 'largo'],
  ['Mau Egipcio', 'El único gato doméstico con manchas naturales y gran velocidad', 'bengali', 'activo'],
  ['Mau Árabe', 'Raza natural del desierto, resistente, ágil y muy afectuosa', 'europeo', 'activo'],
  ['Ocicat', 'Moteado salvaje pero 100% doméstico, sociable y extrovertido', 'bengali', 'activo'],
  ['Savannah (Generación Doméstica F4/F5)', 'Alto, esbelto, moteado y de gran inteligencia y salto', 'bengali', 'activo'],
  ['Chausie', 'Atlético, de cuerpo largo y gran necesidad de compañía', 'bengali', 'activo'],
  ['Toyger', 'Diseñado con rayas circulares que evocan a un pequeño tigre', 'tabby', 'activo'],
  ['Serengeti', 'Piernas largas, orejas grandes y manto moteado elegante', 'bengali', 'activo'],
  ['California Spangled', 'Moteado, activo, afectuoso y de mirada expresiva', 'bengali', 'activo'],
  ['Singapura', 'La raza felina más pequeña del mundo, dulce y curiosa', 'siames', 'corto'],
  ['Korat', 'Originario de Tailandia, gris plateado con ojos verdes luminosos', 'azul', 'corto'],
  ['Khao Manee', 'Gato real tailandés blanco puro, a menudo con ojos dispares', 'angora', 'corto'],
  ['Suphalak', 'Raza tailandesa de manto cobrizo uniforme y gran afecto', 'siames', 'corto'],
  ['Tonkinés', 'Cruce entre Siamés y Burmés con ojos color aguamarina', 'siames', 'activo'],
  ['Snowshoe', 'Patrón colorpoint con patitas blancas y V facial blanca', 'siames', 'corto'],
  ['Habana Brown', 'Manto color chocolate caoba brillante y bigotes marrones', 'siames', 'corto'],
  ['Nebelung', 'Versión de pelo semilargo del Azul Ruso, sereno y fiel', 'azul', 'largo'],
  ['Donskoy (Don Sphynx)', 'Gato ruso sin pelo, sociable, cálido y muy familiar', 'sphynx', 'sinPelo'],
  ['Peterbald', 'Elegante gato oriental ruso sin pelo o con piel de durazno', 'sphynx', 'sinPelo'],
  ['Ukrainian Levkoy', 'Sin pelo y con orejas plegadas, muy dócil y hogareño', 'sphynx', 'sinPelo'],
  ['Bambino', 'Gato sin pelo de talla baja, cariñoso y juguetón', 'sphynx', 'sinPelo'],
  ['Elf Cat', 'Cruza sin pelo con orejas curvadas de American Curl', 'sphynx', 'sinPelo'],
  ['Minskin', 'Pequeño, afectuoso y con puntos de pelo aterciopelado', 'sphynx', 'sinPelo'],
  ['Lykoi (Gato Lobo)', 'Mutación natural con pelaje roano parcial y gran lealtad', 'azul', 'corto'],
  ['Munchkin', 'De extremidades cortas, curioso, rápido y muy sociable', 'europeo', 'corto'],
  ['Minuet (Napoleón)', 'Cruza de Persa y Munchkin de cara dulce y manto denso', 'persa', 'largo'],
  ['Skookum', 'Pequeño y de pelaje rizado tipo LaPerm, alegre y dócil', 'persa', 'rizado'],
  ['Kinkalow', 'Pequeño, con orejas curvadas hacia atrás y carácter juguetón', 'fold', 'corto'],
  ['Genetta', 'Manto moteado o marmoleado en cuerpo compacto y curioso', 'bengali', 'corto'],
  ['Highlander', 'Aspecto robusto con orejas curvadas y carácter muy sociable', 'tabby', 'activo'],
  ['Australian Mist', 'Raza australiana moteada suave, ideal para vida en interior', 'tabby', 'corto'],
  ['Brazilian Shorthair', 'Raza brasileña ágil, expresiva y de pelo corto brillante', 'europeo', 'corto'],
  ['Ceilán (Ceylon)', 'Originario de Sri Lanka, manto ticked dorado y muy sociable', 'bengali', 'corto'],
  ['Sokoke', 'Raza natural de Kenia con patrón de corteza de árbol', 'bengali', 'activo'],
  ['Dragon Li (Li Hua)', 'Raza natural china atigrada marrón, inteligente y leal', 'tabby', 'corto'],
  ['Chantilly-Tiffany', 'Manto semilargo color chocolate sedoso y voz suave', 'mainecoon', 'largo'],
  ['York Chocolate', 'Pelaje semilargo chocolate o lavanda, afectuoso y hogareño', 'mainecoon', 'largo'],
  ['Aphrodite Giant', 'Originario de Chipre, grande, musculoso y sumamente gentil', 'mainecoon', 'gigante'],
  ['Aegean (Gato del Egeo)', 'Raza natural de las islas griegas, amante del agua y sociable', 'europeo', 'corto'],
  ['Toybob', 'Gato miniatura de cola corta y patrón colorpoint', 'siames', 'corto'],
  ['Foldex', 'Raza canadiense con rostro de Exótico y orejas plegadas', 'fold', 'corto'],
  ['Kanaani', 'Ágil, atlético y de manto moteado beige y negro', 'bengali', 'activo'],
  ['Mestizo Felino de Pelo Corto', 'Compañero doméstico único, resistente y lleno de cariño', 'europeo', 'corto'],
  ['Mestizo Felino de Pelo Largo', 'Gato doméstico de manto abundante y carácter dulce', 'mainecoon', 'largo'],
  ['Gato Calicó (Tricolor)', 'Doméstico de manto blanco, naranja y negro, vivaz y leal', 'europeo', 'corto'],
  ['Gato Carey (Tortoiseshell)', 'Manto jaspeado negro y naranja con personalidad única', 'tabby', 'corto'],
  ['Gato Tuxedo (Bicolor Esmoquin)', 'Elegante manto negro con pecho y patitas blancas', 'europeo', 'corto'],
  ['Gato Romano (Tabby Gris)', 'Clásico atigrado gris doméstico, juguetón y cariñoso', 'tabby', 'corto'],
  ['Gato Orange Tabby (Naranja)', 'Famoso por su carácter extremadamente sociable y afectuoso', 'europeo', 'corto'],
  ['Gato Negro Doméstico', 'Elegante pantera casera de pelaje azabache y gran ternura', 'azul', 'corto'],
  ['Gato Blanco Doméstico', 'Manto níveo brillante; requiere protección solar en orejas', 'angora', 'corto'],
  ['Gato Siamés Lynx Point', 'Variedad doméstica colorpoint con marcas atigradas suaves', 'siames', 'corto'],
];

// ==================== 65 ANIMALES DOMÉSTICOS, DE GRANJA Y EXÓTICOS LEGALES ====================
const CATALOGO_OTROS_ANIMALES: RazaSemilla[] = [
  // --- A. Pequeños Mamíferos y Roedores Domésticos (16) ---
  {
    name: 'Conejo Cabeza de León',
    category: 'Otros',
    desc: 'Doméstico pequeño con característica melena suave alrededor del cuello',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno fresco ilimitado (80% dieta)', 'Hojas verdes lavadas', 'Agua limpia en bebedero', 'Cepillar melena para evitar nudos'],
  },
  {
    name: 'Conejo Belier (Holland Lop)',
    category: 'Otros',
    desc: 'Dócil, tranquilo y de largas orejas caídas a los lados',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Rellenar heno de timothy', 'Porción de verduras frescas', 'Revisar limpieza de orejas caídas', 'Tiempo de ejercicio fuera del corral'],
  },
  {
    name: 'Conejo Enano Neerlandés',
    category: 'Otros',
    desc: 'Compacto, vivaz y de orejas cortas erguidas',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno disponible todo el día', 'Pellets de fibra medida', 'Agua fresca', 'Revisar desgaste de incisivos'],
  },
  {
    name: 'Conejo Rex',
    category: 'Otros',
    desc: 'Noble y famoso por su pelaje corto denso como terciopelo',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno fresco abundante', 'Sustrato suave para cuidar tarsos', 'Agua limpia', 'Hojas verdes frescas'],
  },
  {
    name: 'Conejo Californiano (Granja/Hogar)',
    category: 'Otros',
    desc: 'Blanco con extremidades oscuras, dócil y rústico',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Suministrar forraje y heno seco', 'Agua limpia constante', 'Limpiar bandeja sanitaria', 'Revisión de patas y orejas'],
  },
  {
    name: 'Cuyo / Cobaya Americana',
    category: 'Otros',
    desc: 'Pelo corto liso, muy sociable, dócil y comunicativa',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno fresco ilimitado', 'Verdura con Vitamina C (pimiento)', 'Renovar agua en bebedero', 'Limpiar sustrato húmedo'],
  },
  {
    name: 'Cuyo Abisinio (Rosetas)',
    category: 'Otros',
    desc: 'Activo y simpático, con remolinos naturales en su pelaje',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno disponible 24/7', 'Suplemento natural de Vitamina C', 'Cepillado suave de rosetas', 'Higiene del hábitat'],
  },
  {
    name: 'Cuyo Peruano de Pelo Largo',
    category: 'Otros',
    desc: 'Tranquilo y de manto largo lacio que requiere peinado',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno limpio en henera alta', 'Pimiento rojo o hoja verde', 'Peinar y recortar puntas de pelo', 'Agua fresca'],
  },
  {
    name: 'Hámster Sirio Dorado',
    category: 'Otros',
    desc: 'Solitario, nocturno, dócil y fácil de manipular',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Mezcla balanceada de semillas', 'Verificar bebedero de gota', 'Retirar alimento fresco sobrante', 'Revisar rueda sólida (min. 28 cm)'],
  },
  {
    name: 'Hámster Enano Ruso',
    category: 'Otros',
    desc: 'Pequeño, curioso y con línea dorsal oscura característica',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Semillas pequeñas sin azúcares', 'Agua fresca en bebedero', 'Baño de arena para roedores', 'Limpiar rincón sanitario'],
  },
  {
    name: 'Hámster Roborovski',
    category: 'Otros',
    desc: 'El hámster más pequeño y veloz, ideal para observación',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Mix de mijo y microsemillas', 'Agua limpia', 'Zona amplia de arena limpia', 'Verificar túneles y rueda'],
  },
  {
    name: 'Chinchilla Doméstica',
    category: 'Otros',
    desc: 'Roedor andino criado en cautiverio, ágil y de pelaje ultra denso',
    bg: 'bg-slate-50',
    img: 'https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno de alfalfa/timothy y pellets', 'Baño de polvo volcánico seco', 'Agua fresca en botella', 'Controlar ambiente fresco (<22 °C)'],
  },
  {
    name: 'Hurón Doméstico',
    category: 'Otros',
    desc: 'Mustélido doméstico juguetón, inteligente y muy sociable',
    bg: 'bg-rose-50',
    img: 'https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alimento carnívoro estricto (alta proteína)', 'Agua fresca', '2 horas de juego supervisado', 'Limpiar esquinero y hamacas'],
  },
  {
    name: 'Jerbo de Mongolia',
    category: 'Otros',
    desc: 'Roedor excavador diurno/nocturno, limpio y sociable en pareja',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Semillas y cartón para roer', 'Agua en bebedero de vidrio', 'Mantener cama profunda para túneles', 'Baño de arena seca'],
  },
  {
    name: 'Rata Dumbo Doméstica',
    category: 'Otros',
    desc: 'Sumamente inteligente, limpia, afectuosa y entrenable',
    bg: 'bg-slate-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Bloques nutricionales y verdura fresca', 'Agua limpia', 'Juegos de inteligencia y socialización', 'Ventilar y limpiar jaula'],
  },
  {
    name: 'Degú Chileno',
    category: 'Otros',
    desc: 'Roedor diurno muy comunicativo; requiere dieta estricta sin azúcar',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno y hierbas secas (cero frutas/azúcar)', 'Agua fresca', 'Ramas seguras para desgaste dental', 'Baño de arena'],
  },

  // --- B. Animales de Granja, Equinos y Traspatio (24) ---
  {
    name: 'Caballo Cuarto de Milla',
    category: 'Otros',
    desc: 'Equino noble, musculoso, dócil y versátil para rancho y monta',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Suministrar forraje (heno/alfalfa) y grano', 'Agua limpia abundante (40-50 L/día)', 'Limpieza de cascos y cepillado', 'Limpiar pesebrera / salida a potrero'],
  },
  {
    name: 'Caballo Azteca',
    category: 'Otros',
    desc: 'Raza nacional mexicana elegante, resistente y de gran nobleza',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Ración de pastura y avena', 'Revisar bebedero automático', 'Cepillar crin, cola y revisar cascos', 'Trabajo ligero o paseo en picadero'],
  },
  {
    name: 'Caballo Frisón',
    category: 'Otros',
    desc: 'Imponente equino negro de abundante crin y trote elevado',
    bg: 'bg-slate-50',
    img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Forraje de calidad y sales minerales', 'Agua fresca constante', 'Cuidar y secar cernejas de las patas', 'Ejercicio diario en pista'],
  },
  {
    name: 'Pony Shetland',
    category: 'Otros',
    desc: 'Pequeño equino rústico, inteligente y muy fuerte',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Controlar pastoreo (prevenir laminitis)', 'Agua limpia', 'Cepillado de manto y limpieza de cascos', 'Caminata diaria'],
  },
  {
    name: 'Burro Doméstico (Asno)',
    category: 'Otros',
    desc: 'Animal de granja longevo, inteligente, estoico y gran compañero',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Forraje fibroso seco (paja/heno)', 'Agua limpia', 'Mantener cascos secos y limpios', 'Refugio contra lluvia'],
  },
  {
    name: 'Vaca Holstein (Lechera)',
    category: 'Otros',
    desc: 'Bovino de granja dócil, reconocible por su manto blanco y negro',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Suministrar pastura, ensilaje y sales minerales', 'Agua fresca a libre acceso', 'Higiene de ubre y ordeño programado', 'Revisión de pezuñas y sombra'],
  },
  {
    name: 'Vaca Jersey',
    category: 'Otros',
    desc: 'Bovino de talla media, carácter manso y leche de alta calidad',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pastoreo rotacional y forraje', 'Agua limpia constante', 'Bloque de minerales disponible', 'Revisión sanitaria general'],
  },
  {
    name: 'Ganado Brahman / Cebú',
    category: 'Otros',
    desc: 'Bovino rústico adaptado a climas cálidos y tropicales',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Revisión de pradera y comedero', 'Agua fresca en abrevadero', 'Control preventivo de ectoparásitos', 'Suplemento mineral'],
  },
  {
    name: 'Cabra Enana Nigeriana',
    category: 'Otros',
    desc: 'Caprino pequeño, dócil, juguetón e ideal para granja familiar',
    bg: 'bg-lime-50',
    img: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Forraje en comedero elevado', 'Agua limpia', 'Minerales específicos para caprinos', 'Revisar cercado y estructuras de trepado'],
  },
  {
    name: 'Cabra Alpina / Saanen',
    category: 'Otros',
    desc: 'Caprino lechero noble, curioso y de excelente producción',
    bg: 'bg-lime-50',
    img: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno de alfalfa y ramoneo', 'Agua limpia dos veces al día', 'Higiene de corral seco', 'Revisión de pezuñas'],
  },
  {
    name: 'Oveja Dorper',
    category: 'Otros',
    desc: 'Ovino rústico de pelo corto que no requiere esquila pesada',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pastoreo o heno de gramíneas', 'Agua fresca en bebedero', 'Sal mineral apta para ovinos (baja en cobre)', 'Resguardo nocturno seguro'],
  },
  {
    name: 'Oveja Merino / Suffolk',
    category: 'Otros',
    desc: 'Ovino dócil de lana fina, gregario y tranquilo',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Suministrar pastura y forraje seco', 'Agua limpia', 'Revisar estado del vellón y pezuñas', 'Cierre seguro de redil'],
  },
  {
    name: 'Mini Pig (Cerdito Juliana)',
    category: 'Otros',
    desc: 'Cerdito miniatura sumamente inteligente, limpio y afectuoso',
    bg: 'bg-rose-50',
    img: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Vegetales frescos y pellet bajo en calorías', 'Agua fresca constante', 'Juegos de olfato (hocicar en jardín)', 'Hidratar piel con aceite de coco'],
  },
  {
    name: 'Cerdo Vietnamita de Granja',
    category: 'Otros',
    desc: 'Porcino doméstico tranquilo, sociable y de fácil manejo en granja',
    bg: 'bg-rose-50',
    img: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Ración balanceada de verduras y fibra', 'Agua limpia y zona de sombra fresca', 'Limpieza de área de descanso', 'Revisión de pezuñas'],
  },
  {
    name: 'Alpaca Huacaya',
    category: 'Otros',
    desc: 'Camélido sudamericano doméstico, pacífico y de fibra suave',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1511885663737-eea53f6d6187?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Heno de pasto y pastoreo limpio', 'Agua fresca disponible', 'Limpiar estercolero comunal', 'Verificar sombra y ventilación'],
  },
  {
    name: 'Llama Doméstica',
    category: 'Otros',
    desc: 'Camélido noble, guardián natural de rebaños y muy resistente',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1511885663737-eea53f6d6187?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Forraje fibroso y sales minerales', 'Agua limpia', 'Revisión de potrero', 'Cepillado superficial sin estrés'],
  },
  {
    name: 'Gallina Leghorn / Rhode Island',
    category: 'Otros',
    desc: 'Aves domésticas de traspatio dóciles, activas y excelentes ponedoras',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alimento balanceado con calcio y grano', 'Agua limpia en bebedero', 'Recolectar huevos y limpiar nidales', 'Cerrar gallinero al atardecer'],
  },
  {
    name: 'Gallina Sedosa del Japón (Silkie)',
    category: 'Otros',
    desc: 'Ave ornamental de plumaje esponjoso como seda y carácter muy manso',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Grano fino y verdura picada', 'Agua limpia', 'Mantener cama seca (su plumaje no repele agua)', 'Revisar copete y ojos'],
  },
  {
    name: 'Codorniz Japonesa',
    category: 'Otros',
    desc: 'Ave pequeña de traspatio silenciosa, productiva y fácil de alojar',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alimento alto en proteína para codorniz', 'Agua limpia en bebedero de copa', 'Limpiar bandeja inferior', 'Recolección diaria'],
  },
  {
    name: 'Pato Pekín Doméstico',
    category: 'Otros',
    desc: 'Ave acuática de granja alegre, sociable y de plumaje blanco',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1555852095-64e7428df0fa?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Grano y verduras acuáticas', 'Bebedero hondo para sumergir el pico', 'Renovar agua de tina o estanque', 'Cama seca de paja por la noche'],
  },
  {
    name: 'Ganso Doméstico (Toulouse)',
    category: 'Otros',
    desc: 'Ave de granja inteligente, leal y excelente guardián natural del terreno',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1555852095-64e7428df0fa?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pastoreo de hierba fresca y grano', 'Agua limpia profunda', 'Revisión de corral nocturno', 'Limpieza de bebederos'],
  },
  {
    name: 'Pavo Doméstico (Guajolote)',
    category: 'Otros',
    desc: 'Ave tradicional mexicana de traspatio, curiosa y gregaria',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Mezcla de granos, maíz y hojas verdes', 'Agua fresca y limpia', 'Perchas firmes y techo seco', 'Higiene del patio'],
  },
  {
    name: 'Paloma Mensajera / Tórtola',
    category: 'Otros',
    desc: 'Ave doméstica dócil con extraordinario sentido de orientación',
    bg: 'bg-slate-50',
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Mezcla de semillas y grit mineral', 'Agua limpia para bebida y baño', 'Limpiar palomar y posaderos', 'Vuelo supervisado'],
  },
  {
    name: 'Abeja Melífera (Colmena Apícola)',
    category: 'Otros',
    desc: 'Polinizador esencial de granja sustentable y producción apícola',
    bg: 'bg-yellow-50',
    img: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Verificar bebedero externo con piedras', 'Observar actividad en piquera sin molestar', 'Vigilar floración o reserva de alimento', 'Control libre de plagas (hormigas/varroa)'],
  },

  // --- C. Exóticos Legales y Éticos de Criadero Autorizado (SEMARNAT / UMA / PIMVS) (25) ---
  {
    name: 'Erizo Pigmeo Africano (PIMVS)',
    category: 'Otros',
    desc: 'Exótico legal de criadero autorizado; nocturno, tranquilo y solitario',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Croqueta insectívora / baja en grasa', 'Agua fresca en plato pesado', 'Verificar termostato (23-26 °C constante)', 'Limpiar rueda sólida de ejercicio'],
  },
  {
    name: 'Petauro del Azúcar (Criadero Legal)',
    category: 'Otros',
    desc: 'Pequeño marsupial nocturno planeador; requiere compañía de su especie',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Dieta equilibrada (néctar, proteína y fruta)', 'Agua fresca', 'Socialización nocturna y bolsas de dormir limpias', 'Revisión de jaula vertical segura'],
  },
  {
    name: 'Canario Doméstico',
    category: 'Otros',
    desc: 'Ave cantora tradicional alegre, limpia y de fácil cuidado en hogar',
    bg: 'bg-yellow-50',
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alpiste, semillas y brócoli/manzana', 'Renovar agua y bañera matutina', 'Limpiar bandeja y perchas', 'Proteger de corrientes de aire'],
  },
  {
    name: 'Periquito Australiano',
    category: 'Otros',
    desc: 'Psitácido doméstico legal, colorido, sociable y muy juguetón',
    bg: 'bg-teal-50',
    img: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Semillas limpias, mijo y hoja verde', 'Agua fresca diaria', 'Hueso de jibia para calcio y pico', 'Limpieza de bandeja y juguetes'],
  },
  {
    name: 'Cacatúa Ninfa (Carolina)',
    category: 'Otros',
    desc: 'Ave australiana de criadero muy afectuosa, silbadora y dócil',
    bg: 'bg-yellow-50',
    img: 'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pienso extruido, semillas y verdura', 'Agua limpia', 'Interacción y vuelo seguro en habitación cerrada', 'Higiene de perchas'],
  },
  {
    name: 'Agapornis (Inseparable)',
    category: 'Otros',
    desc: 'Pequeño loro africano de criadero legal, activo y muy curioso',
    bg: 'bg-emerald-50',
    img: 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Mezcla de semillas sin exceso de girasol y fruta', 'Agua fresca', 'Juguetes de madera natural para picotear', 'Limpieza de jaula'],
  },
  {
    name: 'Diamante Mandarín / de Gould',
    category: 'Otros',
    desc: 'Pequeños pinzones exóticos legales, alegres y sociables en grupo',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Mijo para exóticos y verdura fresca', 'Agua limpia y bañera', 'Hueso de jibia disponible', 'Limpiar fondo de voladera'],
  },
  {
    name: 'Conuro del Sol (Registro PIMVS)',
    category: 'Otros',
    desc: 'Psitácido exótico de criadero certificado, colorido y muy apegado',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pienso, frutas y verduras variadas', 'Agua limpia 2 veces al día', 'Juguetes de forrajeo e interacción', 'Conservar factura de legal procedencia'],
  },
  {
    name: 'Gecko Leopardo (Criadero Legal)',
    category: 'Otros',
    desc: 'Reptil insectívoro nocturno dócil, criado éticamente en cautiverio',
    bg: 'bg-amber-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Verificar placa térmica (zona cálida 30-32 °C)', 'Humedecer refugio húmedo para muda', 'Agua limpia y plato con calcio', 'Ofrecer insectos espolvoreados con calcio'],
  },
  {
    name: 'Gecko Crestado (Criadero Legal)',
    category: 'Otros',
    desc: 'Gecko arborícola dócil que se alimenta de papillas de fruta e insectos',
    bg: 'bg-emerald-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Rociar terrario vertical (humedad 60-80%)', 'Servir papilla específica fresca por la tarde', 'Agua en bebedero elevado', 'Verificar temperatura templada (22-26 °C)'],
  },
  {
    name: 'Dragón Barbudo (Pogona)',
    category: 'Otros',
    desc: 'Reptil australiano diurno sumamente tranquilo, expresivo y sociable',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Encender lámpara UVB 10.0 y foco de calor', 'Servir hojas verdes y porción de insectos', 'Agua fresca y baño tibio semanal', 'Limpiar sustrato del terrario'],
  },
  {
    name: 'Camaleón Velado (PIMVS)',
    category: 'Otros',
    desc: 'Reptil arborícola de criadero legal; requiere terrario de malla ventilado',
    bg: 'bg-lime-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Activar sistema de goteo/nebulización en hojas', 'Verificar lámpara UVB y punto de asoleo', 'Ofrecer insectos vivos con calcio', 'Evitar manipulación innecesaria (reduce estrés)'],
  },
  {
    name: 'Pitón Bola / Real (PIMVS)',
    category: 'Otros',
    desc: 'Serpiente constrictora pequeña, tranquila y criada legalmente en fases',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Verificar termostato (31 °C cálido / 25 °C fresco)', 'Controlar humedad (55-65%)', 'Renovar plato amplio de agua', 'Alimentación programada (semanal/quincenal)'],
  },
  {
    name: 'Serpiente del Maíz (Criadero Legal)',
    category: 'Otros',
    desc: 'Colúbrido inofensivo, colorido y muy adaptable en terrario seguro',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Verificar gradiente térmico y cierres del terrario', 'Agua limpia constante', 'Revisar refugios en zona fría y cálida', 'Registro de mudas y alimentación'],
  },
  {
    name: 'Tortuga Rusa / Terrestre (PIMVS)',
    category: 'Otros',
    desc: 'Tortuga de tierra pequeña, herbívora, longeva y de tenencia legal',
    bg: 'bg-lime-50',
    img: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Hojas verdes silvestres y calcio (cero fruta cítrica)', 'Baño de hidratación en agua tibia baja', 'Luz solar directa o lámpara UVB diaria', 'Limpiar terrario seco'],
  },
  {
    name: 'Tortuga de Orejas Rojas / Japonesa',
    category: 'Otros',
    desc: 'Tortuga semiacuática activa; nunca debe liberarse en ríos o lagos',
    bg: 'bg-lime-50',
    img: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pellets acuáticos, vegetales y calcio', 'Verificar filtro potente y calentador (26 °C)', 'Zona seca con lámpara UVB para asolearse', 'Retirar restos de comida del agua'],
  },
  {
    name: 'Rana Pacman (Escuerzo de Criadero)',
    category: 'Otros',
    desc: 'Anfibio terrestre rechoncho y tranquilo criado en cautiverio',
    bg: 'bg-emerald-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pulverizar agua sin cloro (humedad 70-80%)', 'Mantener sustrato de fibra de coco húmedo', 'Cambiar charca de agua declorada', 'Alimentación controlada según talla'],
  },
  {
    name: 'Ajolote Mexicano (Solo UMA Certificada)',
    category: 'Otros',
    desc: 'Anfibio endémico; su tenencia ética exige registro UMA de conservación',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Vigilar temperatura fría del agua (15-18 °C)', 'Verificar filtro suave sin corriente fuerte', 'Alimentar y sifonear restos del fondo', 'Sin grava pequeña que pueda ingerir'],
  },
  {
    name: 'Pez Betta Splendens',
    category: 'Otros',
    desc: 'Pez laberíntico de aletas vistosas; requiere acuario con calentador',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['3-4 micro-pellets específicos para Betta', 'Verificar termostato a 26-27 °C y filtro suave', 'Observar estado de aletas y plantas', 'Cambio parcial semanal con anticloro'],
  },
  {
    name: 'Pez Goldfish (Carassius)',
    category: 'Otros',
    desc: 'Clásico pez de agua templada/fría, sociable y de gran longevidad',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Alimento hundible y guisante hervido pelado', 'Verificar oxigenación y filtración potente', 'Retirar restos no consumidos en 2 min', 'Control de nitritos y cambio parcial'],
  },
  {
    name: 'Pez Koi de Estanque',
    category: 'Otros',
    desc: 'Carpa ornamental japonesa longeva, pacífica y doméstica',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Pellets flotantes para Koi según temperatura', 'Revisar cascada, bomba y filtro biológico', 'Retirar hojas caídas del estanque', 'Observación de escamas y nado'],
  },
  {
    name: 'Pez Guppy / Molly / Platy',
    category: 'Otros',
    desc: 'Peces vivíparos pacíficos, coloridos e ideales para acuario comunitario',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Escamas finas y espirulina en poca cantidad', 'Verificar temperatura (24-26 °C)', 'Revisar plantas naturales y filtro', 'Cambio parcial de agua declorada'],
  },
  {
    name: 'Pez Ángel (Escalar) / Disco',
    category: 'Otros',
    desc: 'Cíclidos amazónicos majestuosos para acuarios plantados altos',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Gránulos de alta calidad para cíclidos', 'Vigilar temperatura estable (27-29 °C)', 'Verificar pH ligeramente ácido y filtro', 'Sifoneo suave del sustrato'],
  },
  {
    name: 'Camarón Neocaridina (Gambario)',
    category: 'Otros',
    desc: 'Invertebrado dulceacuícola pacífico que limpia algas y musgos',
    bg: 'bg-teal-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Verificar filtro de esponja seguro', 'Revisar hojas de almendro indio y musgo', 'Micro-alimento cálcico 2-3 veces por semana', 'Cero fertilizantes con cobre'],
  },
  {
    name: 'Tarántula de Criadero (UMA Certificada)',
    category: 'Otros',
    desc: 'Arácnido longevo reproducido legalmente en UMA para conservación',
    bg: 'bg-stone-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80',
    suggestedTasks: ['Mantener tapón de agua limpia siempre lleno', 'Verificar humedad moderada del sustrato', 'No manipular (evita caídas fatales)', 'Alimentación espaciada y retiro de restos'],
  },
];

export const razasSemilla: RazaSemilla[] = [
  ...CATALOGO_100_PERROS.map(([name, desc, imgKey, tareasKey]): RazaSemilla => ({
    name,
    category: 'Perros',
    desc,
    img: IMG_PERRO[imgKey],
    bg: 'bg-green-50',
    suggestedTasks: TAREAS_PERRO[tareasKey],
  })),
  ...CATALOGO_100_GATOS.map(([name, desc, imgKey, tareasKey]): RazaSemilla => ({
    name,
    category: 'Gatos',
    desc,
    img: IMG_GATO[imgKey],
    bg: 'bg-green-50',
    suggestedTasks: TAREAS_GATO[tareasKey],
  })),
  ...CATALOGO_OTROS_ANIMALES,
];

export const tipsSemilla: TipSemilla[] = [
  {
    title: 'Rutina de ejercicio diario',
    desc: 'Ideal para su raza, edad y nivel de energía',
    detail:
      'Dedica entre 30 y 60 minutos diarios a paseos o juegos activos según la especie, edad y raza de tu mascota para prevenir obesidad y ansiedad.',
    species: 'Todos',
    iconType: 'footprints',
  },
  {
    title: 'Cuidado y cepillado del pelaje',
    desc: 'Mantén su manto sano, limpio y libre de nudos',
    detail:
      'Cepilla de 2 a 3 veces por semana en razas de pelo corto y diariamente en razas de pelo largo o doble capa para retirar pelo muerto.',
    species: 'Todos',
    iconType: 'sparkles',
  },
  {
    title: 'Salud dental e higiene preventiva',
    desc: 'Previene acumulación de sarro e infecciones periodontales',
    detail:
      'Revisa encías, dientes y orejas cada semana. El cepillado dental canino/felino reduce bacterias que pueden afectar corazón y riñones.',
    species: 'Todos',
    iconType: 'heart',
  },
  {
    title: 'Hidratación constante y limpia',
    desc: 'Agua fresca disponible las 24 horas del día',
    detail:
      'Lava el plato, bebedero o abrevadero diariamente y renueva el agua al menos dos veces al día, especialmente en temporada de calor.',
    species: 'Todos',
    iconType: 'heart',
  },
  {
    title: 'Calendario de vacunación y desparasitación',
    desc: 'Protección preventiva anual y semestral',
    detail:
      'Registra en el expediente médico digital de Planeta Huella cada vacuna, refuerzo y desparasitación interna o externa.',
    species: 'Todos',
    iconType: 'heart',
  },
  {
    title: 'Identificación y placa de contacto',
    desc: 'Seguridad ante extravíos fuera de casa o rancho',
    detail:
      'Asegúrate de que tu mascota porte collar o arnés con placa actualizada y mantén su fotografía reciente en su perfil de Planeta Huella.',
    species: 'Todos',
    iconType: 'footprints',
  },
  {
    title: 'Paseos seguros y socialización canina',
    desc: 'Estimulación olfativa y regla de los 5 segundos en asfalto',
    detail:
      'Permite que tu perro olfatee durante el paseo para relajar su mente. Coloca el dorso de tu mano 5 segundos en el pavimento antes de salir; si quema, espera a que baje el sol.',
    species: 'Perro',
    iconType: 'footprints',
  },
  {
    title: 'Cuidado de razas braquicéfalas',
    desc: 'Prevención de golpe de calor en Bulldog, Pug, Boxer y Shih Tzu',
    detail:
      'Los perros de hocico chato no regulan el calor con la misma rapidez: pasea en horarios frescos, limpia y seca sus pliegues faciales y usa arnés de pecho en lugar de collar.',
    species: 'Perro',
    iconType: 'heart',
  },
  {
    title: 'Protección de columna en Teckels y Corgis',
    desc: 'Prevención de hernia discal en perros de espalda larga',
    detail:
      'Evita que suban o salten desde camas y sillones altos, utiliza rampas de apoyo y mantén su peso ideal para no sobrecargar sus vértebras.',
    species: 'Perro',
    iconType: 'heart',
  },
  {
    title: 'Estimulación mental en perros de pastor y trabajo',
    desc: 'Bienestar para Border Collie, Pastor Alemán, Malinois y Husky',
    detail:
      'Combina el ejercicio físico con juegos de olfato, alfombras olfativas y comandos de obediencia para canalizar su inteligencia positivamente.',
    species: 'Perro',
    iconType: 'footprints',
  },
  {
    title: 'Cuidado dérmico en Xoloitzcuintle y razas sin pelo',
    desc: 'Hidratación de piel y protección solar',
    detail:
      'Hidrata su piel con cremas neutras hipoalergénicas, protégelos del sol directo y abrígalos en noches frías.',
    species: 'Perro',
    iconType: 'sparkles',
  },
  {
    title: 'Enriquecimiento ambiental felino',
    desc: 'Rascadores verticales, alturas y circuito de caza',
    detail:
      'Los gatos domésticos necesitan rascadores estables, repisas elevadas para observar su territorio y sesiones diarias de juego con caña.',
    species: 'Gato',
    iconType: 'sparkles',
  },
  {
    title: 'Higiene óptima del arenero (Regla N+1)',
    desc: 'Bienestar y prevención de cistitis por estrés en gatos',
    detail:
      'Se recomienda tener un arenero por cada gato más uno adicional, retirar desechos a diario y ubicarlos lejos de su agua y comida.',
    species: 'Gato',
    iconType: 'sparkles',
  },
  {
    title: 'Hidratación felina y salud renal',
    desc: 'Uso de fuentes de agua y alimento húmedo',
    detail:
      'Los gatos suelen beber poca agua quieta; una fuente de agua en movimiento y porciones de alimento húmedo protegen sus riñones y vías urinarias.',
    species: 'Gato',
    iconType: 'heart',
  },
  {
    title: 'Desgaste dental natural con heno',
    desc: 'Indispensable para conejos, cuyos, chinchillas y degús',
    detail:
      'Sus dientes crecen continuamente toda su vida. El heno fresco de gramíneas debe representar el 80% de su alimentación diaria.',
    species: 'Conejo',
    iconType: 'heart',
  },
  {
    title: 'Vitamina C diaria en cobayas (cuyos)',
    desc: 'Nutriente esencial que su organismo no puede producir',
    detail:
      'Incluye diariamente pimiento morrón fresco y hojas verdes seguras para prevenir escorbuto y fortalecer sus articulaciones.',
    species: 'Conejo',
    iconType: 'heart',
  },
  {
    title: 'Cuidado de jaula, perchas e iluminación en aves',
    desc: 'Ambiente limpio, seguro y libre de vapores tóxicos',
    detail:
      'Ubica a tus aves lejos de corrientes de aire y nunca uses sartenes con teflón sobrecalentado cerca de ellas, ya que sus vapores son letales para las aves.',
    species: 'Ave',
    iconType: 'sparkles',
  },
  {
    title: 'Hábitat seguro para hámsters y erizos',
    desc: 'Rueda sólida sin barrotes y sustrato libre de polvo',
    detail:
      'Utiliza ruedas de superficie continua para evitar fracturas en sus patas y sustrato de papel prensado en lugar de viruta de pino o cedro.',
    species: 'Otro',
    iconType: 'footprints',
  },
  {
    title: 'Ética y Legal Procedencia en Animales Exóticos (SEMARNAT)',
    desc: 'Adquisición responsable únicamente en UMA o PIMVS certificados',
    detail:
      'Jamás adquieras fauna silvestre extraída de su hábitat. En México, todo ejemplar exótico legal requiere nota o factura con registro UMA/PIMVS y trámite SEMARNAT-08-056.',
    species: 'Otro',
    iconType: 'heart',
  },
  {
    title: 'No liberación de especies exóticas al medio silvestre',
    desc: 'Protección de ecosistemas locales y biodiversidad',
    detail:
      'Nunca liberes tortugas de orejas rojas, peces de acuario, aves o reptiles exóticos en ríos o parques, ya que desplazan a la fauna nativa o no sobreviven.',
    species: 'Otro',
    iconType: 'footprints',
  },
  {
    title: 'Radiación UVB y gradiente térmico en reptiles',
    desc: 'Salud ósea y digestiva en tortugas, dragones barbudos y camaleones',
    detail:
      'Los reptiles son ectotermos: necesitan una zona cálida y otra fresca reguladas por termostato, además de luz UVB para metabolizar el calcio.',
    species: 'Otro',
    iconType: 'sparkles',
  },
  {
    title: 'Calidad del agua y ciclado en acuarios y ajolotes',
    desc: 'Equilibrio biológico libre de cloro y amoniaco',
    detail:
      'Realiza cambios parciales del 20% semanalmente con acondicionador anticloro. Para ajolotes, mantén el agua fría (15-18 °C) y sin grava pequeña.',
    species: 'Otro',
    iconType: 'sparkles',
  },
  {
    title: 'Bienestar y bioseguridad en animales de granja y traspatio',
    desc: 'Las 5 Libertades del Bienestar Animal (SADER / SENASICA)',
    detail:
      'Garantiza sombra, agua limpia constante, cama seca, control de parásitos, calendario de vacunación pecuaria y espacio suficiente para su conducta natural.',
    species: 'Otro',
    iconType: 'heart',
  },
  {
    title: 'Cuidado de cascos y pezuñas en equinos y rumiantes',
    desc: 'Prevención de laminitis y pododermatitis en caballos, cabras y ovejas',
    detail:
      'Limpia diariamente los cascos de los caballos, mantén los corrales libres de lodo estancado y programa recorte preventivo con el herrador o veterinario.',
    species: 'Otro',
    iconType: 'footprints',
  },
];

let promesaSemillaEnCurso: Promise<void> | null = null;

// Inicializa y sincroniza todas las razas y recomendaciones de forma idempotente (bulkWrite + upsert)
export const sembrarCatalogoInicial = async (): Promise<void> => {
  if (promesaSemillaEnCurso) {
    return promesaSemillaEnCurso;
  }

  promesaSemillaEnCurso = (async () => {
    try {
      await Breed.collection.dropIndex('slug_1').catch(() => {});
      await Tip.collection.dropIndex('slug_1').catch(() => {});

      const [totalRazas, totalTips] = await Promise.all([
        Breed.countDocuments(),
        Tip.countDocuments(),
      ]);

      if (totalRazas < razasSemilla.length) {
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

      if (totalTips < tipsSemilla.length) {
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
