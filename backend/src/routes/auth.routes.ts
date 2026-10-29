import express, { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_planeta_huella_2026';

// Verifica si el documento en MongoDB tiene configurado el rol 'admin' (en 'role' o dentro de 'roles')
const obtenerRolDesdeBD = (userDoc: { role?: string; roles?: string[] }): 'user' | 'admin' => {
  const rolTexto = String(userDoc.role || '').toLowerCase();
  const tieneAdminEnRoles =
    Array.isArray(userDoc.roles) &&
    userDoc.roles.some((r) => String(r).toLowerCase().includes('admin'));

  if (rolTexto.includes('admin') || tieneAdminEnRoles) {
    return 'admin';
  }
  return 'user';
};

// Limpia el arreglo de roles en caso de que haya sido editado manualmente con comillas en MongoDB Atlas
const obtenerRolesLimpios = (userDoc: { role?: string; roles?: string[] }): string[] => {
  const rolPrincipal = obtenerRolDesdeBD(userDoc);
  if (rolPrincipal === 'admin') {
    return ['user', 'admin'];
  }
  return ['user'];
};

// POST /api/auth/register - Toda cuenta nueva se registra como 'user'; el rol 'admin' solo se otorga en BD
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({
        ok: false,
        error: 'Todos los campos son obligatorios (nombre, correo y contraseña).',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        ok: false,
        error: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

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
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      roles: ['user'],
    });

    const rolActual = obtenerRolDesdeBD(newUser);

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: rolActual },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      ok: true,
      message: '¡Usuario registrado exitosamente!',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: rolActual,
        roles: newUser.roles,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor al procesar el registro.',
    });
  }
});

// POST /api/auth/login - Autentica al usuario y consulta su rol directamente desde MongoDB Atlas
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        ok: false,
        error: 'Por favor ingresa tu correo y contraseña.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

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

    const rolActual = obtenerRolDesdeBD(user);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: rolActual },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      ok: true,
      message: '¡Bienvenido de vuelta!',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: rolActual,
        roles: obtenerRolesLimpios(user),
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      ok: false,
      error: 'Error interno del servidor al procesar el inicio de sesión.',
    });
  }
});

// GET /api/auth/user/:id - Consulta en tiempo real el rol del usuario en MongoDB por ID o correo
router.get('/user/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const emailQuery = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';

    let user = null;
    if (id && !id.startsWith('usr_') && id.length === 24) {
      user = await User.findById(id).select('-password');
    }
    if (!user && emailQuery) {
      user = await User.findOne({ email: emailQuery }).select('-password');
    }

    if (!user) {
      res.status(404).json({ ok: false, error: 'Usuario no encontrado.' });
      return;
    }

    const rolActual = obtenerRolDesdeBD(user);

    res.status(200).json({
      ok: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: rolActual,
        roles: obtenerRolesLimpios(user),
        createdAt: user.createdAt,
      },
    });
  } catch {
    res.status(400).json({ ok: false, error: 'No se pudo consultar el usuario.' });
  }
});

// GET /api/auth/me - Validación del token JWT y sincronización del rol actual desde MongoDB
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ ok: false, error: 'Token no proporcionado.' });
      return;
    }

    const token = authHeader.split(' ')[1] || '';
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(404).json({ ok: false, error: 'Usuario no encontrado.' });
      return;
    }

    const rolActual = obtenerRolDesdeBD(user);

    res.status(200).json({
      ok: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: rolActual,
        roles: obtenerRolesLimpios(user),
        createdAt: user.createdAt,
      },
    });
  } catch {
    res.status(401).json({ ok: false, error: 'Token inválido o expirado.' });
  }
});

export default router;
