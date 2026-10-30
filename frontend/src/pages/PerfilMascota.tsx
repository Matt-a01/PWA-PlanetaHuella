import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Edit2,
  Activity,
  Calendar,
  CheckCircle2,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PetAvatar from '../components/PetAvatar';
import PetFormModal from '../components/PetFormModal';
import TaskFormModal from '../components/TaskFormModal';
import MedicalRecordModal from '../components/MedicalRecordModal';
import { usePetStore } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function PerfilMascota() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const {
    pets,
    tasks,
    medicalRecords,
    toggleTarea,
    eliminarTarea,
    cargarRegistrosMedicos,
    eliminarRegistroMedico,
  } = usePetStore();

  const [tabActiva, setTabActiva] = useState<'resumen' | 'salud' | 'cuidados'>('resumen');
  const [modalEditarMascota, setModalEditarMascota] = useState(false);
  const [modalNuevaTarea, setModalNuevaTarea] = useState(false);
  const [modalNuevoRegistro, setModalNuevoRegistro] = useState(false);

  const mascota = pets.find((p) => p._id === id) || pets[0] || {
    _id: 'luna',
    name: 'Luna',
    species: 'Perro',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Hembra',
    characteristics: '',
    imageUrl: '',
  };

  useEffect(() => {
    if (mascota._id) {
      cargarRegistrosMedicos(mascota._id);
    }
  }, [mascota._id, cargarRegistrosMedicos]);

  const tareasMascota = tasks.filter((t) => {
    const pid = typeof t.petId === 'object' ? t.petId._id : t.petId;
    return pid === mascota._id;
  });

  const registrosMascota = medicalRecords[mascota._id] || [
    { _id: 'm1', type: 'Última vacuna', date: '2026-02-12', notes: 'Séxtuple anual', petId: mascota._id },
    { _id: 'm2', type: 'Última desparasitación', date: '2026-01-10', notes: 'Interna y externa', petId: mascota._id },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="relative h-60 w-full bg-green-50">
        <PetAvatar
          imageUrl={mascota.imageUrl}
          name={mascota.name}
          species={mascota.species}
          className="w-full h-full rounded-none"
          iconSize={84}
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Link
            to="/inicio"
            className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-gray-700 shadow-xs"
          >
            <ChevronLeft size={22} />
          </Link>
          <button
            type="button"
            onClick={() => setModalEditarMascota(true)}
            className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:text-green-700 shadow-xs cursor-pointer"
          >
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl -mt-4 relative px-5 pt-5 pb-4 shadow-xs border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">{mascota.name}</h2>
        <p className="text-sm text-gray-500">
          {mascota.species} • {mascota.breed} • {mascota.age} {mascota.age === 1 ? 'año' : 'años'} • {mascota.gender}
        </p>
        {mascota.characteristics && (
          <p className="text-xs text-green-800 bg-green-50 border border-green-100 inline-block px-3 py-1 rounded-full mt-2">
            {mascota.characteristics}
          </p>
        )}

        <div className="flex w-full justify-around border-b border-gray-100 text-sm mt-4">
          {(['resumen', 'salud', 'cuidados'] as const).map((tab) => {
            const labels = {
              resumen: 'Resumen',
              salud: 'Vacunas y Citas',
              cuidados: 'Tareas',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setTabActiva(tab)}
                className={`pb-2.5 px-3 font-medium cursor-pointer ${
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
        {tabActiva === 'cuidados' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Actividades de {mascota.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Marca o personaliza sus tareas diarias
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevaTarea(true)}
                className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
              >
                <Plus size={14} />
                <span>Nueva tarea</span>
              </button>
            </div>

            {tareasMascota.length === 0 ? (
              <div className="text-center py-5">
                <Sparkles size={20} className="mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-400">
                  No hay actividades asignadas actualmente.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
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
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(tabActiva === 'resumen' || tabActiva === 'salud') && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-700">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado general</p>
                  <p className="font-semibold text-sm text-green-700">¡Al día en sus cuidados!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevoRegistro(true)}
                className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
              >
                <Plus size={14} />
                <span>Registrar control</span>
              </button>
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
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setModalEditarMascota(true)}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-xs transition-colors mt-3 cursor-pointer"
        >
          Editar perfil de {mascota.name}
        </button>
      </div>

      {/* Sub-ventanas flotantes */}
      <PetFormModal
        abierto={modalEditarMascota}
        onCerrar={() => setModalEditarMascota(false)}
        mascotaEditar={mascota}
      />

      <TaskFormModal
        abierto={modalNuevaTarea}
        onCerrar={() => setModalNuevaTarea(false)}
        mascota={mascota}
      />

      <MedicalRecordModal
        abierto={modalNuevoRegistro}
        onCerrar={() => setModalNuevoRegistro(false)}
        mascota={mascota}
      />
    </div>
  );
}
