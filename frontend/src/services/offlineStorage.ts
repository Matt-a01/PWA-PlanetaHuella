import { get, set } from 'idb-keyval';
import type {
  Pet,
  Task,
  MedicalRecordItem,
  BreedItem,
  TipItem,
} from '../store/usePetStore';

export type OutboxOperationType =
  | 'CREATE_PET'
  | 'UPDATE_PET'
  | 'DELETE_PET'
  | 'CREATE_TASK'
  | 'TOGGLE_TASK'
  | 'DELETE_TASK'
  | 'CREATE_MEDICAL'
  | 'DELETE_MEDICAL';

export interface OutboxOperation {
  id: string;
  userId: string;
  type: OutboxOperationType;
  timestamp: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: unknown;
  tempId?: string;
  petId?: string;
}

// Almacenamiento en memoria de respaldo para entornos de prueba (Vitest/Node) sin IndexedDB nativo
const memoriaRespaldo = new Map<string, unknown>();

const tieneIndexedDB = (): boolean =>
  typeof indexedDB !== 'undefined' && indexedDB !== null;

const leerClaveIDB = async <T>(clave: string, respaldo: T): Promise<T> => {
  try {
    if (tieneIndexedDB()) {
      const valor = await get<T>(clave);
      if (valor !== undefined) {
        return valor;
      }
    }
    if (memoriaRespaldo.has(clave)) {
      return memoriaRespaldo.get(clave) as T;
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(clave);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    }
    return respaldo;
  } catch {
    if (memoriaRespaldo.has(clave)) {
      return memoriaRespaldo.get(clave) as T;
    }
    return respaldo;
  }
};

const guardarClaveIDB = async <T>(clave: string, valor: T): Promise<void> => {
  memoriaRespaldo.set(clave, valor);
  try {
    if (tieneIndexedDB()) {
      await set(clave, valor);
      return;
    }
  } catch {
    // Continúa con respaldo local si IndexedDB está restringido
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(clave, JSON.stringify(valor));
    }
  } catch {
    // Ignora errores de cuota en localStorage; memoriaRespaldo conserva el dato en sesión
  }
};

// ==================== COLECCIONES POR USUARIO ====================

export const obtenerPetsOffline = (userId: string): Promise<Pet[]> =>
  leerClaveIDB<Pet[]>(`ph_idb_pets_${userId}`, []);

export const guardarPetsOffline = (userId: string, pets: Pet[]): Promise<void> =>
  guardarClaveIDB(`ph_idb_pets_${userId}`, pets);

export const obtenerTasksOffline = (userId: string): Promise<Task[]> =>
  leerClaveIDB<Task[]>(`ph_idb_tasks_${userId}`, []);

export const guardarTasksOffline = (userId: string, tasks: Task[]): Promise<void> =>
  guardarClaveIDB(`ph_idb_tasks_${userId}`, tasks);

export const obtenerMedicalOffline = (
  userId: string
): Promise<Record<string, MedicalRecordItem[]>> =>
  leerClaveIDB<Record<string, MedicalRecordItem[]>>(`ph_idb_medical_${userId}`, {});

export const guardarMedicalOffline = (
  userId: string,
  records: Record<string, MedicalRecordItem[]>
): Promise<void> => guardarClaveIDB(`ph_idb_medical_${userId}`, records);

export const obtenerCatalogoRazasOffline = (respaldo: BreedItem[]): Promise<BreedItem[]> =>
  leerClaveIDB<BreedItem[]>('ph_idb_catalog_razas', respaldo);

export const guardarCatalogoRazasOffline = (razas: BreedItem[]): Promise<void> =>
  guardarClaveIDB('ph_idb_catalog_razas', razas);

export const obtenerCatalogoTipsOffline = (respaldo: TipItem[]): Promise<TipItem[]> =>
  leerClaveIDB<TipItem[]>('ph_idb_catalog_tips', respaldo);

