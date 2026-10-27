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
  characteristics?: string;
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

export interface MedicalRecordItem {
  _id: string;
  type: string;
  date: string;
  notes?: string;
  petId: string;
}

export interface BreedItem {
  _id: string;
  name: string;
  category: 'Perros' | 'Gatos' | 'Otros';
  desc: string;
  img: string;
  bg?: string;
  suggestedTasks: string[];
}

export interface TipItem {
  _id: string;
  title: string;
  desc: string;
  detail?: string;
  species?: string;
  iconType: string;
}

const razasPorDefecto: BreedItem[] = [
  {
    _id: 'r1',
    name: 'Labrador',
    category: 'Perros',
    desc: 'Amigable y activo',
    img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Paseo activo de 45 min', 'Juego de cobro con pelota'],
  },
  {
    _id: 'r2',
    name: 'Golden Retriever',
    category: 'Perros',
    desc: 'Cariñoso y leal',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Paseo diario de 40 min', 'Cepillar pelaje largo'],
  },
  {
    _id: 'r3',
    name: 'Bulldog',
    category: 'Perros',
    desc: 'Tranquilo y noble',
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Porción medida de comida', 'Agua fresca', 'Caminata suave de 20 min', 'Limpiar pliegues faciales'],
  },
  {
    _id: 'r4',
    name: 'Beagle',
    category: 'Perros',
    desc: 'Curioso y enérgico',
    img: 'https://images.unsplash.com/photo-1537151608804-ea6f23b207eb?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Paseo de exploración y olfato', 'Revisar orejas caídas'],
  },
  {
    _id: 'r5',
    name: 'Poodle',
    category: 'Perros',
    desc: 'Inteligente y dócil',
    img: 'https://images.unsplash.com/photo-1616149562385-1d84e79478bb?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Dar alimento balanceado', 'Agua fresca', 'Desenredar pelaje rizado', 'Juego de estimulación mental'],
  },
  {
    _id: 'r6',
    name: 'Pastor Alemán',
    category: 'Perros',
    desc: 'Valiente y protector',
    img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Ración alta en proteína', 'Agua fresca', 'Ejercicio físico intenso', 'Cepillado de subpelo'],
  },
  {
    _id: 'r7',
    name: 'Europeo',
    category: 'Gatos',
    desc: 'Cariñoso y adaptable',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Servir alimento para gato', 'Renovar agua fresca', 'Limpiar caja de arena', 'Jugar con caña o rascador'],
  },
  {
    _id: 'r8',
    name: 'Siamés',
    category: 'Gatos',
    desc: 'Sociable y curioso',
    img: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Servir alimento húmedo/seco', 'Renovar agua fresca', 'Limpiar arenero', 'Sesión de juego interactivo'],
  },
  {
    _id: 'o1',
    name: 'Aves',
    category: 'Otros',
    desc: 'Canarios, loros, periquitos...',
    bg: 'bg-green-50',
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Cambiar semillas y fruta', 'Lavar bebedero de agua', 'Limpiar bandeja de la jaula'],
  },
  {
    _id: 'o2',
    name: 'Conejos',
    category: 'Otros',
    desc: 'Tiernos y juguetones',
    bg: 'bg-pink-50',
    img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Rellenar heno fresco', 'Dar hojas verdes lavadas', 'Agua limpia en bebedero', 'Cepillar y revisar dientes'],
  },
  {
    _id: 'o3',
    name: 'Hámsters',
    category: 'Otros',
    desc: 'Pequeños grandes amigos',
    bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Servir mezcla de semillas', 'Revisar bebedero de gota', 'Limpiar rincón húmedo del sustrato'],
  },
  {
    _id: 'o4',
    name: 'Peces',
    category: 'Otros',
    desc: 'Acuáticos y cuidados',
    bg: 'bg-sky-50',
    img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Alimentar en pequeñas dosis', 'Verificar filtro y temperatura', 'Retirar restos de comida'],
  },
  {
    _id: 'o5',
    name: 'Reptiles',
    category: 'Otros',
    desc: 'Iguanas, geckos, serpientes...',
    bg: 'bg-emerald-50',
    img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Revisar lámpara térmica UVB', 'Rociar humedad en terrario', 'Ofrecer alimento según especie'],
  },
  {
    _id: 'o6',
    name: 'Hurones',
    category: 'Otros',
    desc: 'Curiosos y activos',
    bg: 'bg-rose-50',
    img: 'https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?auto=format&fit=crop&w=200&q=80',
    suggestedTasks: ['Dar comida alta en proteína', 'Agua fresca', 'Tiempo de juego fuera de jaula', 'Limpiar esquinero'],
  },
];

