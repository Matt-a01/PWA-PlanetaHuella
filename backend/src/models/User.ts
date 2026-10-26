import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // El rol por defecto es 'user'. Solo se asigna 'admin' directamente desde MongoDB Atlas
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Permite también agregar un segundo rol en un arreglo ['user', 'admin'] desde la base de datos
    roles: { type: [String], default: ['user'] },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