export const guardarCatalogoTipsOffline = (tips: TipItem[]): Promise<void> =>
  guardarClaveIDB('ph_idb_catalog_tips', tips);

// ==================== COLA OUTBOX OFFLINE (FIFO) ====================

const claveOutbox = (userId: string): string => `ph_idb_outbox_${userId}`;

export const obtenerColaOutbox = async (userId: string): Promise<OutboxOperation[]> => {
  const cola = await leerClaveIDB<OutboxOperation[]>(claveOutbox(userId), []);
  return [...cola].sort((a, b) => a.timestamp - b.timestamp);
};

export const guardarColaOutbox = async (
  userId: string,
  cola: OutboxOperation[]
): Promise<void> => {
  await guardarClaveIDB(claveOutbox(userId), cola);
};

export interface NuevaOperacionOutbox {
  id?: string;
  userId: string;
  type: OutboxOperationType;
  timestamp?: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: unknown;
  tempId?: string;
  petId?: string;
}

export const encolarOperacionOutbox = async (
  nueva: NuevaOperacionOutbox
): Promise<OutboxOperation> => {
  const colaActual = await obtenerColaOutbox(nueva.userId);

  // Si se elimina una mascota con ID temporal que aún no fue creada en el servidor, cancela sus operaciones pendientes
  if (nueva.type === 'DELETE_PET' && nueva.petId?.startsWith('temp_')) {
    const filtrada = colaActual.filter(
      (op) => op.tempId !== nueva.petId && op.petId !== nueva.petId
    );
    await guardarColaOutbox(nueva.userId, filtrada);
    return {
      id: nueva.id ?? `op_${Date.now()}`,
      userId: nueva.userId,
      type: nueva.type,
      timestamp: nueva.timestamp ?? Date.now(),
      endpoint: nueva.endpoint,
      method: nueva.method,
      payload: nueva.payload,
      tempId: nueva.tempId,
      petId: nueva.petId,
    };
  }

  const operacion: OutboxOperation = {
    id: nueva.id ?? `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: nueva.userId,
    type: nueva.type,
    timestamp: nueva.timestamp ?? Date.now(),
    endpoint: nueva.endpoint,
    method: nueva.method,
    payload: nueva.payload,
    tempId: nueva.tempId,
    petId: nueva.petId,
  };

  const nuevaCola = [...colaActual, operacion];
  await guardarColaOutbox(nueva.userId, nuevaCola);
  return operacion;
};

export const eliminarOperacionOutbox = async (
  userId: string,
  opId: string
): Promise<void> => {
  const colaActual = await obtenerColaOutbox(userId);
  const filtrada = colaActual.filter((op) => op.id !== opId);
  await guardarColaOutbox(userId, filtrada);
};

export const limpiarColaOutbox = async (userId: string): Promise<void> => {
  await guardarColaOutbox(userId, []);
};

// Reemplaza referencias a un ID temporal (temp_*) por el ObjectId real asignado por MongoDB tras CREATE_PET
export const reemplazarIdTemporalEnOutbox = (
  cola: OutboxOperation[],
  tempId: string,
  realId: string
): OutboxOperation[] =>
  cola.map((op) => {
    const nuevoEndpoint = op.endpoint.replaceAll(tempId, realId);
    const nuevoPetId = op.petId === tempId ? realId : op.petId;

    let nuevoPayload = op.payload;
    if (
      nuevoPayload &&
      typeof nuevoPayload === 'object' &&
      !Array.isArray(nuevoPayload) &&
      'petId' in nuevoPayload &&
      (nuevoPayload as { petId?: unknown }).petId === tempId
    ) {
      nuevoPayload = {
        ...(nuevoPayload as Record<string, unknown>),
        petId: realId,
      };
    }

    return {
      ...op,
      endpoint: nuevoEndpoint,
      petId: nuevoPetId,
      payload: nuevoPayload,
    };
  });
