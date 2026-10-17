// src/pages/Razas.tsx
import { useState } from 'react';
import { Search, Heart, Filter, PawPrint } from 'lucide-react';

export default function Razas() {
    const [categoria, setCategoria] = useState<'Perros' | 'Gatos' | 'Otros'>('Perros');
    const [busqueda, setBusqueda] = useState('');

    const listaRazas = [
        { name: 'Labrador', tipo: 'Perros', desc: 'Amigable y activo', img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=200&q=80' },
        { name: 'Golden Retriever', tipo: 'Perros', desc: 'Cariñoso y leal', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80' },
        { name: 'Bulldog', tipo: 'Perros', desc: 'Tranquilo y noble', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=200&q=80' },
        { name: 'Beagle', tipo: 'Perros', desc: 'Curioso y enérgico', img: 'https://images.unsplash.com/photo-1537151608804-ea6f23b207eb?auto=format&fit=crop&w=200&q=80' },
        { name: 'Poodle', tipo: 'Perros', desc: 'Inteligente y dócil', img: 'https://images.unsplash.com/photo-1616149562385-1d84e79478bb?auto=format&fit=crop&w=200&q=80' },
        { name: 'Pastor Alemán', tipo: 'Perros', desc: 'Valiente y protector', img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=200&q=80' },
        { name: 'Europeo', tipo: 'Gatos', desc: 'Cariñoso y adaptable', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80' },
        { name: 'Siamés', tipo: 'Gatos', desc: 'Sociable y curioso', img: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=200&q=80' },
    ];

    const otrosAnimales = [
        { name: 'Aves', desc: 'Canarios, loros, periquitos...', bg: 'bg-green-50', img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=200&q=80' },
        { name: 'Conejos', desc: 'Tiernos y juguetones', bg: 'bg-pink-50', img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=200&q=80' },
        { name: 'Hámsters', desc: 'Pequeños grandes amigos', bg: 'bg-orange-50', img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=200&q=80' },
        { name: 'Peces', desc: 'Acuáticos y cuidados', bg: 'bg-sky-50', img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80' },
        { name: 'Reptiles', desc: 'Iguanas, geckos, serpientes...', bg: 'bg-emerald-50', img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=200&q=80' },
        { name: 'Hurones', desc: 'Curiosos y activos', bg: 'bg-rose-50', img: 'https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?auto=format&fit=crop&w=200&q=80' },
    ];

    const razasFiltradas = listaRazas.filter(
        (r) =>
            r.tipo === categoria &&
            r.name.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 p-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pt-2">
            {categoria === 'Otros' ? 'Otros animales' : 'Razas'}
        </h1>
        
        {/* Botones de categoría */}
        <div className="flex gap-2 mb-4">
            <button
                type="button"
                onClick={() => setCategoria('Perros')}
                className={`flex-1 font-medium py-2 rounded-xl text-sm ${
                    categoria === 'Perros' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
                Perros
            </button>
            <button
                type="button"
                onClick={() => setCategoria('Gatos')}
                className={`flex-1 font-medium py-2 rounded-xl text-sm ${
                    categoria === 'Gatos' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
                Gatos
            </button>
            <button
                type="button"
                onClick={() => setCategoria('Otros')}
                className={`flex-1 font-medium py-2 rounded-xl text-sm ${
                    categoria === 'Otros' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
                Otros animales
            </button>
        </div>

        {categoria !== 'Otros' ? (
            <>
                {/* Buscador */}
                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar raza..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-sm"
                    />
                    </div>
                    <button className="bg-white p-2 rounded-xl border border-gray-200 text-gray-500">
                    <Filter size={18} />
                    </button>
                </div>

                {/* Cuadrícula de razas */}
                <div className="grid grid-cols-2 gap-4">
                    {razasFiltradas.map((raza, idx) => (
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
            </>
        ) : (
            <>
                {/* Cuadrícula de Otros Animales (Imagen 2) */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    {otrosAnimales.map((animal, idx) => (
                        <div key={idx} className={`${animal.bg} rounded-2xl p-3 border border-gray-100 shadow-xs`}>
                            <img src={animal.img} alt={animal.name} className="w-full h-24 object-cover rounded-xl mb-2" />
                            <h3 className="font-bold text-gray-900 text-sm">{animal.name}</h3>
                            <p className="text-xs text-gray-600">{animal.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-green-100 rounded-2xl p-4 flex items-center gap-3">
                    <PawPrint size={22} className="text-green-700 shrink-0" />
                    <p className="text-xs font-semibold text-green-900">
                        Todas las mascotas merecen un gran cuidado
                    </p>
                </div>
            </>
        )}
        </div>
    );
}