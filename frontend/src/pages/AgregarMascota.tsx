// src/pages/AgregarMascota.tsx
import { ChevronLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AgregarMascota() {
    return (
        <div className="min-h-screen bg-white pb-20">
        <header className="flex items-center p-4">
            <Link to="/" className="text-gray-900 mr-4">
            <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Agregar mascota</h1>
        </header>

        <div className="p-5">
            {/* Selector de foto */}
            <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-2 border-dashed border-green-200">
                <Camera size={32} className="text-green-600" />
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
                <Camera size={14} className="text-gray-600" />
                </div>
            </div>
            </div>

            {/* Formulario */}
            <form className="space-y-4">
            <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                <input type="text" placeholder="Ej. Luna" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 focus:outline-none" />
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">Especie</label>
                <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 focus:outline-none appearance-none">
                <option>Perro</option>
                <option>Gato</option>
                </select>
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">Raza</label>
                <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 focus:outline-none appearance-none">
                <option>Golden Retriever</option>
                <option>Labrador</option>
                </select>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Edad</label>
                <div className="flex bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                    <input type="number" placeholder="3" className="w-16 p-3 bg-transparent text-center focus:outline-none" />
                    <div className="flex items-center px-3 text-gray-500 border-l border-gray-200">años</div>
                </div>
                </div>
                
                <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Sexo</label>
                <div className="flex gap-2">
                    <button type="button" className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">Macho</button>
                    <button type="button" className="flex-1 py-2 rounded-xl bg-green-50 border border-green-600 text-green-700 font-medium">Hembra</button>
                </div>
                </div>
            </div>

            <button type="button" className="w-full bg-green-700 text-white font-semibold py-4 rounded-xl mt-6 hover:bg-green-800 transition-colors">
                Guardar mascota
            </button>
            </form>
        </div>
        </div>
    );
}