const tipsPorDefecto: TipItem[] = [
  {
    _id: 'tip1',
    title: 'Rutina de ejercicio',
    desc: 'Ideal para su raza y nivel de energía',
    detail: 'Dedica entre 30 y 45 minutos diarios a paseos o juegos activos según la edad y raza de tu mascota.',
    species: 'Todos',
    iconType: 'footprints',
  },
  {
    _id: 'tip2',
    title: 'Cuidado del pelaje',
    desc: 'Mantén su pelaje sano y libre de nudos',
    detail: 'Cepilla de 2 a 3 veces por semana en razas de pelo corto y diariamente en razas de pelo largo.',
    species: 'Todos',
    iconType: 'sparkles',
  },
  {
    _id: 'tip3',
    title: 'Salud dental e higiene',
    desc: 'Previene acumulación de sarro e infecciones',
    detail: 'Revisa encías, dientes y orejas cada semana para detectar molestias a tiempo.',
    species: 'Todos',
    iconType: 'heart',
  },
];

const mascotasIniciales: Pet[] = [
  {
    _id: 'luna',
    name: 'Luna',
    species: 'Perro',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Hembra',
    characteristics: 'Muy juguetona y de pelaje largo',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'milo',
    name: 'Milo',
    species: 'Gato',
    breed: 'Europeo',
    age: 2,
    gender: 'Macho',
    characteristics: 'Tranquilo, le gusta dormir junto a la ventana',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80',
  },
];

const tareasIniciales: Task[] = [
  { _id: 't1', title: 'Dar alimento balanceado', isCompleted: false, iconType: 'bone', petId: { _id: 'luna', name: 'Luna' } },
  { _id: 't2', title: 'Limpiar caja de arena', isCompleted: false, iconType: 'scissors', petId: { _id: 'milo', name: 'Milo' } },
  { _id: 't3', title: 'Paseo diario de 40 min', isCompleted: false, iconType: 'footprints', petId: { _id: 'luna', name: 'Luna' } },
  { _id: 't4', title: 'Cepillar pelaje largo', isCompleted: false, iconType: 'scissors', petId: { _id: 'luna', name: 'Luna' } },
];

const detectarIcono = (titulo: string): string => {
  const t = titulo.toLowerCase();
  if (t.includes('agua') || t.includes('bebedero') || t.includes('humedad') || t.includes('filtro')) return 'droplet';
  if (t.includes('paseo') || t.includes('caminata') || t.includes('ejercicio') || t.includes('juego') || t.includes('jugar')) return 'footprints';
  if (t.includes('cepillar') || t.includes('pelaje') || t.includes('limpiar') || t.includes('arenero') || t.includes('jaula') || t.includes('dientes')) return 'scissors';
  return 'bone';
};

// Persistencia local por usuario como respaldo cuando el backend no está conectado
const leerJSON = <T,>(clave: string, respaldo: T): T => {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : respaldo;
  } catch {
    return respaldo;
  }
};

const guardarJSON = (clave: string, valor: unknown) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Evita bloquear la interfaz si el almacenamiento local está lleno
  }
};

interface PetState {
  pets: Pet[];
  tasks: Task[];
  medicalRecords: Record<string, MedicalRecordItem[]>;
  catalogRazas: BreedItem[];
  catalogTips: TipItem[];
  cargarDatos: (ownerId?: string) => Promise<void>;
  cargarCatalogo: () => Promise<void>;
  obtenerTareasSugeridas: (species: string, breed: string) => string[];
  agregarMascota: (nueva: Omit<Pet, '_id'>, ownerId?: string, customTasks?: string[]) => Promise<void>;
  actualizarMascota: (id: string, datos: Omit<Pet, '_id'>, ownerId?: string) => Promise<void>;
  eliminarMascota: (id: string, ownerId?: string) => Promise<void>;
  agregarTarea: (petId: string, petName: string, title: string, ownerId?: string) => Promise<void>;
  toggleTarea: (id: string, ownerId?: string) => Promise<void>;
  eliminarTarea: (id: string, ownerId?: string) => Promise<void>;
  cargarRegistrosMedicos: (petId: string) => Promise<void>;
  agregarRegistroMedico: (petId: string, type: string, date: string, notes?: string) => Promise<void>;
  eliminarRegistroMedico: (petId: string, recordId: string) => Promise<void>;
  agregarRazaCatalogo: (nueva: Omit<BreedItem, '_id'>) => Promise<void>;
  eliminarRazaCatalogo: (id: string) => Promise<void>;
  agregarTipCatalogo: (nuevo: Omit<TipItem, '_id'>) => Promise<void>;
  eliminarTipCatalogo: (id: string) => Promise<void>;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: leerJSON('ph_pets_invitado', mascotasIniciales),
  tasks: leerJSON('ph_tasks_invitado', tareasIniciales),
  medicalRecords: leerJSON('ph_medical_records', {}),
  catalogRazas: leerJSON('ph_catalog_razas', razasPorDefecto),
  catalogTips: leerJSON('ph_catalog_tips', tipsPorDefecto),

