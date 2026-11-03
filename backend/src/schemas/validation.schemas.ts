import { z } from 'zod';

// Elimina caracteres de control invisibles y espacios extremos evitando inyección de objetos NoSQL
const limpiarTexto = (valor: string): string =>
  // eslint-disable-next-line no-control-regex
  valor.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

const textoSaneado = (campo: string, minLen: number, maxLen: number) =>
  z
    .string({ error: `El campo ${campo} debe ser texto válido.` })
    .transform(limpiarTexto)
    .pipe(
      z
        .string()
        .min(minLen, minLen === 1 ? `El campo ${campo} es obligatorio.` : `El campo ${campo} debe tener al menos ${minLen} caracteres.`)
        .max(maxLen, `El campo ${campo} no puede exceder ${maxLen} caracteres.`)
    );

const textoOpcionalSaneado = (campo: string, maxLen: number) =>
  z
    .string({ error: `El campo ${campo} debe ser texto válido.` })
    .transform(limpiarTexto)
    .pipe(z.string().max(maxLen, `El campo ${campo} no puede exceder ${maxLen} caracteres.`));

// Permite cadena vacía, URL HTTP(S) o Data URI de imagen Base64 (bloquea javascript: o payloads XSS)
const imagenSeguraSchema = z
  .string({ error: 'El formato de la imagen no es válido.' })
  .trim()
  .max(2_000_000, 'La imagen supera el tamaño máximo permitido.')
  .refine(
    (val) =>
      val === '' ||
      /^https?:\/\/.+/i.test(val) ||
      /^data:image\/(jpeg|jpg|png|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/i.test(val),
    'La imagen debe ser una URL válida o una imagen codificada en Base64.'
  );

// Valida estrictamente un ObjectId hexadecimal de 24 caracteres
export const objectIdSchema = z
  .string({ error: 'El identificador es obligatorio.' })
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'El identificador proporcionado no es válido.');

// Edad numérica segura entre 0 y 50 años (rechaza objetos/arreglos para evitar inyección NoSQL)
const edadMascotaSchema = z
  .union([
    z.number({ error: 'La edad debe ser un valor numérico.' }),
    z
      .string({ error: 'La edad debe ser un valor numérico.' })
      .trim()
      .min(1, 'La edad de la mascota es obligatoria.'),
  ])
  .transform((val) => (typeof val === 'number' ? val : Number(val)))
  .pipe(
    z
      .number({ error: 'La edad debe ser un número válido.' })
      .finite('La edad debe ser un número válido.')
      .min(0, 'La edad de la mascota no puede ser menor a 0 años.')
      .max(50, 'La edad de la mascota no puede superar los 50 años.')
  );

// ==================== AUTENTICACIÓN ====================

