// src/pages/Perfil.tsx
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ShieldCheck, LogOut, Database } from 'lucide-react';

export default function Perfil() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-5 pb-24 bg-[#F8FAFC] min-h-screen">
      {/* Encabezado */}
      <header className="mb-6 pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-sm text-gray-500">Información de tu cuenta sincronizada con la base de datos</p>
      </header>

      {/* Tarjeta de usuario */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-2xl mb-4 border-4 border-green-50 shadow-inner">
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {user?.fullName || 'Usuario Invitado'}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{user?.email || 'Sin correo asociado'}</p>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
          <Database size={13} />
          <span>Registrado en MongoDB Atlas</span>
        </div>
      </div>

      {/* Detalles de la cuenta */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 space-y-4">
        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Nombre completo</p>
            <p className="text-sm font-semibold text-gray-800">{user?.fullName || 'No disponible'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Correo electrónico</p>
            <p className="text-sm font-semibold text-gray-800">{user?.email || 'No disponible'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">ID en MongoDB</p>
            <p className="text-xs font-mono text-gray-600 truncate max-w-[220px]">
              {user?.id || 'Sesión no persistida'}
            </p>
          </div>
        </div>
      </div>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100 cursor-pointer"
      >
        <LogOut size={18} />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
}