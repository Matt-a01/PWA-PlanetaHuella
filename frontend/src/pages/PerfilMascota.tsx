// src/pages/PetProfile.tsx
import { ChevronLeft, Edit2, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PetProfile() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
        {/* Encabezado con botón de retroceso */}
        <header className="flex justify-between items-center p-4 bg-white">
            <Link to="/" className="p-2 text-gray-600 hover:text-green-700">
            <ChevronLeft size={24} />
            </Link>
            <span className="font-semibold text-lg">Luna</span>
            <button className="p-2 text-gray-600 hover:text-green-700">
            <Edit2 size={20} />
            </button>
        </header>

        {/* Tarjeta principal de la mascota */}
        <div className="bg-white rounded-b-3xl p-6 shadow-sm flex flex-col items-center">
            <img 
            src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80" 
            alt="Luna" 
            className="w-24 h-24 object-cover rounded-full border-4 border-green-50 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">Luna</h2>
            <p className="text-gray-500 mb-4">Golden Retriever • 3 años • Hembra</p>

            {/* Pestañas de navegación interna */}
            <div className="flex w-full justify-between border-b border-gray-100">
            <button className="pb-2 text-gray-400 font-medium">Resumen</button>
            <button className="pb-2 text-green-600 font-semibold border-b-2 border-green-600">Salud</button>
            <button className="pb-2 text-gray-400 font-medium">Cuidados</button>
            <button className="pb-2 text-gray-400 font-medium">Galería</button>
            </div>
        </div>

        {/* Contenido de la pestaña Salud */}
        <div className="p-5">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <Activity size={20} />
                </div>
                <div>
                <p className="text-sm text-gray-500">Estado general</p>
                <p className="font-semibold text-gray-900">¡Está muy bien!</p>
                </div>
            </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-3 ml-1">Historial médico</h3>
            
            {/* Lista de eventos médicos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <div>
                <p className="font-semibold text-gray-900 text-sm">Última vacuna</p>
                <p className="text-xs text-gray-500">12 Feb 2024</p>
                </div>
                <Calendar size={18} className="text-gray-400" />
            </div>
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <div>
                <p className="font-semibold text-gray-900 text-sm">Última desparasitación</p>
                <p className="text-xs text-gray-500">10 Ene 2024</p>
                </div>
                <Calendar size={18} className="text-gray-400" />
            </div>
            <div className="p-4 flex justify-between items-center bg-green-50">
                <div>
                <p className="font-semibold text-green-800 text-sm">Próxima cita</p>
                <p className="text-xs text-green-600">15 Oct 2024</p>
                </div>
                <Calendar size={18} className="text-green-600" />
            </div>
            </div>
        </div>
        </div>
    );
}