// frontend/src/store/usePetStore.ts
import { create } from 'zustand';

const isLocalhost =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const rawEnvUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '');
const API_BASE = rawEnvUrl
  ? rawEnvUrl.replace(/\/api\/auth$/, '/api').replace(/(?<!\/api)$/, '/api')
  : isLocalhost
    ? 'http://localhost:3000/api'
    : '';

export interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  imageUrl: string;
}

export interface Task {
  _id: string;
  title: string;
  isCompleted: boolean;
  iconType: string;
  petId: { _id: string; name: string } | string;
}

// Datos de muestra por defecto si aún no hay registros en la base de datos
const mascotasIniciales: Pet[] = [
  {
    _id: 'luna',
    name: 'Luna',
    species: 'Perro',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Hembra',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'milo',
    name: 'Milo',
    species: 'Gato',
    breed: 'Europeo',
    age: 2,
    gender: 'Macho',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80',
  },
];

const tareasIniciales: Task[] = [
  { _id: 't1', title: 'Dar comida', isCompleted: false, iconType: 'bone', petId: { _id: 'luna', name: 'Luna' } },
  { _id: 't2', title: 'Cambiar agua', isCompleted: false, iconType: 'droplet', petId: { _id: 'milo', name: 'Milo' } },
  { _id: 't3', title: 'Pasear', isCompleted: false, iconType: 'footprints', petId: { _id: 'luna', name: 'Luna' } },
  { _id: 't4', title: 'Cepillar', isCompleted: false, iconType: 'scissors', petId: { _id: 'luna', name: 'Luna' } },
];

interface PetState {
  pets: Pet[];
  tasks: Task[];
  cargarDatos: (ownerId?: string) => Promise<void>;
  agregarMascota: (nueva: Omit<Pet, '_id'>, ownerId?: string) => Promise<void>;
  eliminarMascota: (id: string) => Promise<void>;
  toggleTarea: (id: string) => Promise<void>;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: mascotasIniciales,
  tasks: tareasIniciales,

  cargarDatos: async (ownerId?: string) => {
    if (!API_BASE) return;
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : '';
      const [resPets, resTasks] = await Promise.all([
        fetch(`${API_BASE}/pets${query}`),
        fetch(`${API_BASE}/tasks${query}`),
      ]);

      const dataPets = await resPets.json();
      const dataTasks = await resTasks.json();

      if (dataPets.ok && dataPets.pets.length > 0) {
        set({ pets: dataPets.pets });
      }
      if (dataTasks.ok && dataTasks.tasks.length > 0) {
        set({ tasks: dataTasks.tasks });
      }
    } catch {
      // Si el backend no está activo, se mantienen las mascotas de ejemplo en memoria
    }
  },

  agregarMascota: async (nueva, ownerId) => {
    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/pets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...nueva, ownerId: ownerId || '000000000000000000000001' }),
        });
        const data = await response.json();
        if (data.ok && data.pet) {
          set({ pets: [...get().pets, data.pet] });
          await get().cargarDatos(ownerId);
          return;
        }
      } catch {
        // Respaldo local en caso de estar sin servidor
      }
    }

    const mascotaLocal: Pet = { ...nueva, _id: String(Date.now()) };
    set({ pets: [...get().pets, mascotaLocal] });
  },

  eliminarMascota: async (id) => {
    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/pets/${id}`, { method: 'DELETE' });
      } catch {
        // Continúa borrado en cliente
      }
    }
    set({ pets: get().pets.filter((p) => p._id !== id) });
  },

  toggleTarea: async (id) => {
    set({
      tasks: get().tasks.map((t) =>
        t._id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    });

    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'PATCH' });
      } catch {
        // Se mantiene el cambio en la interfaz
      }
    }
  },
}));