  cargarCatalogo: async () => {
    if (!API_BASE) return;
    try {
      const [resRazas, resTips] = await Promise.all([
        fetch(`${API_BASE}/catalog/razas`),
        fetch(`${API_BASE}/catalog/recomendaciones`),
      ]);
      const dataRazas = await resRazas.json();
      const dataTips = await resTips.json();

      if (dataRazas.ok && Array.isArray(dataRazas.items)) {
        set({ catalogRazas: dataRazas.items });
        guardarJSON('ph_catalog_razas', dataRazas.items);
      }
      if (dataTips.ok && Array.isArray(dataTips.recomendaciones)) {
        set({ catalogTips: dataTips.recomendaciones });
        guardarJSON('ph_catalog_tips', dataTips.recomendaciones);
      }
    } catch {
      // Usa el catálogo guardado en caso de desconexión
    }
  },

  obtenerTareasSugeridas: (species: string, breed: string) => {
    const { catalogRazas } = get();
    const porRaza = catalogRazas.find(
      (r) => r.name.toLowerCase() === breed.toLowerCase()
    );
    if (porRaza && porRaza.suggestedTasks.length > 0) {
      return porRaza.suggestedTasks;
    }

    const porEspecie = catalogRazas.find(
      (r) => r.name.toLowerCase().includes(species.toLowerCase())
    );
    if (porEspecie && porEspecie.suggestedTasks.length > 0) {
      return porEspecie.suggestedTasks;
    }

    if (species === 'Gato') {
      return ['Servir alimento para gato', 'Renovar agua fresca', 'Limpiar caja de arena', 'Cepillar pelaje'];
    }
    if (species === 'Conejo') {
      return ['Rellenar heno fresco', 'Renovar agua del bebedero', 'Limpiar espacio y revisar dientes'];
    }
    if (species === 'Ave') {
      return ['Cambiar semillas y fruta', 'Lavar bebedero de agua', 'Limpiar bandeja de la jaula'];
    }
    return ['Dar alimento balanceado', 'Renovar agua fresca', 'Paseo diario de 30 min', 'Cepillar pelaje'];
  },

  cargarDatos: async (ownerId?: string) => {
    const clavePets = `ph_pets_${ownerId || 'invitado'}`;
    const claveTasks = `ph_tasks_${ownerId || 'invitado'}`;

    const guardadasPets = leerJSON<Pet[] | null>(clavePets, null);
    const guardadasTasks = leerJSON<Task[] | null>(claveTasks, null);

    if (guardadasPets) set({ pets: guardadasPets });
    if (guardadasTasks) set({ tasks: guardadasTasks });

    await get().cargarCatalogo();

    if (!API_BASE || !ownerId) return;
    try {
      const [resPets, resTasks] = await Promise.all([
        fetch(`${API_BASE}/pets?ownerId=${ownerId}`),
        fetch(`${API_BASE}/tasks?ownerId=${ownerId}`),
      ]);

      const dataPets = await resPets.json();
      const dataTasks = await resTasks.json();

      if (dataPets.ok && Array.isArray(dataPets.pets) && dataPets.pets.length > 0) {
        set({ pets: dataPets.pets });
        guardarJSON(clavePets, dataPets.pets);
      }
      if (dataTasks.ok && Array.isArray(dataTasks.tasks) && dataTasks.tasks.length > 0) {
        set({ tasks: dataTasks.tasks });
        guardarJSON(claveTasks, dataTasks.tasks);
      }
    } catch {
      // Mantiene los datos locales del usuario
    }
  },

