import { useEffect, useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Shield,
  Users,
  PawPrint,
  BookOpen,
  Lightbulb,
  RefreshCw,
  Search,
  ChevronRight,
} from 'lucide-react';
import { apiGet } from '../services/apiClient';
import { useAuthStore, esUsuarioAdmin } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalPets: number;
  petsBySpecies: Array<{ species: string; count: number }>;
  totalBreeds: number;
  totalTips: number;
}

interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  roles?: string[];
  createdAt: string | null;
  petsCount: number;
}

export default function AdminDashboard() {
  const { user, sincronizarRolDesdeBD } = useAuthStore();
  const mostrarToast = useToastStore((state) => state.mostrarToast);
  const esAdmin = esUsuarioAdmin(user);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usuarios, setUsuarios] = useState<AdminUserItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  const cargarPanelAdmin = useCallback(
    async (mostrarAviso = false) => {
      try {
        await sincronizarRolDesdeBD();
        const [resStats, resUsers] = await Promise.all([
          apiGet<{ ok: boolean; stats: AdminStats }>('/admin/stats'),
          apiGet<{ ok: boolean; users: AdminUserItem[] }>('/admin/users'),
        ]);

        if (resStats.ok && resStats.stats) {
          setStats(resStats.stats);
        }
        if (resUsers.ok && Array.isArray(resUsers.users)) {
          setUsuarios(resUsers.users);
        }
        if (mostrarAviso) {
          mostrarToast('Métricas del panel actualizadas.', 'info');
        }
      } catch (err) {
        mostrarToast(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las métricas de administración.',
          'error'
        );
      } finally {
        setCargando(false);
      }
    },
    [sincronizarRolDesdeBD, mostrarToast]
  );

  useEffect(() => {
    if (!esAdmin) return;
    let activo = true;

    const inicializar = async () => {
      try {
        await sincronizarRolDesdeBD();
        const [resStats, resUsers] = await Promise.all([
          apiGet<{ ok: boolean; stats: AdminStats }>('/admin/stats'),
          apiGet<{ ok: boolean; users: AdminUserItem[] }>('/admin/users'),
        ]);
        if (!activo) return;
        if (resStats.ok && resStats.stats) {
          setStats(resStats.stats);
        }
        if (resUsers.ok && Array.isArray(resUsers.users)) {
          setUsuarios(resUsers.users);
        }
      } catch (err) {
        if (!activo) return;
        mostrarToast(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las métricas de administración.',
          'error'
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    void inicializar();

    return () => {
      activo = false;
    };
  }, [esAdmin, sincronizarRolDesdeBD, mostrarToast]);

  const handleActualizarPanel = () => {
    setCargando(true);
    void cargarPanelAdmin(true);
  };

  if (!esAdmin) {
    return <Navigate to="/inicio" replace />;
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busquedaUsuario.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 pb-28">
      <header className="flex items-center justify-between gap-3 mb-6 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
            <Shield size={12} />
            <span>Panel de Administración • Piloto</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisión Global</h1>
          <p className="text-xs text-gray-500">
            Métricas en tiempo real y cuentas registradas en MongoDB Atlas
          </p>
        </div>

        <button
          type="button"
          onClick={handleActualizarPanel}
          disabled={cargando}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-green-50 text-green-700 border border-green-200 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </header>

      {/* Tarjetas de métricas principales */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mb-2.5">
            <Users size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers ?? '—'}</p>
          <p className="text-xs text-gray-500 font-medium">
            Usuarios ({stats?.totalAdmins ?? 0} admin)
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <PawPrint size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalPets ?? '—'}</p>
          <p className="text-xs text-gray-500 font-medium">Mascotas activas</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5">
            <BookOpen size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalBreeds ?? '—'}</p>
          <p className="text-xs text-gray-500 font-medium">Razas en catálogo</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mb-2.5">
            <Lightbulb size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalTips ?? '—'}</p>
          <p className="text-xs text-gray-500 font-medium">Tips publicados</p>
        </div>
      </section>

      {/* Accesos directos de gestión del catálogo global */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Link
          to="/razas"
          className="bg-white hover:border-green-300 rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Gestionar Catálogo de Razas</p>
              <p className="text-xs text-gray-500">
                Crear, editar o eliminar razas y rutinas sugeridas
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-green-700 shrink-0" />
        </Link>

        <Link
          to="/recomendaciones"
          className="bg-white hover:border-green-300 rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0">
              <Lightbulb size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Gestionar Recomendaciones</p>
              <p className="text-xs text-gray-500">
                Publicar o actualizar consejos veterinarios por especie
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-green-700 shrink-0" />
        </Link>
      </section>

      {/* Distribución de mascotas por especie */}
      <section className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          Distribución de mascotas por especie
        </h2>
        {!stats || stats.petsBySpecies.length === 0 ? (
          <p className="text-xs text-gray-400">
            Aún no hay mascotas registradas para calcular la distribución por especie.
          </p>
        ) : (
          <div className="space-y-2.5">
            {stats.petsBySpecies.map((item) => {
              const porcentaje =
                stats.totalPets > 0
                  ? Math.round((item.count / stats.totalPets) * 100)
                  : 0;
              return (
                <div key={item.species} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{item.species}</span>
                    <span className="text-green-700">
                      {item.count} ({porcentaje}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-700 rounded-full transition-all"
                      style={{ width: `${Math.max(porcentaje, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Supervisión de cuentas registradas en el piloto */}
      <section className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Cuentas registradas ({usuariosFiltrados.length})
            </h2>
            <p className="text-xs text-gray-500">
              Supervisión del piloto semi-controlado (sin exposición de contraseñas)
            </p>
          </div>

          <div className="relative sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={busquedaUsuario}
              onChange={(e) => setBusquedaUsuario(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
            />
          </div>
        </div>

        {cargando ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            Consultando cuentas registradas en MongoDB...
          </p>
        ) : usuariosFiltrados.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No se encontraron cuentas con ese criterio.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className="py-3 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center shrink-0 border border-green-100">
                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-gray-900 truncate">{u.fullName}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {u.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                    <PawPrint size={12} />
                    <span>
                      {u.petsCount} {u.petsCount === 1 ? 'mascota' : 'mascotas'}
                    </span>
                  </span>
                  {u.createdAt && (
                    <span className="text-[11px] text-gray-400 hidden sm:inline">
                      {String(u.createdAt).slice(0, 10)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
