import { NavLink } from 'react-router-dom';
import { Home, PawPrint, Lightbulb, Search, User, Shield } from 'lucide-react';
import { useAuthStore, esUsuarioAdmin } from '../store/useAuthStore';

export default function BottomNav() {
  const user = useAuthStore((state) => state.user);
  const esAdmin = esUsuarioAdmin(user);

  const navItems = [
    { path: '/inicio', label: 'Inicio', icon: Home },
    { path: '/mascotas', label: 'Mis mascotas', icon: PawPrint },
    { path: '/recomendaciones', label: 'Tips', icon: Lightbulb },
    { path: '/razas', label: 'Razas', icon: Search },
    ...(esAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
    { path: '/perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 w-full bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    >
      <ul className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-green-700' : 'text-gray-400 hover:text-green-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium truncate max-w-[68px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
