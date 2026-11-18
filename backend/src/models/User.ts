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

    // Proveedor de autenticación ('local', 'google' o 'apple')
    authProvider: {
      type: String,
      enum: ['local', 'google', 'apple'],
      default: 'local',
    },
    googleId: { type: String, default: null },
    appleId: { type: String, default: null },

    // Verificación de correo electrónico mediante código OTP de 6 dígitos (HMAC-SHA256)
    emailVerified: { type: Boolean, default: false },
    verificationCodeHash: { type: String, default: null },
    verificationCodeExpiresAt: { type: Date, default: null },
    verificationAttempts: { type: Number, default: 0 },

    // Recuperación de contraseña mediante código OTP de 6 dígitos (HMAC-SHA256)
    resetPasswordCodeHash: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    resetPasswordAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
