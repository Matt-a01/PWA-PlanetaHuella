import mongoose from 'mongoose';

// Esquema para almacenar razas de perros, gatos y otros animales en MongoDB
const breedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ['Perros', 'Gatos', 'Otros'], default: 'Perros' },
    desc: { type: String, default: '' },
    img: { type: String, default: '' },
    bg: { type: String, default: 'bg-green-50' },
    // Tareas predeterminadas sugeridas según las características de esta raza o especie
    suggestedTasks: { type: [String], default: [] },
    // Campos opcionales de compatibilidad con documentos previos en la colección
    species: { type: String },
    description: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Esquema para almacenar tips y recomendaciones en MongoDB
const tipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    detail: { type: String, default: '' },
    species: { type: String, default: 'Todos' },
    iconType: { type: String, default: 'footprints' },
    // Campos opcionales de compatibilidad
    summary: { type: String },
    content: { type: String },
  },
  { timestamps: true }
);

export const Breed = mongoose.model('Breed', breedSchema);
export const Tip = mongoose.model('Tip', tipSchema);

