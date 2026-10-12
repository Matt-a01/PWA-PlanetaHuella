// src/pages/Razas.tsx
import { Search, Heart, Filter } from 'lucide-react';

export default function Razas() {
    const Razas = [
        { name: "Labrador", desc: "Amigable y activo", img: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=150&q=80" },
        { name: "Golden Retriever", desc: "Cariñoso y leal", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" },
        { name: "Bulldog", desc: "Tranquilo y noble", img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=150&q=80" },
        { name: "Beagle", desc: "Curioso y enérgico", img: "https://images.unsplash.com/photo-1537151608804-ea6f23b207eb?auto=format&fit=crop&w=150&q=80" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 p-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-2">Razas</h1>
        
        {/* Botones de categoría */}
        <div className="flex gap-2 mb-4">
            <button className="flex-1 bg-green-700 text-white font-medium py-2 rounded-xl">Perros</button>
            <button className="flex-1 bg-white text-gray-600 font-medium py-2 rounded-xl border border-gray-200">Gatos</button>
        </div>

        {/* Buscador */}
        <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar raza..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-sm" />
            </div>
            <button className="bg-white p-2 rounded-xl border border-gray-200 text-gray-500">
            <Filter size={18} />
            </button>
        </div>

        {/* Cuadrícula de razas */}
        <div className="grid grid-cols-2 gap-4">
            {Razas.map((raza, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 relative">
                <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm text-gray-400 hover:text-red-500 z-10">
                <Heart size={14} />
                </button>
                <img src={raza.img} alt={raza.name} className="w-full h-28 object-cover rounded-xl mb-2" />
                <div className="px-1 pb-1">
                <h3 className="font-bold text-gray-900 text-sm">{raza.name}</h3>
                <p className="text-xs text-gray-500">{raza.desc}</p>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}