import { useState } from 'react';
import { ChevronRight, Footprints, Sparkles, Heart } from 'lucide-react';
import { usePetStore } from '../store/usePetStore';

export default function Recomendaciones() {
  const pets = usePetStore((state) => state.pets);
  const [mascotaActiva, setMascotaActiva] = useState(0);

  const tips = [
    {
      title: 'Rutina de ejercicio',
      desc: 'Ideal para su raza',
      icon: <Footprints size={20} className="text-orange-500" />,
      bg: 'bg-orange-50',
    },
    {
      title: 'Cuidado del pelaje',
      desc: 'Mantén su pelaje sano y brillante',
      icon: <Sparkles size={20} className="text-amber-600" />,
      bg: 'bg-amber-50',
    },
    {
      title: 'Salud dental',
      desc: 'Previene problemas futuros',
      icon: <Heart size={20} className="text-rose-500" />,
      bg: 'bg-rose-50',
    },
  ];

  const mascota = pets[mascotaActiva] || {
    name: 'Luna',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80',
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24 p-5">
      <h1 className="text-2xl font-bold text-gray-900 mb-5 pt-2">Recomendaciones</h1>

      <div className="flex w-full justify-start border-b border-gray-200 mb-6">
        {pets.map((pet, idx) => (
          <button
            key={pet._id}
            type="button"
            onClick={() => setMascotaActiva(idx)}
            className={`pb-2.5 px-4 text-sm ${
              mascotaActiva === idx
                ? 'text-green-700 font-semibold border-b-2 border-green-700'
                : 'text-gray-400 font-medium'
            }`}
          >
            Para {pet.name}
          </button>
        ))}
      </div>

      <h2 className="text-gray-900 font-bold mb-3">Recomendado para {mascota.name}</h2>
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
                Alimentación saludable para su edad
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Una dieta balanceada ayuda a mantener su energía y salud.
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
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-xs border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 ${tip.bg} rounded-xl flex items-center justify-center`}>
                {tip.icon}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{tip.title}</p>
                <p className="text-xs text-gray-500">{tip.desc}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
