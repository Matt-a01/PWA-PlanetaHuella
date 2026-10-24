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

export default mongoose.model('MedicalRecord', medicalRecordSchema);
