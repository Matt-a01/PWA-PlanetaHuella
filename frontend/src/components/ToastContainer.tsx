import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

export default function ToastContainer() {
  const { toasts, ocultarToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[60] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const esError = toast.type === 'error';
        const esInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            role={esError ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold transition-all ${
              esError
                ? 'bg-red-50 border-red-200 text-red-800'
                : esInfo
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-green-700 border-green-800 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {esError ? (
                <AlertCircle size={17} className="text-red-600 shrink-0" />
              ) : esInfo ? (
                <Info size={17} className="text-green-400 shrink-0" />
              ) : (
                <CheckCircle2 size={17} className="text-green-200 shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => ocultarToast(toast.id)}
              aria-label="Cerrar notificación"
              className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 ${
                esError
                  ? 'text-red-500 hover:bg-red-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
