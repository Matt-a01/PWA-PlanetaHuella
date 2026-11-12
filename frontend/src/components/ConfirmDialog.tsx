import { AlertTriangle } from 'lucide-react';
import ModalVentana from './ModalVentana';

interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  detalle?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  procesando?: boolean;
  onConfirmar: () => void | Promise<void>;
  onCancelar: () => void;
}

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  detalle,
  textoConfirmar = 'Sí, eliminar',
  textoCancelar = 'Cancelar',
  procesando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  if (!abierto) return null;

  return (
    <ModalVentana
      abierto={abierto}
      onCerrar={onCancelar}
      titulo={titulo}
      badge="Confirmación requerida"
      maxWidthClass="max-w-sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-3.5">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="text-xs text-red-900 space-y-1">
            <p className="font-semibold leading-relaxed">{mensaje}</p>
            {detalle && <p className="text-red-700/90">{detalle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            disabled={procesando}
            onClick={onCancelar}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={() => void onConfirmar()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
          >
            {procesando ? 'Eliminando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </ModalVentana>
  );
}
