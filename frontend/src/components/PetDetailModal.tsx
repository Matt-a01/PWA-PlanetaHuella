import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit2,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Activity,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import ModalVentana from './ModalVentana';
import PetAvatar from './PetAvatar';
import PetFormModal from './PetFormModal';
import TaskFormModal from './TaskFormModal';
import MedicalRecordModal from './MedicalRecordModal';
import ConfirmDialog from './ConfirmDialog';
import {
  usePetStore,
  type Pet,
  type Task,
  type MedicalRecordItem,
} from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

interface PetDetailModalProps {
  abierto: boolean;
  onCerrar: () => void;
  mascotaId: string | null;
}

export default function PetDetailModal({
  abierto,
  onCerrar,
  mascotaId,
}: PetDetailModalProps) {
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
  const mostrarToast = useToastStore((state) => state.mostrarToast);

  const [tab, setTab] = useState<'cuidados' | 'salud'>('cuidados');
  const [modalEditarMascota, setModalEditarMascota] = useState(false);
  const [modalNuevaTarea, setModalNuevaTarea] = useState(false);
  const [modalNuevoRegistro, setModalNuevoRegistro] = useState(false);
  const [tareaConfirmarEliminar, setTareaConfirmarEliminar] = useState<Task | null>(null);
  const [registroConfirmarEliminar, setRegistroConfirmarEliminar] =
    useState<MedicalRecordItem | null>(null);

  const mascota: Pet | null = pets.find((p) => p._id === mascotaId) || null;

  useEffect(() => {
    if (abierto && mascota?._id) {
      cargarRegistrosMedicos(mascota._id);
    }
  }, [abierto, mascota?._id, cargarRegistrosMedicos]);

  if (!mascota) return null;

  const tareasMascota = tasks.filter((t) => {
    const pid = typeof t.petId === 'object' ? t.petId._id : t.petId;
    return pid === mascota._id;
  });

  const registrosMascota = medicalRecords[mascota._id] ?? [];

  return (
    <>
      <ModalVentana
        abierto={abierto}
        onCerrar={onCerrar}
        titulo={mascota.name}
        subtitulo={`${mascota.species} • ${mascota.breed} • ${mascota.age} ${mascota.age === 1 ? 'año' : 'años'} • ${mascota.gender}`}
        badge="Ficha y personalización"
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          {/* Encabezado visual de la mascota */}
          <div className="flex items-center gap-4 bg-green-50/50 border border-green-100 rounded-2xl p-3.5">
            <PetAvatar
              imageUrl={mascota.imageUrl}
              name={mascota.name}
              species={mascota.species}
              className="w-20 h-20 rounded-2xl shrink-0 border border-white shadow-xs"
              iconSize={44}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mb-1">
                <Activity size={14} />
                <span>{tareasMascota.length} actividades configuradas</span>
              </div>
              {mascota.characteristics ? (
                <p className="text-xs text-gray-600 line-clamp-2">
                  <span className="font-semibold text-gray-800">Indicaciones: </span>
                  {mascota.characteristics}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Sin indicaciones especiales registradas aún.
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalEditarMascota(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 bg-white border border-green-200 px-3 py-1 rounded-full transition-colors cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Editar datos o foto</span>
                </button>
                <Link
                  to={`/mascota/${mascota._id}`}
                  onClick={onCerrar}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 hover:text-green-900 bg-green-100/80 hover:bg-green-100 border border-green-200 px-3 py-1 rounded-full transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>Abrir ficha en pantalla completa</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Selector de sección */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setTab('cuidados')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                tab === 'cuidados'
                  ? 'bg-white text-green-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Tareas y Cuidados ({tareasMascota.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('salud')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                tab === 'salud'
                  ? 'bg-white text-green-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Vacunas y Citas ({registrosMascota.length})
            </button>
          </div>

          {tab === 'cuidados' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Personaliza las actividades diarias de {mascota.name}
                </p>
                <button
                  type="button"
                  onClick={() => setModalNuevaTarea(true)}
                  className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Nueva tarea</span>
                </button>
              </div>

              {tareasMascota.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Sparkles size={20} className="mx-auto text-green-600 mb-1.5" />
                  <p className="text-xs text-gray-500 mb-2">
                    {mascota.name} no tiene tareas asignadas actualmente.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalNuevaTarea(true)}
                    className="text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                  >
                    + Agregar tarea o sugerencia
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {tareasMascota.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100"
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
                        onClick={() => setTareaConfirmarEliminar(t)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Quitar tarea"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Vacunas, desparasitaciones y citas médicas
                </p>
                <button
                  type="button"
                  onClick={() => setModalNuevoRegistro(true)}
                  className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Registrar</span>
                </button>
              </div>

              {registrosMascota.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Calendar size={20} className="mx-auto text-green-600 mb-1.5" />
                  <p className="text-xs text-gray-500 mb-2">
                    Aún no hay vacunas ni citas registradas para {mascota.name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalNuevoRegistro(true)}
                    className="text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                  >
                    + Registrar primera vacuna o cita
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {registrosMascota.map((rec) => {
                    const esCita = rec.type.toLowerCase().includes('cita');
                    return (
                      <div
                        key={rec._id}
                        className={`p-3 rounded-xl border flex justify-between items-center ${
                          esCita
                            ? 'bg-green-50/70 border-green-100'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              esCita ? 'bg-green-100 text-green-700' : 'bg-white text-green-600'
                            }`}
                          >
                            {esCita ? <Calendar size={16} /> : <CheckCircle2 size={16} />}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-gray-900">{rec.type}</p>
                            <p className="text-[11px] text-gray-500">
                              {rec.date.slice(0, 10)} {rec.notes ? `• ${rec.notes}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRegistroConfirmarEliminar(rec)}
                          className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </ModalVentana>

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

      <ConfirmDialog
        abierto={Boolean(tareaConfirmarEliminar)}
        titulo="¿Eliminar tarea?"
        mensaje={
          tareaConfirmarEliminar
            ? `¿Eliminar la tarea «${tareaConfirmarEliminar.title}» de ${mascota.name}?`
            : '¿Eliminar esta tarea?'
        }
        onConfirmar={async () => {
          if (!tareaConfirmarEliminar) return;
          const titulo = tareaConfirmarEliminar.title;
          await eliminarTarea(tareaConfirmarEliminar._id, user?.id);
          setTareaConfirmarEliminar(null);
          mostrarToast(`Tarea «${titulo}» eliminada.`, 'info');
        }}
        onCancelar={() => setTareaConfirmarEliminar(null)}
      />

      <ConfirmDialog
        abierto={Boolean(registroConfirmarEliminar)}
        titulo="¿Eliminar registro médico?"
        mensaje={
          registroConfirmarEliminar
            ? `¿Eliminar el control «${registroConfirmarEliminar.type}» del historial de ${mascota.name}?`
            : '¿Eliminar este registro médico?'
        }
        onConfirmar={async () => {
          if (!registroConfirmarEliminar) return;
          const tipo = registroConfirmarEliminar.type;
          await eliminarRegistroMedico(mascota._id, registroConfirmarEliminar._id);
          setRegistroConfirmarEliminar(null);
          mostrarToast(`Registro médico «${tipo}» eliminado.`, 'info');
        }}
        onCancelar={() => setRegistroConfirmarEliminar(null)}
      />
    </>
  );
}