export const registerSchema = z.object({
  fullName: textoSaneado('nombre completo', 2, 100),
  email: z
    .string({ error: 'El correo electrónico es obligatorio.' })
    .trim()
    .toLowerCase()
    .email('Ingresa un correo electrónico válido.')
    .max(160, 'El correo electrónico no puede superar 160 caracteres.'),
  password: z
    .string({ error: 'La contraseña es obligatoria.' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .max(128, 'La contraseña no puede superar 128 caracteres.'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'El correo electrónico es obligatorio.' })
    .trim()
    .toLowerCase()
    .email('Ingresa un correo electrónico válido.')
    .max(160, 'El correo electrónico no puede superar 160 caracteres.'),
  password: z
    .string({ error: 'Por favor ingresa tu contraseña.' })
    .min(1, 'Por favor ingresa tu correo y contraseña.')
    .max(128, 'Contraseña inválida.'),
});

// ==================== MASCOTAS ====================

export const createPetSchema = z.object({
  name: textoSaneado('nombre', 1, 80),
  species: textoSaneado('especie', 1, 40),
  breed: textoSaneado('raza', 1, 80),
  age: edadMascotaSchema,
  gender: textoSaneado('sexo', 1, 30),
  characteristics: textoOpcionalSaneado('indicaciones', 600).optional().default(''),
  imageUrl: imagenSeguraSchema.optional().default(''),
  customTasks: z
    .array(textoSaneado('tarea personalizada', 1, 140))
    .max(25, 'No se pueden asignar más de 25 tareas iniciales.')
    .optional(),
});

export const updatePetSchema = z
  .object({
    name: textoSaneado('nombre', 1, 80).optional(),
    species: textoSaneado('especie', 1, 40).optional(),
    breed: textoSaneado('raza', 1, 80).optional(),
    age: edadMascotaSchema.optional(),
    gender: textoSaneado('sexo', 1, 30).optional(),
    characteristics: textoOpcionalSaneado('indicaciones', 600).optional(),
    imageUrl: imagenSeguraSchema.optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Debes proporcionar al menos un dato para actualizar la mascota.',
  });

// ==================== TAREAS ====================

export const createTaskSchema = z.object({
  title: textoSaneado('título de la tarea', 1, 140),
  petId: objectIdSchema,
  iconType: textoOpcionalSaneado('icono', 40).optional(),
});

// ==================== HISTORIAL MÉDICO ====================

export const createMedicalRecordSchema = z.object({
  type: textoSaneado('tipo de control médico', 1, 100),
  date: z
    .string({ error: 'La fecha del registro médico es obligatoria.' })
    .trim()
    .min(1, 'La fecha del registro médico es obligatoria.')
    .refine((val) => !Number.isNaN(Date.parse(val)), 'La fecha proporcionada no es válida.'),
  notes: textoOpcionalSaneado('notas médicas', 600).optional().default(''),
  petId: objectIdSchema,
});

// ==================== CATÁLOGO (RAZAS Y TIPS) ====================

export const breedCategorySchema = z.enum(['Perros', 'Gatos', 'Otros'], {
  error: 'La categoría debe ser Perros, Gatos u Otros.',
});

export const createBreedSchema = z.object({
  name: textoSaneado('nombre de la raza', 1, 80),
  category: breedCategorySchema,
  desc: textoSaneado('descripción', 1, 400),
  img: imagenSeguraSchema.optional().default(''),
  bg: textoOpcionalSaneado('color de fondo', 60).optional().default('bg-green-50'),
  suggestedTasks: z
    .array(textoSaneado('tarea sugerida', 1, 140))
    .max(25, 'Máximo 25 tareas sugeridas por raza.')
    .optional(),
});

export const updateBreedSchema = z
  .object({
    name: textoSaneado('nombre de la raza', 1, 80).optional(),
    category: breedCategorySchema.optional(),
    desc: textoSaneado('descripción', 1, 400).optional(),
    img: imagenSeguraSchema.optional(),
    bg: textoOpcionalSaneado('color de fondo', 60).optional(),
    suggestedTasks: z
      .array(textoSaneado('tarea sugerida', 1, 140))
      .max(25, 'Máximo 25 tareas sugeridas por raza.')
      .optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar la raza.',
  });

export const createTipSchema = z.object({
  title: textoSaneado('título de la recomendación', 1, 120),
  desc: textoSaneado('descripción breve', 1, 300),
  detail: textoOpcionalSaneado('detalle', 1500).optional(),
  species: textoSaneado('especie', 1, 50).optional().default('Todos'),
  iconType: textoSaneado('icono', 1, 40).optional().default('footprints'),
});

export const updateTipSchema = z
  .object({
    title: textoSaneado('título de la recomendación', 1, 120).optional(),
    desc: textoSaneado('descripción breve', 1, 300).optional(),
    detail: textoOpcionalSaneado('detalle', 1500).optional(),
    species: textoSaneado('especie', 1, 50).optional(),
    iconType: textoSaneado('icono', 1, 40).optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar la recomendación.',
  });
