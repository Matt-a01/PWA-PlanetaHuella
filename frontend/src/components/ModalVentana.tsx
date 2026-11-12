import { useEffect, useId, useRef, type ReactNode } from 'react';
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
  const tituloId = useId();
  const subtituloId = useId();
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!abierto) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', manejarEscape);

    // Enfoca automáticamente el contenedor del diálogo si el foco no está ya dentro de él
    const timer = window.setTimeout(() => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(document.activeElement)
      ) {
        contenedorRef.current.focus();
      }
    }, 10);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener('keydown', manejarEscape);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <div
        ref={contenedorRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={subtitulo ? subtituloId : undefined}
        tabIndex={-1}
        className={`w-full ${maxWidthClass} bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh] focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3.5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gradient-to-b from-green-50/60 to-white">
          <div>
            {badge && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full mb-1">
                {badge}
              </span>
            )}
            <h2 id={tituloId} className="text-lg font-bold text-gray-900 leading-snug">
              {titulo}
            </h2>
            {subtitulo && (
              <p id={subtituloId} className="text-xs text-gray-500 mt-0.5">
                {subtitulo}
              </p>
            )}
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
