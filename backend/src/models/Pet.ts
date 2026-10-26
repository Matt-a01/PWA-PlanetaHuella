import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    characteristics: { type: String, default: '' },
    imageUrl: { type: String },
    // Relación con el usuario propietario para aislar las mascotas, tareas e imágenes por cuenta
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Pet', petSchema);
