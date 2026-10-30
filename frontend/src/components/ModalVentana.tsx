import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalVentanaProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  subtitulo?: string;
  badge?: string;
  maxWidthClass?: string;
  children: ReactNode;
}

export default function ModalVentana({
  abierto,
  onCerrar,
  titulo,
  subtitulo,
  badge,
  maxWidthClass = 'max-w-md',
  children,
}: ModalVentanaProps) {
  useEffect(() => {
    if (!abierto) return;
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', manejarEscape);
    return () => window.removeEventListener('keydown', manejarEscape);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        className={`w-full ${maxWidthClass} bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3.5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gradient-to-b from-green-50/60 to-white">
          <div>
            {badge && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full mb-1">
                {badge}
              </span>
            )}
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{titulo}</h2>
            {subtitulo && <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
