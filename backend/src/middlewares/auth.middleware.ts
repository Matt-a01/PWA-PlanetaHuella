import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

// Normaliza un valor de rol removiendo espacios o comillas residuales sin permitir coincidencias parciales
const normalizarTextoRol = (valor: unknown): string =>
  String(valor ?? '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim()
    .toLowerCase();

// Comparación estricta de rol 'admin' compatible con role: 'admin' o 'admin' dentro de roles: string[]
export const obtenerRolUsuario = (userDoc: {
  role?: string | null;
  roles?: string[] | null;
}): 'user' | 'admin' => {
  const esAdminDirecto = normalizarTextoRol(userDoc.role) === 'admin';
  const esAdminEnArreglo =
    Array.isArray(userDoc.roles) &&
    userDoc.roles.some((rol) => normalizarTextoRol(rol) === 'admin');

  return esAdminDirecto || esAdminEnArreglo ? 'admin' : 'user';
};

export const obtenerArregloRoles = (userDoc: {
  role?: string | null;
  roles?: string[] | null;
}): string[] => {
  return obtenerRolUsuario(userDoc) === 'admin' ? ['user', 'admin'] : ['user'];
};

// Verifica el token Bearer JWT y adjunta la identidad autenticada en req.user
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      ok: false,
      error: 'No autorizado. Inicia sesión nuevamente.',
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({
      ok: false,
      error: 'No autorizado. Inicia sesión nuevamente.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.id !== 'string' ||
      !mongoose.isValidObjectId(decoded.id) ||
      typeof decoded.email !== 'string'
    ) {
      res.status(401).json({
        ok: false,
        error: 'No autorizado. Inicia sesión nuevamente.',
      });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role === 'admin' ? 'admin' : 'user',
    };

    next();
  } catch {
    res.status(401).json({
      ok: false,
      error: 'No autorizado. Inicia sesión nuevamente.',
    });
  }
};

// Verifica en tiempo real contra MongoDB que el usuario autenticado posea privilegios de administrador
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        ok: false,
        error: 'No autorizado. Inicia sesión nuevamente.',
      });
      return;
    }

    const usuarioBD = await User.findById(req.user.id).select('email role roles').lean();
    if (!usuarioBD) {
      res.status(401).json({
        ok: false,
        error: 'No autorizado. Inicia sesión nuevamente.',
      });
      return;
    }

    const rolActual = obtenerRolUsuario(usuarioBD);
    if (rolActual !== 'admin') {
      res.status(403).json({
        ok: false,
        error: 'Acceso restringido a administradores.',
      });
      return;
    }

    req.user.role = 'admin';
    next();
  } catch (error) {
    next(error);
  }
};
