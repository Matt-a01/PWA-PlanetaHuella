// backend/src/models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { 
  timestamps: true // Esto agrega automáticamente 'createdAt' y 'updatedAt'
});

export default mongoose.model('User', userSchema);