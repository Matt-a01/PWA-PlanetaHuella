import mongoose from 'mongoose';

// Esquema para almacenar razas de perros, gatos y otros animales en MongoDB
const breedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ['Perros', 'Gatos', 'Otros'], required: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    bg: { type: String, default: 'bg-green-50' },
    // Tareas predeterminadas sugeridas según las características de esta raza o especie
    suggestedTasks: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Esquema para almacenar tips y recomendaciones en MongoDB
const tipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    detail: { type: String, default: '' },
    species: { type: String, default: 'Todos' },
    iconType: { type: String, default: 'footprints' },
  },
  { timestamps: true }
);

export const Breed = mongoose.model('Breed', breedSchema);
export const Tip = mongoose.model('Tip', tipSchema);
