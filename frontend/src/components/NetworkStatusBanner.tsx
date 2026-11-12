import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import {
  obtenerEstadoSync,
  suscribirEstadoSync,
  type SyncStatus,
} from '../services/syncManager';

export default function NetworkStatusBanner() {
  const [status, setStatus] = useState<SyncStatus>(() => obtenerEstadoSync());

  useEffect(() => {
    return suscribirEstadoSync(setStatus);
  }, []);

  if (status.isOnline && !status.isSyncing && status.pendingCount === 0) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sticky top-0 z-50 w-full px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors ${
        !status.isOnline
          ? 'bg-amber-500 text-white'
          : 'bg-green-700 text-white'
      }`}
    >
      {!status.isOnline ? (
        <>
          <WifiOff size={14} className="shrink-0" />
          <span className="text-center">
            Modo sin conexión • Tus cambios se guardarán y sincronizarán al reconectar
            {status.pendingCount > 0 ? ` (${status.pendingCount} pendiente${status.pendingCount === 1 ? '' : 's'})` : ''}
          </span>
        </>
      ) : (
        <>
          <RefreshCw size={14} className="shrink-0 animate-spin" />
          <span className="text-center">
            Sincronizando {status.pendingCount} cambio{status.pendingCount === 1 ? '' : 's'} pendiente{status.pendingCount === 1 ? '' : 's'} con MongoDB...
          </span>
        </>
      )}
    </div>
  );
}
