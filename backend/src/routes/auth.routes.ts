import crypto from 'node:crypto';
import express, { type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import {
  requireAuth,
  obtenerRolUsuario,
  obtenerArregloRoles,
} from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  oauthLoginSchema,
  objectIdSchema,
} from '../schemas/validation.schemas.js';
import {
  generarCodigoOTP,
  hashearCodigoOTP,
  verificarCodigoOTP,
  enviarCorreoVerificacion,
  enviarCorreoRecuperacion,
  enviarCorreoConfirmacionContrasena,
  TIEMPO_EXPIRACION_OTP_MS,
  MAX_INTENTOS_OTP,
} from '../services/email.service.js';
import { verificarTokenGoogle } from '../services/oauth.service.js';

const router = express.Router();

const firmarToken = (userId: string, email: string, role: 'user' | 'admin'): string =>
  jwt.sign({ id: userId, email, role }, env.JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });

const serializarUsuario = (user: {
  _id: unknown;
  fullName: string;
  email: string;
  role?: string | null;
  roles?: string[] | null;
  authProvider?: string | null;
  emailVerified?: boolean | null;
  createdAt?: Date | string | null;
}) => {
  const rolActual = obtenerRolUsuario(user);
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: rolActual,
    roles: obtenerArregloRoles(user),
    authProvider: user.authProvider || 'local',
    emailVerified: Boolean(user.emailVerified ?? true),
    createdAt: user.createdAt,
  };
};

