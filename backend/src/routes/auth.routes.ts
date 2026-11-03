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
  objectIdSchema,
} from '../schemas/validation.schemas.js';

const router = express.Router();

const firmarToken = (userId: string, email: string, role: 'user' | 'admin'): string =>
  jwt.sign({ id: userId, email, role }, env.JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });

// POST /api/auth/register - Toda cuenta nueva se registra como 'user'; el rol 'admin' solo se otorga en BD
router.post(
  '/register',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fullName, email, password } = registerSchema.parse(req.body);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          ok: false,
          error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: 'user',
        roles: ['user'],
      });

      const rolActual = obtenerRolUsuario(newUser);
      const token = firmarToken(String(newUser._id), newUser.email, rolActual);

      res.status(201).json({
        ok: true,
        message: '¡Usuario registrado exitosamente!',
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: rolActual,
          roles: obtenerArregloRoles(newUser),
          createdAt: newUser.createdAt,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login - Autentica al usuario y consulta su rol directamente desde MongoDB Atlas
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

      const rolActual = obtenerRolUsuario(user);
      const token = firmarToken(String(user._id), user.email, rolActual);

      res.status(200).json({
        ok: true,
        message: '¡Bienvenido de vuelta!',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: rolActual,
          roles: obtenerArregloRoles(user),
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
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

      const rolActual = obtenerRolUsuario(user);

      res.status(200).json({
        ok: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: rolActual,
          roles: obtenerArregloRoles(user),
          createdAt: user.createdAt,
        },
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
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: rolActual,
          roles: obtenerArregloRoles(user),
          createdAt: user.createdAt,
        },
        token: nuevoTokenFirmado,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
