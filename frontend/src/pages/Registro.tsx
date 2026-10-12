// src/pages/Registro.tsx
import { ChevronLeft, Eye, Mail, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Registro() {
    return (
        <div className="min-h-screen bg-white p-5">
        {/* Botón de retroceso */}
        <header className="mb-6 pt-2">
            <Link to="/" className="text-gray-900">
            <ChevronLeft size={28} />
            </Link>
        </header>

        {/* Títulos */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
            <p className="text-gray-500">Únete a PetCare y comienza a cuidar mejor a tus mascotas</p>
        </div>

        {/* Formulario */}
        <form className="space-y-4">
            <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Nombre completo" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            </div>

            <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            </div>

            <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input 
                type="password" 
                placeholder="Contraseña (Mínimo 6 caracteres)" 
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <Eye className="absolute right-3 top-3.5 text-gray-400 cursor-pointer" size={20} />
            </div>

            <button type="button" className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-xl mt-4 hover:bg-green-800 transition-colors">
            Registrarme
            </button>
        </form>

        {/* Separador y redes sociales */}
        <div className="mt-8">
            <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-sm text-gray-500 relative">O regístrate con</span>
            </div>
            
            <div className="flex gap-4 mt-6">
            <button className="flex-1 py-3 border border-gray-200 rounded-xl flex justify-center items-center hover:bg-gray-50">
                <span className="font-bold text-gray-700">G</span> {/* Placeholder de Google */}
            </button>
            <button className="flex-1 py-3 border border-gray-200 rounded-xl flex justify-center items-center hover:bg-gray-50">
                <span className="font-bold text-gray-900"></span> {/* Placeholder de Apple */}
            </button>
            </div>
        </div>
        </div>
    );
}