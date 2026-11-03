import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

interface HttpLikeError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  code?: number;
}

// Manejador centralizado de errores sin filtrar trazas internas (stack traces) en producción
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Errores de validación de esquemas Zod
  if (err instanceof ZodError) {
    const primerMensaje = err.issues[0]?.message ?? 'Datos de entrada inválidos.';
    res.status(400).json({
      ok: false,
      error: primerMensaje,
      details: err.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      })),
    });
    return;
  }

  // 2. Identificadores ObjectId malformados en consultas Mongoose
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      ok: false,
      error: 'El identificador del recurso no tiene un formato válido.',
    });
    return;
  }

  const httpErr = err as HttpLikeError | undefined;

  // 3. Payload superior al límite configurado en express.json
  if (httpErr?.type === 'entity.too.large' || httpErr?.status === 413) {
    res.status(413).json({
      ok: false,
      error: 'El tamaño de la petición supera el límite máximo permitido de 2 MB.',
    });
    return;
  }

  // 4. JSON malformado en el cuerpo de la petición
  if (err instanceof SyntaxError && httpErr?.status === 400) {
    res.status(400).json({
      ok: false,
      error: 'El formato JSON enviado en la petición es inválido.',
    });
    return;
  }

  // 5. Bloqueo explícito de política CORS
  if (err instanceof Error && err.message === 'Origen no permitido por la política CORS.') {
    res.status(403).json({
      ok: false,
      error: err.message,
    });
    return;
  }

  // 6. Clave duplicada en índices únicos de MongoDB
  if (httpErr?.code === 11000) {
    res.status(409).json({
      ok: false,
      error: 'Ya existe un registro con los mismos datos únicos.',
    });
    return;
  }

  // 7. Errores inesperados (500) sin exponer stack traces al cliente
  if (env.NODE_ENV !== 'test') {
    console.error(
      'Error interno no controlado:',
      env.NODE_ENV === 'production'
        ? err instanceof Error
          ? err.message
          : 'Error desconocido'
        : err
    );
  }

  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor.',
  });
};
