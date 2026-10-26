import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Bone, Droplet, Footprints, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import PetCard from '../components/PetCard';
import TaskItem from '../components/TaskItem';
import { useAuthStore } from '../store/useAuthStore';
import { usePetStore } from '../store/usePetStore';

export default function Inicio() {
  const user = useAuthStore((state) => state.user);
  const { pets, tasks, cargarDatos, agregarTarea, toggleTarea, eliminarTarea } = usePetStore();
  const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Juan';

  const [nuevaActividad, setNuevaActividad] = useState('');
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState('');

  useEffect(() => {
    cargarDatos(user?.id);
  }, [cargarDatos, user?.id]);

  useEffect(() => {
    if (pets.length > 0 && !mascotaSeleccionada) {
      setMascotaSeleccionada(pets[0]._id);
    }
  }, [pets, mascotaSeleccionada]);

  const obtenerIcono = (iconType: string) => {
    if (iconType === 'droplet') {
      return { icon: <Droplet size={20} className="text-blue-500" />, bg: 'bg-blue-50' };
    }
    if (iconType === 'footprints') {
      return { icon: <Footprints size={20} className="text-orange-500" />, bg: 'bg-orange-50' };
    }
    if (iconType === 'scissors') {
      return { icon: <Scissors size={20} className="text-yellow-600" />, bg: 'bg-yellow-50' };
    }
    return { icon: <Bone size={20} className="text-red-500" />, bg: 'bg-red-50' };
  };

  const manejarCrearTarea = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevaActividad.trim() || !mascotaSeleccionada) return;
    const petObj = pets.find((p) => p._id === mascotaSeleccionada);
    await agregarTarea(
      mascotaSeleccionada,
      petObj?.name || 'Mascota',
      nuevaActividad.trim(),
      user?.id
    );
    setNuevaActividad('');
  };

  return (
    <div className="p-5 pb-24 bg-[#F8FAFC] min-h-screen">
      <header className="flex justify-between items-center mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, {displayName}!</h1>
          <p className="text-gray-500 text-sm">Qué bueno tenerte aquí</p>
        </div>
        <Link
          to="/perfil"
          className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-100 flex items-center justify-center bg-green-100 text-green-700 font-bold hover:border-green-400 transition-colors"
        >
          {user?.fullName ? (
            <span>{user.fullName.charAt(0).toUpperCase()}</span>
          ) : (
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
              alt="Perfil"
            />
          )}
        </Link>
      </header>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Mis mascotas</h2>
          <Link to="/mascotas" className="text-sm text-gray-500 font-medium">
            Ver todas &gt;
          </Link>
        </div>

        <div className="flex overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {pets.map((pet) => (
            <PetCard
              key={pet._id}
              id={pet._id}
              name={pet.name}
              age={`${pet.age} años`}
              imageUrl={
                pet.imageUrl ||
                'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80'
              }
            />
          ))}

          <Link
            to="/AgregarMascota"
            className="flex flex-col items-center justify-center min-w-[100px] h-[120px] bg-green-50 rounded-2xl p-2 border border-green-100 border-dashed cursor-pointer"
          >
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <Plus size={24} />
            </div>
            <p className="text-xs font-semibold text-green-700">Agregar</p>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">Tareas de hoy</h2>
          <Link to="/mascotas" className="text-sm text-gray-500 font-medium">
            Personalizar por mascota &gt;
          </Link>
        </div>

        {/* Formulario rápido para agregar tareas personalizadas a cualquier mascota */}
        {pets.length > 0 && (
          <form onSubmit={manejarCrearTarea} className="flex gap-2 mb-4">
            <select
              value={mascotaSeleccionada}
              onChange={(e) => setMascotaSeleccionada(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-green-600"
            >
              {pets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={nuevaActividad}
              onChange={(e) => setNuevaActividad(e.target.value)}
              placeholder="Nueva tarea (ej. Dar vitaminas)..."
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-green-600"
            />
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              + Añadir
            </button>
          </form>
        )}

        <div className="flex flex-col">
          {tasks.map((tarea) => {
            const { icon, bg } = obtenerIcono(tarea.iconType);
            const nombreMascota = typeof tarea.petId === 'object' ? tarea.petId.name : 'Mascota';
            return (
              <TaskItem
                key={tarea._id}
                taskName={tarea.title}
                petName={nombreMascota}
                icon={icon}
                iconBgColor={bg}
                isCompleted={tarea.isCompleted}
                onToggle={() => toggleTarea(tarea._id, user?.id)}
                onDelete={() => eliminarTarea(tarea._id, user?.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
