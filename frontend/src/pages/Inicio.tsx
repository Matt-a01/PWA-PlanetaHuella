import { useEffect, useState } from 'react';
import { Plus, Bone, Droplet, Footprints, Scissors, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PetCard from '../components/PetCard';
import TaskItem from '../components/TaskItem';
import PetFormModal from '../components/PetFormModal';
import PetDetailModal from '../components/PetDetailModal';
import TaskFormModal from '../components/TaskFormModal';
import { useAuthStore } from '../store/useAuthStore';
import { usePetStore } from '../store/usePetStore';

export default function Inicio() {
  const user = useAuthStore((state) => state.user);
  const { pets, tasks, cargarDatos, toggleTarea, eliminarTarea } = usePetStore();
  const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Usuario';

  const [mascotaSeleccionada, setMascotaSeleccionada] = useState('');
  const [mascotaModalId, setMascotaModalId] = useState<string | null>(null);
  const [modalAgregarMascota, setModalAgregarMascota] = useState(false);
  const [modalAgregarTarea, setModalAgregarTarea] = useState(false);

  useEffect(() => {
    cargarDatos(user?.id);
  }, [cargarDatos, user?.id]);

  // Determina automáticamente la mascota activa sin requerir efectos adicionales
  const idMascotaActiva = pets.some((p) => p._id === mascotaSeleccionada)
    ? mascotaSeleccionada
    : pets[0]?._id || '';

  const mascotaActiva = pets.find((p) => p._id === idMascotaActiva) || null;

  // Filtra las tareas de hoy exclusivamente según la mascota escogida por el usuario
  const tareasMascotaActiva = tasks.filter((tarea) => {
    const pid = typeof tarea.petId === 'object' ? tarea.petId._id : tarea.petId;
    return pid === idMascotaActiva;
  });

  const obtenerIcono = (iconType: string) => {
    if (iconType === 'droplet') {
      return { icon: <Droplet size={20} className="text-sky-600" />, bg: 'bg-sky-50' };
    }
    if (iconType === 'footprints') {
      return { icon: <Footprints size={20} className="text-emerald-700" />, bg: 'bg-emerald-50' };
    }
    if (iconType === 'scissors') {
      return { icon: <Scissors size={20} className="text-teal-700" />, bg: 'bg-teal-50' };
    }
    return { icon: <Bone size={20} className="text-green-700" />, bg: 'bg-green-50' };
  };

  const abrirFichaMascota = (petId: string) => {
    setMascotaSeleccionada(petId);
    setMascotaModalId(petId);
  };

  return (
    <div className="p-5 pb-24 bg-[#F8FAFC] min-h-screen">
      <header className="flex justify-between items-center mb-7 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, {displayName}!</h1>
          <p className="text-gray-500 text-sm">Toca una mascota para ver o personalizar su ficha</p>
        </div>
        <Link
          to="/perfil"
          className="w-12 h-12 rounded-full border-2 border-green-100 flex items-center justify-center bg-green-100 text-green-700 font-bold hover:border-green-400 transition-colors shrink-0"
        >
          {user?.fullName ? (
            <span>{user.fullName.charAt(0).toUpperCase()}</span>
          ) : (
            <User size={22} />
          )}
        </Link>
      </header>

      {/* Cuadrícula 2x2 de mascotas */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Mis mascotas</h2>
          <Link to="/mascotas" className="text-xs text-green-700 hover:underline font-semibold">
            Gestionar todas &gt;
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {pets.map((pet) => (
            <PetCard
              key={pet._id}
              id={pet._id}
              name={pet.name}
              species={pet.species}
              breed={pet.breed}
              age={`${pet.age} ${pet.age === 1 ? 'año' : 'años'}`}
              imageUrl={pet.imageUrl}
              seleccionada={pet._id === idMascotaActiva}
              onClick={() => abrirFichaMascota(pet._id)}
            />
          ))}

          <button
            type="button"
            onClick={() => setModalAgregarMascota(true)}
            className="flex flex-col items-center justify-center min-h-[205px] bg-green-50/70 hover:bg-green-50 rounded-3xl p-4 border-2 border-green-200/80 border-dashed transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-2.5">
              <Plus size={24} />
            </div>
            <p className="text-sm font-bold text-green-800">Agregar mascota</p>
            <p className="text-[11px] text-green-700/75 text-center mt-0.5">
              Abrir sub-ventana de registro
            </p>
          </button>
        </div>
      </section>

      {/* Tareas de hoy filtradas únicamente por el animal seleccionado */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Tareas de hoy {mascotaActiva ? `• ${mascotaActiva.name}` : ''}
            </h2>
            <p className="text-xs text-gray-500">
              Actividades asignadas únicamente a la mascota seleccionada
            </p>
          </div>

          {mascotaActiva && (
            <button
              type="button"
              onClick={() => setModalAgregarTarea(true)}
              className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Nueva tarea</span>
            </button>
          )}
        </div>

        {/* Selector rápido de animal para alternar sus tareas del día */}
        {pets.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {pets.map((pet) => {
              const activa = pet._id === idMascotaActiva;
              return (
                <button
                  key={pet._id}
                  type="button"
                  onClick={() => setMascotaSeleccionada(pet._id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    activa
                      ? 'bg-green-700 text-white border-green-700 shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {pet.name} ({pet.species})
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col">
          {!mascotaActiva ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-sm text-gray-500">
                Registra tu primera mascota para organizar sus tareas diarias.
              </p>
            </div>
          ) : tareasMascotaActiva.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <Sparkles size={22} className="mx-auto text-green-600 mb-2" />
              <p className="text-sm font-semibold text-gray-800">
                No hay tareas pendientes para {mascotaActiva.name}
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Puedes añadir actividades sugeridas según su raza ({mascotaActiva.breed}).
              </p>
              <button
                type="button"
                onClick={() => setModalAgregarTarea(true)}
                className="inline-flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer"
              >
                <Plus size={14} />
                <span>Agregar tarea para {mascotaActiva.name}</span>
              </button>
            </div>
          ) : (
            tareasMascotaActiva.map((tarea) => {
              const { icon, bg } = obtenerIcono(tarea.iconType);
              return (
                <TaskItem
                  key={tarea._id}
                  taskName={tarea.title}
                  petName={mascotaActiva.name}
                  icon={icon}
                  iconBgColor={bg}
                  isCompleted={tarea.isCompleted}
                  onToggle={() => toggleTarea(tarea._id, user?.id)}
                  onDelete={() => eliminarTarea(tarea._id, user?.id)}
                />
              );
            })
          )}
        </div>
      </section>

      {/* Ventana flotante de información y personalización de la mascota */}
      <PetDetailModal
        abierto={Boolean(mascotaModalId)}
        onCerrar={() => setMascotaModalId(null)}
        mascotaId={mascotaModalId}
      />

      {/* Sub-ventana flotante para agregar mascota */}
      <PetFormModal
        abierto={modalAgregarMascota}
        onCerrar={() => setModalAgregarMascota(false)}
        mascotaEditar={null}
      />

      {/* Sub-ventana flotante para agregar tarea a la mascota seleccionada */}
      <TaskFormModal
        abierto={modalAgregarTarea}
        onCerrar={() => setModalAgregarTarea(false)}
        mascota={mascotaActiva}
      />
    </div>
  );
}
