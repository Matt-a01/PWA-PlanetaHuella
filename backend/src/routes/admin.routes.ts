import express, { type Request, type Response, type NextFunction } from 'express';
import User from '../models/User.js';
import Pet from '../models/Pet.js';
import { Breed, Tip } from '../models/Catalog.js';
import {
  requireAuth,
  requireAdmin,
  obtenerRolUsuario,
  obtenerArregloRoles,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas del panel de administración exigen JWT válido y rol 'admin' verificado en MongoDB
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats - Métricas agregadas del sistema para supervisión del piloto semi-controlado
router.get('/stats', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalPets,
      especiesAgg,
      totalBreeds,
      totalTips,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        $or: [{ role: 'admin' }, { roles: 'admin' }],
      }),
      Pet.countDocuments(),
      Pet.aggregate<{ _id: string | null; count: number }>([
        {
          $group: {
            _id: '$species',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Breed.countDocuments(),
      Tip.countDocuments(),
    ]);

    const petsBySpecies = especiesAgg.map((item) => ({
      species: item._id || 'Otro',
      count: item.count,
    }));

    const speciesDistribution: Record<string, number> = {};
    for (const item of petsBySpecies) {
      speciesDistribution[item.species] = item.count;
    }

    res.json({
      ok: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalPets,
        petsBySpecies,
        speciesDistribution,
        totalBreeds,
        totalTips,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - Lista paginada o reciente de usuarios registrados sin exponer contraseñas
router.get('/users', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pageRaw = Number(req.query.page);
    const limitRaw = Number(req.query.limit);
    const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit =
      Number.isInteger(limitRaw) && limitRaw > 0 && limitRaw <= 100 ? limitRaw : 50;
    const skip = (page - 1) * limit;

    const [usuariosDocs, totalUsers, conteoMascotasPorOwner] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
      Pet.aggregate<{ _id: unknown; count: number }>([
        {
          $group: {
            _id: '$ownerId',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const mapaMascotas = new Map<string, number>();
    for (const item of conteoMascotasPorOwner) {
      if (item._id) {
        mapaMascotas.set(String(item._id), item.count);
      }
    }

    const users = usuariosDocs.map((u) => {
      const uid = String(u._id);
      const docConFecha = u as unknown as { createdAt?: Date };
      return {
        id: uid,
        _id: uid,
        fullName: u.fullName,
        email: u.email,
        role: obtenerRolUsuario(u),
        roles: obtenerArregloRoles(u),
        createdAt: docConFecha.createdAt ?? null,
        petsCount: mapaMascotas.get(uid) ?? 0,
      };
    });

    res.json({
      ok: true,
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
