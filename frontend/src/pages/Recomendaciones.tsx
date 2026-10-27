import { useState, useEffect, type FormEvent } from 'react';
import { ChevronRight, Footprints, Sparkles, Heart, Plus, Trash2, Shield } from 'lucide-react';
import { usePetStore } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Recomendaciones() {
  const { user, sincronizarRolDesdeBD } = useAuthStore();
  const { pets, catalogTips, cargarCatalogo, agregarTipCatalogo, eliminarTipCatalogo } = usePetStore();
  const esAdmin = user?.role === 'admin' || user?.roles?.includes('admin');

  const [mascotaActiva, setMascotaActiva] = useState(0);
  const [tipExpandido, setTipExpandido] = useState<string | null>(null);
  const [mostrarFormularioAdmin, setMostrarFormularioAdmin] = useState(false);

  const [tituloTip, setTituloTip] = useState('');
  const [descTip, setDescTip] = useState('');
  const [detalleTip, setDetalleTip] = useState('');
  const [especieTip, setEspecieTip] = useState('Todos');
  const [iconoTip, setIconoTip] = useState('footprints');

  useEffect(() => {
    cargarCatalogo();
    sincronizarRolDesdeBD();
  }, [cargarCatalogo, sincronizarRolDesdeBD]);

  const mascota = pets[mascotaActiva] || {
    name: 'Luna',
    species: 'Perro',
    breed: 'Golden Retriever',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80',
  };

  // Muestra los tips generales más los específicos para la especie de la mascota seleccionada
  const tipsFiltrados = catalogTips.filter(
    (t) => !t.species || t.species === 'Todos' || t.species.toLowerCase() === mascota.species.toLowerCase()
  );

  const obtenerEstiloIcono = (iconType: string) => {
    if (iconType === 'sparkles') {
      return { icon: <Sparkles size={20} className="text-amber-600" />, bg: 'bg-amber-50' };
    }
    if (iconType === 'heart') {
      return { icon: <Heart size={20} className="text-rose-500" />, bg: 'bg-rose-50' };
    }
    return { icon: <Footprints size={20} className="text-orange-500" />, bg: 'bg-orange-50' };
  };

  const handleAgregarTipAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!tituloTip.trim() || !descTip.trim()) return;

    await agregarTipCatalogo({
      title: tituloTip.trim(),
      desc: descTip.trim(),
      detail: detalleTip.trim() || descTip.trim(),
      species: especieTip,
      iconType: iconoTip,
    });

    setTituloTip('');
    setDescTip('');
    setDetalleTip('');
    setMostrarFormularioAdmin(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24 p-5">
      <div className="flex justify-between items-center mb-5 pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Recomendaciones</h1>
        {esAdmin && (
          <button
            type="button"
            onClick={() => setMostrarFormularioAdmin(!mostrarFormularioAdmin)}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Agregar Tip</span>
          </button>
        )}
      </div>

      {/* Formulario exclusivo para cuentas de Administrador */}
      {esAdmin && mostrarFormularioAdmin && (
        <form
          onSubmit={handleAgregarTipAdmin}
          className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 mb-5 space-y-3"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Shield size={15} />
            <span>Panel Administrador: Agregar nuevo Tip a la base de datos</span>
          </div>

          <input
            type="text"
            required
            value={tituloTip}
            onChange={(e) => setTituloTip(e.target.value)}
            placeholder="Título del consejo (ej. Hidratación en verano)..."
            className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
          />

          <input
            type="text"
            required
            value={descTip}
            onChange={(e) => setDescTip(e.target.value)}
            placeholder="Resumen corto (ej. Evita golpes de calor)..."
            className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
          />

          <input
            type="text"
            value={detalleTip}
            onChange={(e) => setDetalleTip(e.target.value)}
            placeholder="Explicación detallada de la recomendación..."
            className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
          />

          <div className="flex gap-2">
            <select
              value={especieTip}
              onChange={(e) => setEspecieTip(e.target.value)}
              className="flex-1 p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
            >
              <option value="Todos">Para todas las especies</option>
              <option value="Perro">Solo Perros</option>
              <option value="Gato">Solo Gatos</option>
              <option value="Conejo">Solo Conejos</option>
              <option value="Ave">Solo Aves</option>
            </select>

            <select
              value={iconoTip}
              onChange={(e) => setIconoTip(e.target.value)}
              className="flex-1 p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
            >
              <option value="footprints">Ícono: Ejercicio / Huella</option>
              <option value="sparkles">Ícono: Pelaje / Higiene</option>
              <option value="heart">Ícono: Salud / Corazón</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Publicar recomendación en la base de datos
          </button>
        </form>
      )}

      <div className="flex w-full justify-start border-b border-gray-200 mb-6 overflow-x-auto">
        {pets.map((pet, idx) => (
          <button
            key={pet._id}
            type="button"
            onClick={() => setMascotaActiva(idx)}
            className={`pb-2.5 px-4 text-sm whitespace-nowrap cursor-pointer ${
              mascotaActiva === idx
                ? 'text-green-700 font-semibold border-b-2 border-green-700'
                : 'text-gray-400 font-medium'
            }`}
          >
            Para {pet.name}
          </button>
        ))}
      </div>

      <h2 className="text-gray-900 font-bold mb-3">
        Recomendado para {mascota.name} ({mascota.breed})
      </h2>
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 mb-2">
        <div className="flex gap-4">
          <img
            src={mascota.imageUrl}
            alt={mascota.name}
            className="w-24 h-24 object-cover rounded-xl"
          />
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                Nutrición y cuidado para {mascota.species} ({mascota.breed})
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Una dieta y rutina adaptadas a su especie mantienen su energía y bienestar diario.
              </p>
            </div>
            <button
              type="button"
              className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold py-1.5 px-4 rounded-lg self-start mt-2"
            >
              Ver más
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mb-6">
        <span className="w-4 h-1.5 rounded-full bg-green-700" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      </div>

      <h2 className="text-gray-900 font-bold mb-3">Consejos rápidos</h2>
      <div className="space-y-3">
        {tipsFiltrados.map((tip) => {
          const { icon, bg } = obtenerEstiloIcono(tip.iconType);
          const abierto = tipExpandido === tip._id;
          return (
            <div
              key={tip._id}
              onClick={() => setTipExpandido(abierto ? null : tip._id)}
              className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                    {icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{tip.title}</p>
                    <p className="text-xs text-gray-500">{tip.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {esAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarTipCatalogo(tip._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
                      title="Eliminar recomendación (Admin)"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <ChevronRight
                    size={20}
                    className={`text-gray-400 transition-transform ${abierto ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>
              {abierto && tip.detail && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  {tip.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
