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
  ownerId?: string;
}

export interface Task {
  _id: string;
  title: string;
  isCompleted: boolean;
  iconType: string;
  petId: { _id: string; name: string } | string;
}

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

// Almacenamiento local aislado por usuario como respaldo cuando no hay conexión con el servidor
const obtenerClaveUsuario = (ownerId?: string) => `planeta_huella_pets_${ownerId || 'invitado'}`;

const leerMascotasUsuario = (ownerId?: string): Pet[] | null => {
  try {
    const guardado = localStorage.getItem(obtenerClaveUsuario(ownerId));
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
};

const guardarMascotasUsuario = (pets: Pet[], ownerId?: string) => {
  try {
    localStorage.setItem(obtenerClaveUsuario(ownerId), JSON.stringify(pets));
  } catch {
    // Evita bloquear la interfaz si el almacenamiento del navegador está lleno
  }
};

interface PetState {
  pets: Pet[];
  tasks: Task[];
  cargarDatos: (ownerId?: string) => Promise<void>;
  agregarMascota: (nueva: Omit<Pet, '_id'>, ownerId?: string) => Promise<void>;
  actualizarMascota: (id: string, datos: Omit<Pet, '_id'>, ownerId?: string) => Promise<void>;
  eliminarMascota: (id: string, ownerId?: string) => Promise<void>;
  toggleTarea: (id: string) => Promise<void>;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: mascotasIniciales,
  tasks: tareasIniciales,

  cargarDatos: async (ownerId?: string) => {
    const guardadasLocal = leerMascotasUsuario(ownerId);
    if (guardadasLocal && guardadasLocal.length > 0) {
      set({ pets: guardadasLocal });
    }

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
        guardarMascotasUsuario(dataPets.pets, ownerId);
      }
      if (dataTasks.ok && dataTasks.tasks.length > 0) {
        set({ tasks: dataTasks.tasks });
      }
    } catch {
      // Mantiene los datos cargados previamente si el backend no responde
    }
  },

  agregarMascota: async (nueva, ownerId) => {
    const idUsuario = ownerId || '000000000000000000000001';

    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/pets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...nueva, ownerId: idUsuario }),
        });
        const data = await response.json();
        if (data.ok && data.pet) {
          const nuevaLista = [...get().pets, data.pet];
          set({ pets: nuevaLista });
          guardarMascotasUsuario(nuevaLista, ownerId);
          await get().cargarDatos(ownerId);
          return;
        }
      } catch {
        // Continúa con el guardado local si no hay red
      }
    }

    const mascotaLocal: Pet = { ...nueva, _id: String(Date.now()), ownerId: idUsuario };
    const nuevaLista = [...get().pets, mascotaLocal];
    set({ pets: nuevaLista });
    guardarMascotasUsuario(nuevaLista, ownerId);
  },

  // Actualiza los datos de la mascota y sobrescribe su foto anterior en la base de datos
  actualizarMascota: async (id, datos, ownerId) => {
    const idUsuario = ownerId || '000000000000000000000001';

    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/pets/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...datos, ownerId: idUsuario }),
        });
        const data = await response.json();
        if (data.ok && data.pet) {
          const listaActualizada = get().pets.map((p) => (p._id === id ? data.pet : p));
          set({ pets: listaActualizada });
          guardarMascotasUsuario(listaActualizada, ownerId);
          return;
        }
      } catch {
        // Continúa con la actualización local si no hay red
      }
    }

    const listaActualizada = get().pets.map((p) =>
      p._id === id ? { ...p, ...datos, _id: id, ownerId: idUsuario } : p
    );
    set({ pets: listaActualizada });
    guardarMascotasUsuario(listaActualizada, ownerId);
  },

  eliminarMascota: async (id, ownerId) => {
    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/pets/${id}`, { method: 'DELETE' });
      } catch {
        // Continúa con la eliminación en el estado local
      }
    }
    const listaFiltrada = get().pets.filter((p) => p._id !== id);
    set({ pets: listaFiltrada });
    guardarMascotasUsuario(listaFiltrada, ownerId);
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
        // Conserva el cambio visual en caso de desconexión
      }
    }
  },
}));