  agregarMascota: async (nueva, ownerId, customTasks) => {
    const idUsuario = ownerId || '000000000000000000000001';
    const clavePets = `ph_pets_${ownerId || 'invitado'}`;
    const claveTasks = `ph_tasks_${ownerId || 'invitado'}`;
    const tareasElegidas =
      customTasks && customTasks.length > 0
        ? customTasks
        : get().obtenerTareasSugeridas(nueva.species, nueva.breed);

    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/pets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...nueva, ownerId: idUsuario, customTasks: tareasElegidas }),
        });
        const data = await response.json();
        if (data.ok && data.pet) {
          const nuevaLista = [...get().pets, data.pet];
          set({ pets: nuevaLista });
          guardarJSON(clavePets, nuevaLista);
          await get().cargarDatos(ownerId);
          return;
        }
      } catch {
        // Continúa con guardado local
      }
    }

    const nuevoId = String(Date.now());
    const mascotaLocal: Pet = { ...nueva, _id: nuevoId, ownerId: idUsuario };
    const nuevasTareasLocal: Task[] = tareasElegidas.map((titulo, idx) => ({
      _id: `${nuevoId}_t_${idx}`,
      title: titulo,
      isCompleted: false,
      iconType: detectarIcono(titulo),
      petId: { _id: nuevoId, name: nueva.name },
    }));

    const listaPets = [...get().pets, mascotaLocal];
    const listaTasks = [...get().tasks, ...nuevasTareasLocal];
    set({ pets: listaPets, tasks: listaTasks });
    guardarJSON(clavePets, listaPets);
    guardarJSON(claveTasks, listaTasks);
  },

  actualizarMascota: async (id, datos, ownerId) => {
    const idUsuario = ownerId || '000000000000000000000001';
    const clavePets = `ph_pets_${ownerId || 'invitado'}`;

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
          guardarJSON(clavePets, listaActualizada);
          return;
        }
      } catch {
        // Continúa en local
      }
    }

    const listaActualizada = get().pets.map((p) =>
      p._id === id ? { ...p, ...datos, _id: id, ownerId: idUsuario } : p
    );
    set({ pets: listaActualizada });
    guardarJSON(clavePets, listaActualizada);
  },

  eliminarMascota: async (id, ownerId) => {
    const clavePets = `ph_pets_${ownerId || 'invitado'}`;
    const claveTasks = `ph_tasks_${ownerId || 'invitado'}`;

    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/pets/${id}`, { method: 'DELETE' });
      } catch {
        // Continúa en local
      }
    }

    const listaPets = get().pets.filter((p) => p._id !== id);
    const listaTasks = get().tasks.filter((t) => {
      const pid = typeof t.petId === 'object' ? t.petId._id : t.petId;
      return pid !== id;
    });
    set({ pets: listaPets, tasks: listaTasks });
    guardarJSON(clavePets, listaPets);
    guardarJSON(claveTasks, listaTasks);
  },

  agregarTarea: async (petId, petName, title, ownerId) => {
    const claveTasks = `ph_tasks_${ownerId || 'invitado'}`;
    const iconType = detectarIcono(title);

    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ petId, title, iconType }),
        });
        const data = await response.json();
        if (data.ok && data.task) {
          const nuevaLista = [...get().tasks, data.task];
          set({ tasks: nuevaLista });
          guardarJSON(claveTasks, nuevaLista);
          return;
        }
      } catch {
        // Continúa en local
      }
    }

    const nuevaTarea: Task = {
      _id: `t_${Date.now()}`,
      title: title.trim(),
      isCompleted: false,
      iconType,
      petId: { _id: petId, name: petName },
    };
    const nuevaLista = [...get().tasks, nuevaTarea];
    set({ tasks: nuevaLista });
    guardarJSON(claveTasks, nuevaLista);
  },

  toggleTarea: async (id, ownerId) => {
    const claveTasks = `ph_tasks_${ownerId || 'invitado'}`;
    const nuevaLista = get().tasks.map((t) =>
      t._id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    set({ tasks: nuevaLista });
    guardarJSON(claveTasks, nuevaLista);

    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'PATCH' });
      } catch {
        // Conserva el estado local
      }
    }
  },

  eliminarTarea: async (id, ownerId) => {
    const claveTasks = `ph_tasks_${ownerId || 'invitado'}`;
    const nuevaLista = get().tasks.filter((t) => t._id !== id);
    set({ tasks: nuevaLista });
    guardarJSON(claveTasks, nuevaLista);

    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      } catch {
        // Conserva la eliminación local
      }
    }
  },

  cargarRegistrosMedicos: async (petId) => {
    if (!API_BASE) return;
    try {
      const response = await fetch(`${API_BASE}/medical/${petId}`);
      const data = await response.json();
      if (data.ok && Array.isArray(data.records) && data.records.length > 0) {
        const actualizado = { ...get().medicalRecords, [petId]: data.records };
        set({ medicalRecords: actualizado });
        guardarJSON('ph_medical_records', actualizado);
      }
    } catch {
      // Mantiene registros locales
    }
  },

  agregarRegistroMedico: async (petId, type, date, notes) => {
    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/medical`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ petId, type, date, notes }),
        });
        const data = await response.json();
        if (data.ok && data.record) {
          const previos = get().medicalRecords[petId] || [];
          const actualizado = { ...get().medicalRecords, [petId]: [data.record, ...previos] };
          set({ medicalRecords: actualizado });
          guardarJSON('ph_medical_records', actualizado);
          return;
        }
      } catch {
        // Continúa en local
      }
    }

    const nuevo: MedicalRecordItem = {
      _id: `med_${Date.now()}`,
      type,
      date,
      notes,
      petId,
    };
    const previos = get().medicalRecords[petId] || [];
    const actualizado = { ...get().medicalRecords, [petId]: [nuevo, ...previos] };
    set({ medicalRecords: actualizado });
    guardarJSON('ph_medical_records', actualizado);
  },

  eliminarRegistroMedico: async (petId, recordId) => {
    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/medical/${recordId}`, { method: 'DELETE' });
      } catch {
        // Continúa en local
      }
    }

    const previos = get().medicalRecords[petId] || [];
    const actualizado = {
      ...get().medicalRecords,
      [petId]: previos.filter((r) => r._id !== recordId),
    };
    set({ medicalRecords: actualizado });
    guardarJSON('ph_medical_records', actualizado);
  },

  agregarRazaCatalogo: async (nueva) => {
    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/catalog/razas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nueva),
        });
        const data = await response.json();
        if (data.ok && data.item) {
          const nuevaLista = [...get().catalogRazas, data.item];
          set({ catalogRazas: nuevaLista });
          guardarJSON('ph_catalog_razas', nuevaLista);
          return;
        }
      } catch {
        // Continúa en local
      }
    }

    const itemLocal: BreedItem = { ...nueva, _id: `raza_${Date.now()}` };
    const nuevaLista = [...get().catalogRazas, itemLocal];
    set({ catalogRazas: nuevaLista });
    guardarJSON('ph_catalog_razas', nuevaLista);
  },

  eliminarRazaCatalogo: async (id) => {
    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/catalog/razas/${id}`, { method: 'DELETE' });
      } catch {
        // Continúa en local
      }
    }

    const nuevaLista = get().catalogRazas.filter((r) => r._id !== id);
    set({ catalogRazas: nuevaLista });
    guardarJSON('ph_catalog_razas', nuevaLista);
  },

  agregarTipCatalogo: async (nuevo) => {
    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/catalog/recomendaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevo),
        });
        const data = await response.json();
        if (data.ok && data.tip) {
          const nuevaLista = [...get().catalogTips, data.tip];
          set({ catalogTips: nuevaLista });
          guardarJSON('ph_catalog_tips', nuevaLista);
          return;
        }
      } catch {
        // Continúa en local
      }
    }

    const tipLocal: TipItem = { ...nuevo, _id: `tip_${Date.now()}` };
    const nuevaLista = [...get().catalogTips, tipLocal];
    set({ catalogTips: nuevaLista });
    guardarJSON('ph_catalog_tips', nuevaLista);
  },

  eliminarTipCatalogo: async (id) => {
    if (API_BASE) {
      try {
        await fetch(`${API_BASE}/catalog/recomendaciones/${id}`, { method: 'DELETE' });
      } catch {
        // Continúa en local
      }
    }

    const nuevaLista = get().catalogTips.filter((t) => t._id !== id);
    set({ catalogTips: nuevaLista });
    guardarJSON('ph_catalog_tips', nuevaLista);
  },
}));
