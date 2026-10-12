// backend/src/models/Pet.ts
import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Ej. Luna
    species: { type: String, required: true }, // Ej. Perro
    breed: { type: String, required: true }, // Ej. Golden Retriever
    age: { type: Number, required: true },
    gender: { type: String, required: true }, // Macho, Hembra
    imageUrl: { type: String }, 
  // Relacionamos la mascota con un usuario específico
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Pet', petSchema);