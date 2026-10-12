// src/pages/recomendaciones.tsx
import { ChevronRight } from 'lucide-react';

export default function recomendaciones() {
    const tips = [
        { title: "Rutina de ejercicio", desc: "Ideal para su raza" },
        { title: "Cuidado del pelaje", desc: "Mantén su pelaje sano y brillante" },
        { title: "Salud dental", desc: "Previene problemas futuros" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 p-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-2">Recomendaciones</h1>
        
        {/* Pestañas */}
        <div className="flex w-full justify-start border-b border-gray-200 mb-6">
            <button className="pb-2 px-4 text-green-700 font-semibold border-b-2 border-green-700">Para Luna</button>
            <button className="pb-2 px-4 text-gray-400 font-medium">Para Milo</button>
        </div>

        {/* Tarjeta destacada */}
        <h2 className="text-gray-900 font-bold mb-3">Recomendado para Luna</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 mb-8">
            <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" alt="Luna" className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-sm text-gray-900">Alimentación saludable para su edad</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">Una dieta balanceada ayuda a mantener su energía y salud.</p>
            </div>
            <button className="bg-green-700 text-white text-xs font-semibold py-1.5 px-4 rounded-lg self-start mt-2">Ver más</button>
            </div>
        </div>

        {/* Lista de consejos */}
        <h2 className="text-gray-900 font-bold mb-3">Consejos rápidos</h2>
        <div className="space-y-3">
            {tips.map((tip, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 font-bold">{index + 1}</div>
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