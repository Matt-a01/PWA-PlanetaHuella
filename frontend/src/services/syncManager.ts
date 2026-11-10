import {
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  ApiError,
} from './apiClient';
import {
  obtenerColaOutbox,
  guardarColaOutbox,
  reemplazarIdTemporalEnOutbox,
  type OutboxOperation,
} from './offlineStorage';
import type { Pet } from '../store/usePetStore';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
}

type SyncListener = (status: SyncStatus) => void;

let estadoSync: SyncStatus = {
  isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
};

const listeners = new Set<SyncListener>();
let manejadorReconexion: (() => void | Promise<void>) | null = null;
let promesaSincronizacionActiva: Promise<{ procesadas: number; pendientes: number }> | null = null;

const notificarListeners = (): void => {
  for (const listener of listeners) {
    listener({ ...estadoSync });
  }
};

const actualizarEstadoSync = (parcial: Partial<SyncStatus>): void => {
  estadoSync = { ...estadoSync, ...parcial };
  notificarListeners();
};

export const obtenerEstadoSync = (): SyncStatus => ({ ...estadoSync });

export const suscribirEstadoSync = (listener: SyncListener): (() => void) => {
  listeners.add(listener);
  listener({ ...estadoSync });
  return () => {
    listeners.delete(listener);
  };
};

export const registrarManejadorReconexion = (
  handler: () => void | Promise<void>
): void => {
  manejadorReconexion = handler;
};

export const actualizarContadorPendientes = async (
  userId?: string | null
): Promise<number> => {
  if (!userId) {
    actualizarEstadoSync({ pendingCount: 0 });
    return 0;
  }
  const cola = await obtenerColaOutbox(userId);
  actualizarEstadoSync({ pendingCount: cola.length });
  return cola.length;
};

const ejecutarOperacionRemota = async (
  op: OutboxOperation
): Promise<{ petCreada?: Pet }> => {
  if (op.method === 'POST') {
    const data = await apiPost<{ ok: boolean; pet?: Pet }>(op.endpoint, op.payload);
    return { petCreada: data.pet };
  }
  if (op.method === 'PUT') {
    await apiPut<{ ok: boolean }>(op.endpoint, op.payload);
    return {};
  }
  if (op.method === 'PATCH') {
    await apiPatch<{ ok: boolean }>(op.endpoint, op.payload);
    return {};
  }
  await apiDelete<{ ok: boolean }>(op.endpoint);
  return {};
};

// Vacía y sincroniza en orden FIFO la cola Outbox hacia el backend antes de descargar datos frescos
export const sincronizarColaPendiente = async (
  userId: string
): Promise<{ procesadas: number; pendientes: number }> => {
  if (!userId) {
    return { procesadas: 0, pendientes: 0 };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const pendientes = await actualizarContadorPendientes(userId);
    return { procesadas: 0, pendientes };
  }

  if (promesaSincronizacionActiva) {
    return promesaSincronizacionActiva;
  }

  promesaSincronizacionActiva = (async () => {
    let cola = await obtenerColaOutbox(userId);
    if (cola.length === 0) {
      actualizarEstadoSync({ isSyncing: false, pendingCount: 0 });
      return { procesadas: 0, pendientes: 0 };
    }

    actualizarEstadoSync({ isSyncing: true, pendingCount: cola.length });
    let procesadas = 0;

    while (cola.length > 0) {
      const actual = cola[0];
      if (!actual) break;

      try {
        const resultado = await ejecutarOperacionRemota(actual);
        cola = cola.slice(1);

        // Si se creó una mascota que tenía temp_*, actualiza todas las operaciones dependientes en la cola
        if (actual.type === 'CREATE_PET' && actual.tempId && resultado.petCreada?._id) {
          cola = reemplazarIdTemporalEnOutbox(
            cola,
            actual.tempId,
            resultado.petCreada._id
          );
        }

        await guardarColaOutbox(userId, cola);
        procesadas += 1;
        actualizarEstadoSync({ pendingCount: cola.length });
      } catch (error) {
        // Si la red vuelve a caer durante el vaciado, detiene el ciclo conservando el resto en orden FIFO
        if (error instanceof ApiError && error.isNetworkError) {
          actualizarEstadoSync({ isOnline: false });
          break;
        }

        // Si el recurso ya no existe o fue rechazado por validación (400/404/409), descarta la operación inválida para no bloquear la cola
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 401 &&
          error.status !== 429
        ) {
          cola = cola.slice(1);
          await guardarColaOutbox(userId, cola);
          actualizarEstadoSync({ pendingCount: cola.length });
          continue;
        }

        break;
      }
    }

    actualizarEstadoSync({
      isSyncing: false,
      pendingCount: cola.length,
      lastSyncedAt: procesadas > 0 ? Date.now() : estadoSync.lastSyncedAt,
    });

    return { procesadas, pendientes: cola.length };
  })().finally(() => {
    promesaSincronizacionActiva = null;
  });

  return promesaSincronizacionActiva;
};

// Listeners globales de conectividad del navegador
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    actualizarEstadoSync({ isOnline: true });
    if (manejadorReconexion) {
      void manejadorReconexion();
    }
  });

  window.addEventListener('offline', () => {
    actualizarEstadoSync({ isOnline: false });
  });
}