// POST /api/auth/register - Registra cuenta como 'user' y envía código OTP de 6 dígitos al correo
router.post(
  '/register',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fullName, email, password } = registerSchema.parse(req.body);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Si la cuenta ya existía pero nunca verificó su correo, actualiza datos y reenvía OTP real
        if (!existingUser.emailVerified && existingUser.verificationCodeHash) {
          const salt = await bcrypt.genSalt(10);
          existingUser.fullName = fullName;
          existingUser.password = await bcrypt.hash(password, salt);

          const codigoOtp = generarCodigoOTP();
          existingUser.verificationCodeHash = hashearCodigoOTP(codigoOtp, email, 'verify');
          existingUser.verificationCodeExpiresAt = new Date(Date.now() + TIEMPO_EXPIRACION_OTP_MS);
          existingUser.verificationAttempts = 0;
          await existingUser.save();

          const envio = await enviarCorreoVerificacion(email, fullName, codigoOtp);

          res.status(200).json({
            ok: true,
            requiresVerification: true,
            email: existingUser.email,
            message:
              'Te hemos enviado un nuevo código de verificación de 6 dígitos a tu correo electrónico.',
            emailDelivery: {
              provider: envio.provider,
              sent: envio.sent,
            },
          });
          return;
        }

        res.status(409).json({
          ok: false,
          error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const codigoOtp = generarCodigoOTP();
      const codigoHash = hashearCodigoOTP(codigoOtp, email, 'verify');
      const expiraEn = new Date(Date.now() + TIEMPO_EXPIRACION_OTP_MS);

      const newUser = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: 'user',
        roles: ['user'],
        authProvider: 'local',
        emailVerified: false,
        verificationCodeHash: codigoHash,
        verificationCodeExpiresAt: expiraEn,
        verificationAttempts: 0,
      });

      const envio = await enviarCorreoVerificacion(newUser.email, newUser.fullName, codigoOtp);

      res.status(201).json({
        ok: true,
        requiresVerification: true,
        email: newUser.email,
        message:
          '¡Cuenta creada! Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.',
        emailDelivery: {
          provider: envio.provider,
          sent: envio.sent,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/verify-email - Verifica el código OTP de 6 dígitos y activa la sesión JWT
router.post(
  '/verify-email',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, code } = verifyEmailSchema.parse(req.body);

      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          ok: false,
          error: 'No encontramos ninguna cuenta asociada a este correo electrónico.',
        });
        return;
      }

      if (user.emailVerified && !user.verificationCodeHash) {
        const rolActual = obtenerRolUsuario(user);
        const token = firmarToken(String(user._id), user.email, rolActual);
        res.status(200).json({
          ok: true,
          message: 'Tu correo ya estaba verificado. ¡Bienvenido!',
          user: serializarUsuario(user),
          token,
        });
        return;
      }

      if ((user.verificationAttempts ?? 0) >= MAX_INTENTOS_OTP) {
        res.status(429).json({
          ok: false,
          error:
            'Has superado el límite de intentos para este código. Solicita el reenvío de un código nuevo.',
        });
        return;
      }

      if (
        !user.verificationCodeExpiresAt ||
        user.verificationCodeExpiresAt.getTime() < Date.now()
      ) {
        res.status(400).json({
          ok: false,
          error: 'El código de verificación ha expirado. Solicita uno nuevo.',
        });
        return;
      }

      const esValido = verificarCodigoOTP(code, email, 'verify', user.verificationCodeHash);
      if (!esValido) {
        user.verificationAttempts = (user.verificationAttempts ?? 0) + 1;
        await user.save();
        const restantes = Math.max(0, MAX_INTENTOS_OTP - user.verificationAttempts);
        res.status(400).json({
          ok: false,
          error: `Código incorrecto. Te quedan ${restantes} intento(s).`,
        });
        return;
      }

      user.emailVerified = true;
      user.verificationCodeHash = null;
      user.verificationCodeExpiresAt = null;
      user.verificationAttempts = 0;
      await user.save();

      const rolActual = obtenerRolUsuario(user);
      const token = firmarToken(String(user._id), user.email, rolActual);

      res.status(200).json({
        ok: true,
        message: '¡Correo electrónico verificado con éxito! Bienvenido a Planeta Huella.',
        user: serializarUsuario(user),
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/resend-verification - Reenvía un nuevo código OTP de 6 dígitos al correo
router.post(
  '/resend-verification',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = resendVerificationSchema.parse(req.body);

      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          ok: false,
          error: 'No existe una cuenta registrada con ese correo electrónico.',
        });
        return;
      }

      if (user.emailVerified && !user.verificationCodeHash) {
        res.status(400).json({
          ok: false,
          error: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión directamente.',
        });
        return;
      }

      const codigoOtp = generarCodigoOTP();
      user.verificationCodeHash = hashearCodigoOTP(codigoOtp, email, 'verify');
      user.verificationCodeExpiresAt = new Date(Date.now() + TIEMPO_EXPIRACION_OTP_MS);
      user.verificationAttempts = 0;
      await user.save();

      const envio = await enviarCorreoVerificacion(user.email, user.fullName, codigoOtp);

      res.status(200).json({
        ok: true,
        requiresVerification: true,
        email: user.email,
        message: 'Hemos enviado un nuevo código de 6 dígitos a tu correo electrónico.',
        emailDelivery: {
          provider: envio.provider,
          sent: envio.sent,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login - Autentica al usuario y verifica que su correo esté confirmado
router.post(
  '/login',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          ok: false,
          error: 'Credenciales inválidas. Correo o contraseña incorrectos.',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          ok: false,
          error: 'Credenciales inválidas. Correo o contraseña incorrectos.',
        });
        return;
      }

      // Si la cuenta tiene verificación pendiente, genera nuevo código y solicita confirmación
      if (user.emailVerified === false && user.verificationCodeHash) {
        const codigoOtp = generarCodigoOTP();
        user.verificationCodeHash = hashearCodigoOTP(codigoOtp, email, 'verify');
        user.verificationCodeExpiresAt = new Date(Date.now() + TIEMPO_EXPIRACION_OTP_MS);
        user.verificationAttempts = 0;
        await user.save();

        const envio = await enviarCorreoVerificacion(user.email, user.fullName, codigoOtp);

        res.status(200).json({
          ok: false,
          requiresVerification: true,
          email: user.email,
          error:
            'Tu cuenta aún no ha sido verificada. Te hemos enviado un código de 6 dígitos a tu correo.',
          emailDelivery: {
            provider: envio.provider,
            sent: envio.sent,
          },
        });
        return;
      }

      // Si era una cuenta histórica creada antes del sistema OTP, la marca como verificada
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }

      const rolActual = obtenerRolUsuario(user);
      const token = firmarToken(String(user._id), user.email, rolActual);

      res.status(200).json({
        ok: true,
        message: '¡Bienvenido de vuelta!',
        user: serializarUsuario(user),
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/forgot-password - Genera y envía código OTP de 6 dígitos para recuperar contraseña
router.post(
  '/forgot-password',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          ok: false,
          error: 'No encontramos ninguna cuenta registrada con ese correo electrónico.',
        });
        return;
      }

      const codigoOtp = generarCodigoOTP();
      user.resetPasswordCodeHash = hashearCodigoOTP(codigoOtp, email, 'reset');
      user.resetPasswordExpiresAt = new Date(Date.now() + TIEMPO_EXPIRACION_OTP_MS);
      user.resetPasswordAttempts = 0;
      await user.save();

      const envio = await enviarCorreoRecuperacion(user.email, user.fullName, codigoOtp);

      res.status(200).json({
        ok: true,
        email: user.email,
        message:
          'Te hemos enviado un código de 6 dígitos a tu correo para restablecer tu contraseña.',
        emailDelivery: {
          provider: envio.provider,
          sent: envio.sent,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/reset-password - Valida el código OTP de 6 dígitos y actualiza la contraseña
router.post(
  '/reset-password',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, code, newPassword } = resetPasswordSchema.parse(req.body);

      const user = await User.findOne({ email });
      if (!user || !user.resetPasswordCodeHash) {
        res.status(400).json({
          ok: false,
          error: 'No hay una solicitud de recuperación activa para este correo.',
        });
        return;
      }

      if ((user.resetPasswordAttempts ?? 0) >= MAX_INTENTOS_OTP) {
        res.status(429).json({
          ok: false,
          error:
            'Has superado el máximo de intentos permitidos. Solicita un nuevo código de recuperación.',
        });
        return;
      }

      if (
        !user.resetPasswordExpiresAt ||
        user.resetPasswordExpiresAt.getTime() < Date.now()
      ) {
        res.status(400).json({
          ok: false,
          error: 'El código de recuperación ha expirado. Solicita uno nuevo.',
        });
        return;
      }

      const esValido = verificarCodigoOTP(code, email, 'reset', user.resetPasswordCodeHash);
      if (!esValido) {
        user.resetPasswordAttempts = (user.resetPasswordAttempts ?? 0) + 1;
        await user.save();
        const restantes = Math.max(0, MAX_INTENTOS_OTP - user.resetPasswordAttempts);
        res.status(400).json({
          ok: false,
          error: `El código ingresado es incorrecto. Te quedan ${restantes} intento(s).`,
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.emailVerified = true;
      user.verificationCodeHash = null;
      user.verificationCodeExpiresAt = null;
      user.verificationAttempts = 0;
      user.resetPasswordCodeHash = null;
      user.resetPasswordExpiresAt = null;
      user.resetPasswordAttempts = 0;
      await user.save();

      await enviarCorreoConfirmacionContrasena(user.email, user.fullName);

      const rolActual = obtenerRolUsuario(user);
      const token = firmarToken(String(user._id), user.email, rolActual);

      res.status(200).json({
        ok: true,
        message: '¡Tu contraseña ha sido restablecida con éxito!',
        user: serializarUsuario(user),
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/oauth - Inicio de sesión y registro con cuenta oficial de Google
router.post(
  '/oauth',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken, accessToken } = oauthLoginSchema.parse(req.body);

      const perfil = await verificarTokenGoogle({
        idToken,
        accessToken,
      });

      let user = await User.findOne({ email: perfil.email });

      if (!user) {
        const claveAleatoria = crypto.randomBytes(32).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(claveAleatoria, salt);

        user = await User.create({
          fullName: perfil.fullName,
          email: perfil.email,
          password: hashedPassword,
          role: 'user',
          roles: ['user'],
          authProvider: 'google',
          googleId: perfil.providerUserId,
          emailVerified: true,
        });
      } else {
        if (!user.googleId) {
          user.googleId = perfil.providerUserId;
        }
        user.emailVerified = true;
        user.verificationCodeHash = null;
        user.verificationCodeExpiresAt = null;
        await user.save();
      }

      const rolActual = obtenerRolUsuario(user);
      const token = firmarToken(String(user._id), user.email, rolActual);

      res.status(200).json({
        ok: true,
        message: '¡Sesión iniciada con Google!',
        user: serializarUsuario(user),
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          ok: false,
          error: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/auth/user/:id - Protegida: solo accesible para el propio usuario autenticado o un administrador
router.get(
  '/user/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetId = objectIdSchema.parse(req.params.id);
      const solicitanteId = req.user!.id;

      if (solicitanteId !== targetId) {
        const solicitanteBD = await User.findById(solicitanteId).select('role roles').lean();
        if (!solicitanteBD || obtenerRolUsuario(solicitanteBD) !== 'admin') {
          res.status(403).json({
            ok: false,
            error: 'No tienes permiso para consultar los datos de otro usuario.',
          });
          return;
        }
      }

      const user = await User.findById(targetId).select('-password');
      if (!user) {
        res.status(404).json({ ok: false, error: 'Usuario no encontrado.' });
        return;
      }

      res.status(200).json({
        ok: true,
        user: serializarUsuario(user),
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me - Sincroniza el rol actual en MongoDB y emite un JWT actualizado
router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id).select('-password');
      if (!user) {
        res.status(404).json({ ok: false, error: 'Usuario no encontrado.' });
        return;
      }

      const rolActual = obtenerRolUsuario(user);
      const nuevoTokenFirmado = firmarToken(String(user._id), user.email, rolActual);

      res.status(200).json({
        ok: true,
        user: serializarUsuario(user),
        token: nuevoTokenFirmado,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
