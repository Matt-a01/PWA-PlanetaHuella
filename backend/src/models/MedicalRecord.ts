import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    date: { type: Date, required: true },
    notes: { type: String },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  },
  { timestamps: true }
);

// Índice compuesto para obtener el historial clínico por mascota ordenado del más reciente al más antiguo
medicalRecordSchema.index({ petId: 1, date: -1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
