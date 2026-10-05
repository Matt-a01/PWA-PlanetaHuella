// src/components/BottomNav.tsx
import { NavLink } from 'react-router-dom';
import { Home, PawPrint, Lightbulb, Search, User } from 'lucide-react';

export default function BottomNav() {
  // Definimos las rutas y sus respectivos iconos
    const navItems = [
        { path: '/inicio', label: 'Inicio', icon: Home },
        { path: '/mascotas', label: 'Mis mascotas', icon: PawPrint },
        { path: '/recomendaciones', label: 'Tips', icon: Lightbulb },
        { path: '/razas', label: 'Razas', icon: Search },
        { path: '/perfil', label: 'Perfil', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ul className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => (
            <li key={item.path} className="flex-1">
                <NavLink
                to={item.path}
                // isActive nos permite cambiar el color si el usuario está en esa página
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                    isActive ? 'text-green-700' : 'text-gray-400 hover:text-green-600'
                    }`
                }
                >
                {({ isActive }) => (
                    <>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                    </>
                )}
                </NavLink>
            </li>
            ))}
        </ul>
        </nav>
    );
}