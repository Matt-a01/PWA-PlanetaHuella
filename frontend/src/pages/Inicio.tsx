// src/pages/Inicio.tsx
import React from 'react';
import { Plus, Bone, Droplet, Footprints, Scissors } from 'lucide-react';
import PetCard from '../components/PetCard';
import TaskItem from '../components/TaskItem';


export default function Inicio() {
    return (
        // pb-24 asegura que el contenido no quede oculto por la barra inferior
        <div className="p-5 pb-24 bg-[#F8FAFC] min-h-screen">
        
        {/* SECCIÓN 1: Saludo y Perfil de Usuario */}
        <header className="flex justify-between items-center mb-8 pt-2">
            <div>
            <h1 className="text-2xl font-bold text-gray-900">¡Hola, Juan!</h1>
            <p className="text-gray-500 text-sm">Qué bueno tenerte aquí</p>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-100">
            <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" 
                alt="Perfil" 
            />
            </div>
        </header>

        {/* SECCIÓN 2: Mis Mascotas */}
        <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Mis mascotas</h2>
            <button className="text-sm text-gray-500 font-medium">Ver todas &gt;</button>
            </div>
            
            {/* Contenedor con scroll horizontal para las tarjetas */}
            <div className="flex overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            <PetCard 
                id="luna"
                name="Luna" 
                age="3 años" 
                imageUrl="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" 
            />
            <PetCard 
                id="milo"
                name="Milo" 
                age="2 años" 
                imageUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80" 
            />
            
            {/* Tarjeta especial para agregar nueva mascota */}
            <div className="flex flex-col items-center justify-center min-w-[100px] h-[120px] bg-green-50 rounded-2xl p-2 border border-green-100 border-dashed cursor-pointer">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <Plus size={24} />
                </div>
                <p className="text-xs font-semibold text-green-700">Agregar</p>
            </div>
            </div>
        </section>

        {/* SECCIÓN 3: Tareas de Hoy */}
        <section>
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Tareas de hoy</h2>
            <button className="text-sm text-gray-500 font-medium">Ver todas &gt;</button>
            </div>
            
            <div className="flex flex-col">
            <TaskItem 
                taskName="Dar comida" 
                petName="Luna" 
                icon={<Bone size={20} className="text-red-500" />} 
                iconBgColor="bg-red-50" 
            />
            <TaskItem 
                taskName="Cambiar agua" 
                petName="Milo" 
                icon={<Droplet size={20} className="text-blue-500" />} 
                iconBgColor="bg-blue-50" 
            />
            <TaskItem 
                taskName="Pasear" 
                petName="Luna" 
                icon={<Footprints size={20} className="text-orange-500" />} 
                iconBgColor="bg-orange-50" 
            />
            <TaskItem 
                taskName="Cepillar" 
                petName="Luna" 
                icon={<Scissors size={20} className="text-yellow-600" />} 
                iconBgColor="bg-yellow-50" 
            />
            </div>
        </section>
        
        </div>
    );
}