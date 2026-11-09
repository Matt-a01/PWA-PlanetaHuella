import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    // Fecha ISO (YYYY-MM-DD) de la última vez que se completó para reinicio diario automático
    lastCompletedDate: { type: String, default: null },
    iconType: { type: String, required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  },
  { timestamps: true }
);

// Índice por mascota para acelerar consultas y borrados en cascada de rutinas diarias
taskSchema.index({ petId: 1 });

export default mongoose.model('Task', taskSchema);
