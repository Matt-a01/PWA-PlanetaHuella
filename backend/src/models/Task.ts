// backend/src/models/Task.ts
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Ej. "Dar comida"
    isCompleted: { type: Boolean, default: false },
    iconType: { type: String, required: true }, // Ej. "bone" o "droplet"
    // Relacionamos la tarea con una mascota en específico
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);