import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    iconType: { type: String, required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
