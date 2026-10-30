import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, PawPrint } from 'lucide-react';
import PetAvatar from '../components/PetAvatar';
import PetFormModal from '../components/PetFormModal';
import PetDetailModal from '../components/PetDetailModal';
import { usePetStore, type Pet } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Mascotas() {
  const user = useAuthStore((state) => state.user);
  const { pets, cargarDatos, eliminarMascota } = usePetStore();

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [mascotaEditar, setMascotaEditar] = useState<Pet | null>(null);
  const [mascotaDetalleId, setMascotaDetalleId] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos(user?.id);
  }, [cargarDatos, user?.id]);

  const abrirAgregar = () => {
    setMascotaEditar(null);
    setModalFormAbierto(true);
  };

  const abrirEditar = (pet: Pet) => {
    setMascotaEditar(pet);
    setModalFormAbierto(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 pb-24">
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis mascotas</h1>
          <p className="text-xs text-gray-500">
            Administra los perfiles, fotos y cuidados de tus compañeros
          </p>
        </div>
        <button
          type="button"
          onClick={abrirAgregar}
          className="flex items-center gap-1 bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-green-800 transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>Agregar</span>
        </button>
      </header>

      {pets.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs">
          <PawPrint size={32} className="mx-auto text-green-600 mb-2" />
          <p className="text-sm font-semibold text-gray-800">Aún no tienes mascotas registradas</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Agrega a tu primera mascota para personalizar sus tareas y controles médicos.
          </p>
          <button
            type="button"
            onClick={abrirAgregar}
            className="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full cursor-pointer"
          >
            <Plus size={15} />
            <span>Agregar mascota</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {pets.map((pet) => (
            <div
              key={pet._id}
              onClick={() => setMascotaDetalleId(pet._id)}
              className="group bg-white rounded-3xl p-3 shadow-xs border border-gray-100 hover:border-green-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative"
            >
              <div>
                <PetAvatar
                  imageUrl={pet.imageUrl}
                  name={pet.name}
                  species={pet.species}
                  className="w-full h-36 sm:h-40 rounded-2xl mb-2.5"
                  imgClassName="group-hover:scale-105 transition-transform duration-300"
                  iconSize={56}
                />
                <div className="px-1">
                  <h2 className="font-bold text-gray-900 text-base truncate">{pet.name}</h2>
                  <p className="text-xs text-gray-500 truncate">
                    {pet.species} • {pet.breed}
                  </p>
                  <p className="text-[11px] text-green-700 font-medium mt-0.5">
                    {pet.age} {pet.age === 1 ? 'año' : 'años'} • {pet.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirEditar(pet);
                  }}
                  className="p-2 rounded-xl text-gray-500 hover:text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                  title="Editar mascota"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarMascota(pet._id, user?.id);
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Eliminar mascota"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ventana flotante de ficha y personalización */}
      <PetDetailModal
        abierto={Boolean(mascotaDetalleId)}
        onCerrar={() => setMascotaDetalleId(null)}
        mascotaId={mascotaDetalleId}
      />

      {/* Sub-ventana flotante para agregar o editar mascota */}
      <PetFormModal
        abierto={modalFormAbierto}
        onCerrar={() => setModalFormAbierto(false)}
        mascotaEditar={mascotaEditar}
      />
    </div>
  );
}
