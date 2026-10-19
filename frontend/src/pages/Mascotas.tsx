// src/pages/Mascotas.tsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { usePetStore } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Mascotas() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const { pets, cargarDatos, eliminarMascota } = usePetStore();

    useEffect(() => {
        cargarDatos(user?.id);
    }, [cargarDatos, user?.id]);

    return (
        // El padding-bottom (pb-24) evita que el contenido quede oculto detrás de la barra de navegación
        <div className="min-h-screen bg-[#F8FAFC] p-5 pb-24">
            {/* Encabezado con botón Agregar */}
            <header className="flex justify-between items-center mb-6 pt-2">
                <h1 className="text-2xl font-bold text-gray-900">Mis mascotas</h1>
                <Link
                    to="/AgregarMascota"
                    className="flex items-center gap-1 bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-green-800 transition-colors"
                >
                    <Plus size={16} />
                    <span>Agregar</span>
                </Link>
            </header>

            {/* Lista de mascotas */}
            <div className="space-y-3">
                {pets.map((pet) => (
                    <div
                        key={pet._id}
                        onClick={() => navigate(`/mascota/${pet._id}`)}
                        className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-3.5">
                            <img
                                src={pet.imageUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80'}
                                alt={pet.name}
                                className="w-16 h-16 rounded-2xl object-cover"
                            />
                            <div>
                                <h2 className="font-bold text-gray-900 text-base">{pet.name}</h2>
                                <p className="text-xs text-gray-500">
                                    {pet.species} • {pet.breed}
                                </p>
                                <p className="text-xs text-gray-400">{pet.age} años</p>
                            </div>
                        </div>

                        {/* Botones de editar y eliminar */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/AgregarMascota?id=${pet._id}`);
                                }}
                                className="p-2 text-gray-400 hover:text-green-700"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarMascota(pet._id, user?.id);
                                }}
                                className="p-2 text-red-400 hover:text-red-600"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}