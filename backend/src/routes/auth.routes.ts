// backend/src/routes/auth.routes.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_planeta_huella';

// POST /api/auth/register - Registrar un nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios.' });
            return;
        }

        // Verificar si el correo ya existe
        const usuarioExistente = await User.findOne({ email: email.toLowerCase().trim() });
        if (usuarioExistente) {
            res.status(400).json({ ok: false, error: 'Este correo ya está registrado.' });
            return;
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario en MongoDB
        const nuevoUsuario = await User.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        // Generar token JWT básico
        const token = jwt.sign({ id: nuevoUsuario._id, email: nuevoUsuario.email }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(201).json({
            ok: true,
            message: 'Usuario registrado correctamente',
            user: {
                id: nuevoUsuario._id,
                fullName: nuevoUsuario.fullName,
                email: nuevoUsuario.email
            },
            token
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ ok: false, error: 'Error al registrar el usuario.' });
    }
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ ok: false, error: 'Ingresa tu correo y contraseña.' });
            return;
        }

        const usuario = await User.findOne({ email: email.toLowerCase().trim() });
        if (!usuario) {
            res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });
            return;
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });
            return;
        }

        const token = jwt.sign({ id: usuario._id, email: usuario.email }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({
            ok: true,
            message: 'Inicio de sesión exitoso',
            user: {
                id: usuario._id,
                fullName: usuario.fullName,
                email: usuario.email
            },
            token
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ ok: false, error: 'Error al iniciar sesión.' });
    }
});

export default router;
