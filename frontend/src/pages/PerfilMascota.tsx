import { useState, useEffect, type FormEvent } from 'react';
import {
  ChevronLeft,
  Edit2,
  Activity,
  Calendar,
  Heart,
  CheckCircle2,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const {
    pets,
    tasks,
    medicalRecords,
    obtenerTareasSugeridas,
    agregarTarea,
    toggleTarea,
    eliminarTarea,
    cargarRegistrosMedicos,
    agregarRegistroMedico,
    eliminarRegistroMedico,
  } = usePetStore();

  const [tabActiva, setTabActiva] = useState<'resumen' | 'salud' | 'cuidados' | 'galeria'>('resumen');
  const [nuevaTareaTitulo, setNuevaTareaTitulo] = useState('');
  const [tipoMedico, setTipoMedico] = useState('Última vacuna');
  const [fechaMedica, setFechaMedica] = useState('');
  const [notaMedica, setNotaMedica] = useState('');

  const mascota = pets.find((p) => p._id === id) || pets[0] || {
    _id: 'luna',
    name: 'Luna',
    species: 'Perro',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Hembra',
    characteristics: 'Juguetona y sociable',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
  };

  useEffect(() => {
    if (mascota._id) {
      cargarRegistrosMedicos(mascota._id);
    }
  }, [mascota._id, cargarRegistrosMedicos]);

  // Tareas exclusivas de esta mascota
  const tareasMascota = tasks.filter((t) => {
    const pid = typeof t.petId === 'object' ? t.petId._id : t.petId;
    return pid === mascota._id;
  });

  // Sugerencias de acuerdo con la especie y raza del animal que aún no tenga agregadas
  const sugeridasRaza = obtenerTareasSugeridas(mascota.species, mascota.breed).filter(
    (sug) => !tareasMascota.some((t) => t.title.toLowerCase() === sug.toLowerCase())
  );

  const registrosMascota = medicalRecords[mascota._id] || [
    { _id: 'm1', type: 'Última vacuna', date: '2026-02-12', notes: 'Séxtuple anual', petId: mascota._id },
    { _id: 'm2', type: 'Última desparasitación', date: '2026-01-10', notes: 'Interna y externa', petId: mascota._id },
    { _id: 'm3', type: 'Próxima cita', date: '2026-11-15', notes: 'Revisión general', petId: mascota._id },
  ];

  const handleAgregarTarea = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevaTareaTitulo.trim()) return;
    await agregarTarea(mascota._id, mascota.name, nuevaTareaTitulo.trim(), user?.id);
    setNuevaTareaTitulo('');
  };

  const handleAgregarRegistroMedico = async (e: FormEvent) => {
    e.preventDefault();
    if (!fechaMedica) return;
    await agregarRegistroMedico(mascota._id, tipoMedico, fechaMedica, notaMedica.trim());
    setFechaMedica('');
    setNotaMedica('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      <div className="relative h-60 w-full bg-green-100">
        <img src={mascota.imageUrl} alt={mascota.name} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Link
            to="/inicio"
            className="w-9 h-9 bg-white/85 rounded-full flex items-center justify-center text-gray-700 shadow-xs"
          >
            <ChevronLeft size={22} />
          </Link>
          <Link
            to={`/AgregarMascota?id=${mascota._id}`}
            className="w-9 h-9 bg-white/85 rounded-full flex items-center justify-center text-gray-700 shadow-xs"
          >
            <Edit2 size={18} />
          </Link>
        </div>

        <button
          type="button"
          className="absolute -bottom-5 right-6 w-11 h-11 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white"
        >
          <Heart size={20} className="fill-pink-400" />
        </button>
      </div>

      <div className="bg-white rounded-t-3xl -mt-4 relative px-5 pt-5 pb-4 shadow-xs">
        <h2 className="text-2xl font-bold text-gray-900">{mascota.name}</h2>
        <p className="text-sm text-gray-500">
          {mascota.species} • {mascota.breed} • {mascota.age} años • {mascota.gender}
        </p>
        {mascota.characteristics && (
          <p className="text-xs text-green-700 bg-green-50 inline-block px-2.5 py-1 rounded-full mt-2">
            ✨ {mascota.characteristics}
          </p>
        )}

        <div className="flex w-full justify-between border-b border-gray-100 text-sm mt-4">
          {(['resumen', 'salud', 'cuidados', 'galeria'] as const).map((tab) => {
            const labels = {
              resumen: 'Resumen',
              salud: 'Salud',
              cuidados: 'Cuidados',
              galeria: 'Galería',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setTabActiva(tab)}
                className={`pb-2.5 px-2 font-medium cursor-pointer ${
                  tabActiva === tab
                    ? 'text-green-700 font-semibold border-b-2 border-green-700'
                    : 'text-gray-400'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* PESTAÑA CUIDADOS: Tareas personalizadas de esta mascota con opción de quitar o añadir */}
        {tabActiva === 'cuidados' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                Actividades de {mascota.name} ({mascota.breed})
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Marca las tareas realizadas o quita las actividades que no apliquen para tu mascota.
              </p>

              {tareasMascota.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">
                  No hay actividades asignadas actualmente. Agrega una abajo o elige una sugerida.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {tareasMascota.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100"
                    >
                      <label className="flex items-center gap-2.5 text-xs font-medium text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.isCompleted}
                          onChange={() => toggleTarea(t._id, user?.id)}
                          className="w-4 h-4 accent-green-700 rounded cursor-pointer"
                        />
                        <span className={t.isCompleted ? 'line-through text-gray-400' : ''}>
                          {t.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => eliminarTarea(t._id, user?.id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Quitar del perfil de la mascota"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAgregarTarea} className="flex gap-2">
                <input
                  type="text"
                  value={nuevaTareaTitulo}
                  onChange={(e) => setNuevaTareaTitulo(e.target.value)}
                  placeholder="Agregar cuidado personalizado..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Agregar</span>
                </button>
              </form>
            </div>

            {sugeridasRaza.length > 0 && (
              <div className="bg-green-50/80 rounded-2xl border border-green-100 p-4">
                <p className="text-xs font-bold text-green-900 flex items-center gap-1.5 mb-2">
                  <Sparkles size={14} className="text-green-700" />
                  <span>Tareas sugeridas para {mascota.species} ({mascota.breed})</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sugeridasRaza.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => agregarTarea(mascota._id, mascota.name, sug, user?.id)}
                      className="bg-white hover:bg-green-100 text-green-800 border border-green-200 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tabActiva === 'galeria' && (
          <div className="grid grid-cols-2 gap-3">
            <img
              src={mascota.imageUrl}
              alt={mascota.name}
              className="w-full h-32 object-cover rounded-2xl border border-gray-100"
            />
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80"
              alt="Paseo"
              className="w-full h-32 object-cover rounded-2xl border border-gray-100"
            />
          </div>
        )}

        {/* PESTAÑAS RESUMEN Y SALUD: Historial médico guardado en MongoDB (MedicalRecord) */}
        {(tabActiva === 'resumen' || tabActiva === 'salud') && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado general</p>
                  <p className="font-semibold text-sm text-green-700">¡Está muy bien!</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{tareasMascota.length} cuidados activos</span>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
              {registrosMascota.map((rec) => {
                const esCita = rec.type.toLowerCase().includes('cita');
                return (
                  <div
                    key={rec._id}
                    className={`p-4 border-b border-gray-50 flex justify-between items-center ${
                      esCita ? 'bg-green-50/70' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          esCita ? 'bg-green-100 text-green-700' : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {esCita ? <Calendar size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${esCita ? 'text-green-800' : 'text-gray-900'}`}>
                          {rec.type}
                        </p>
                        <p className={`text-xs ${esCita ? 'text-green-600' : 'text-gray-500'}`}>
                          {rec.date.slice(0, 10)} {rec.notes ? `• ${rec.notes}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarRegistroMedico(mascota._id, rec._id)}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Eliminar registro médico"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Formulario para agregar registros médicos (MedicalRecord) en MongoDB */}
            <form
              onSubmit={handleAgregarRegistroMedico}
              className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 space-y-2.5"
            >
              <p className="text-xs font-bold text-gray-800">Registrar vacuna, desparasitación o cita</p>
              <div className="flex gap-2">
                <select
                  value={tipoMedico}
                  onChange={(e) => setTipoMedico(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-green-600"
                >
                  <option value="Última vacuna">Última vacuna</option>
                  <option value="Última desparasitación">Última desparasitación</option>
                  <option value="Próxima cita">Próxima cita</option>
                  <option value="Consulta veterinaria">Consulta veterinaria</option>
                </select>
                <input
                  type="date"
                  required
                  value={fechaMedica}
                  onChange={(e) => setFechaMedica(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={notaMedica}
                  onChange={(e) => setNotaMedica(e.target.value)}
                  placeholder="Nota opcional (ej. Rabia, Dr. Pérez)..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </>
        )}

        <button
          type="button"
          onClick={() => navigate(`/AgregarMascota?id=${mascota._id}`)}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-xs transition-colors mt-3 cursor-pointer"
        >
          Editar perfil
        </button>
      </div>
    </div>
  );
}
