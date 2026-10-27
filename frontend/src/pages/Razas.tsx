import { useState, useEffect, type FormEvent } from 'react';
import { Search, Heart, Filter, PawPrint, Plus, Trash2, Shield } from 'lucide-react';
import { usePetStore } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Razas() {
  const { user, sincronizarRolDesdeBD } = useAuthStore();
  const { catalogRazas, cargarCatalogo, agregarRazaCatalogo, eliminarRazaCatalogo } = usePetStore();
  const esAdmin = user?.role === 'admin' || user?.roles?.includes('admin');

  const [categoria, setCategoria] = useState<'Perros' | 'Gatos' | 'Otros'>('Perros');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormularioAdmin, setMostrarFormularioAdmin] = useState(false);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaImg, setNuevaImg] = useState('');
  const [nuevasTareasTexto, setNuevasTareasTexto] = useState('');

  useEffect(() => {
    cargarCatalogo();
    sincronizarRolDesdeBD();
  }, [cargarCatalogo, sincronizarRolDesdeBD]);

  const razasFiltradas = catalogRazas.filter(
    (r) => r.category === categoria && r.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAgregarRazaAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevaDesc.trim()) return;

    const tareasSeparadas = nuevasTareasTexto
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await agregarRazaCatalogo({
      name: nuevoNombre.trim(),
      category: categoria,
      desc: nuevaDesc.trim(),
      img:
        nuevaImg.trim() ||
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
      bg: 'bg-green-50',
      suggestedTasks:
        tareasSeparadas.length > 0
          ? tareasSeparadas
          : ['Dar alimento adecuado', 'Agua fresca', 'Cuidado diario'],
    });

    setNuevoNombre('');
    setNuevaDesc('');
    setNuevaImg('');
    setNuevasTareasTexto('');
    setMostrarFormularioAdmin(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 p-5">
      <div className="flex justify-between items-center mb-6 pt-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {categoria === 'Otros' ? 'Otros animales' : 'Razas'}
        </h1>

        {esAdmin && (
          <button
            type="button"
            onClick={() => setMostrarFormularioAdmin(!mostrarFormularioAdmin)}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Agregar a {categoria}</span>
          </button>
        )}
      </div>

      {/* Formulario exclusivo para cuentas de Administrador */}
      {esAdmin && mostrarFormularioAdmin && (
        <form
          onSubmit={handleAgregarRazaAdmin}
          className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 mb-5 space-y-3"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Shield size={15} />
            <span>Panel Administrador: Agregar en "{categoria}" (se guarda en MongoDB)</span>
          </div>

          <input
            type="text"
            required
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre de la raza o especie (ej. Chihuahua, Tortugas)..."
            className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
          />

          <input
            type="text"
            required
            value={nuevaDesc}
            onChange={(e) => setNuevaDesc(e.target.value)}
            placeholder="Descripción breve (ej. Leal y alerta)..."
            className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
          />

          <input
            type="text"
            value={nuevaImg}
            onChange={(e) => setNuevaImg(e.target.value)}
            placeholder="URL de imagen (opcional)..."
            className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
          />

          <input
            type="text"
            value={nuevasTareasTexto}
            onChange={(e) => setNuevasTareasTexto(e.target.value)}
            placeholder="Tareas sugeridas separadas por coma (ej. Paseo corto, Cepillar pelo)..."
            className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Guardar en el catálogo de la base de datos
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {(['Perros', 'Gatos', 'Otros'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoria(cat)}
            className={`flex-1 font-medium py-2 rounded-xl text-sm cursor-pointer ${
              categoria === cat
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat === 'Otros' ? 'Otros animales' : cat}
          </button>
        ))}
      </div>

      {categoria !== 'Otros' ? (
        <>
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar raza..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-sm"
              />
            </div>
            <button className="bg-white p-2 rounded-xl border border-gray-200 text-gray-500">
              <Filter size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {razasFiltradas.map((raza) => (
              <div
                key={raza._id}
                className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 relative flex flex-col justify-between"
              >
                <div>
                  <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm text-gray-400 hover:text-red-500 z-10">
                    <Heart size={14} />
                  </button>
                  {esAdmin && (
                    <button
                      type="button"
                      onClick={() => eliminarRazaCatalogo(raza._id)}
                      className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-full shadow-sm text-red-500 hover:bg-red-50 z-10 cursor-pointer"
                      title="Eliminar del catálogo (Admin)"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <img
                    src={raza.img}
                    alt={raza.name}
                    className="w-full h-28 object-cover rounded-xl mb-2"
                  />
                  <div className="px-1 pb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{raza.name}</h3>
                    <p className="text-xs text-gray-500">{raza.desc}</p>
                  </div>
                </div>
                {raza.suggestedTasks?.length > 0 && (
                  <p className="text-[10px] text-green-700 bg-green-50 rounded-lg px-2 py-1 mt-1 truncate">
                    ✓ {raza.suggestedTasks[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {razasFiltradas.map((animal) => (
              <div
                key={animal._id}
                className={`${animal.bg || 'bg-green-50'} rounded-2xl p-3 border border-gray-100 shadow-xs relative`}
              >
                {esAdmin && (
                  <button
                    type="button"
                    onClick={() => eliminarRazaCatalogo(animal._id)}
                    className="absolute top-4 right-4 bg-white/90 p-1.5 rounded-full shadow-sm text-red-500 hover:bg-red-50 z-10 cursor-pointer"
                    title="Eliminar del catálogo (Admin)"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <img
                  src={animal.img}
                  alt={animal.name}
                  className="w-full h-24 object-cover rounded-xl mb-2"
                />
                <h3 className="font-bold text-gray-900 text-sm">{animal.name}</h3>
                <p className="text-xs text-gray-600">{animal.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-green-100 rounded-2xl p-4 flex items-center gap-3">
            <PawPrint size={22} className="text-green-700 shrink-0" />
            <p className="text-xs font-semibold text-green-900">
              Todas las mascotas merecen un gran cuidado
            </p>
          </div>
        </>
      )}
    </div>
  );
}
