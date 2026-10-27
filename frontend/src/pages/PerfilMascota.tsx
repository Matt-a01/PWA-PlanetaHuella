import { useState } from 'react';
import { ChevronLeft, Edit2, Activity, Calendar, Heart, CheckCircle2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/usePetStore';

export default function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pets = usePetStore((state) => state.pets);
  const [tabActiva, setTabActiva] = useState<'resumen' | 'salud' | 'cuidados' | 'galeria'>('resumen');

  const mascota = pets.find((p) => p._id === id) || pets[0] || {
    _id: 'luna',
    name: 'Luna',
    species: 'Perro',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Hembra',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
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
        <p className="text-sm text-gray-500 mb-4">
          {mascota.breed} • {mascota.age} años • {mascota.gender}
        </p>

        <div className="flex w-full justify-between border-b border-gray-100 text-sm">
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
                className={`pb-2.5 px-2 font-medium ${
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
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 space-y-3 text-sm text-gray-700">
            <p className="font-bold text-gray-900">Rutina diaria recomendada</p>
            <p>• Alimentación balanceada 2 veces al día.</p>
            <p>• Agua fresca disponible en todo momento.</p>
            <p>• Paseo diario de 30 a 45 minutos.</p>
            <p>• Cepillado frecuente de pelaje.</p>
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
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Última vacuna</p>
                    <p className="text-xs text-gray-500">12 Feb 2024</p>
                  </div>
                </div>
                <Calendar size={18} className="text-gray-400" />
              </div>

              <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Última desparasitación</p>
                    <p className="text-xs text-gray-500">10 Ene 2024</p>
                  </div>
                </div>
                <Calendar size={18} className="text-gray-400" />
              </div>

              <div className="p-4 flex justify-between items-center bg-green-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Próxima cita</p>
                    <p className="text-xs text-green-600">15 Oct 2024</p>
                  </div>
                </div>
              </div>
            </div>
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
