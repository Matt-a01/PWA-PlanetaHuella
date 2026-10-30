import { useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import ModalVentana from './ModalVentana';
import { usePetStore, type Pet } from '../store/usePetStore';

interface MedicalRecordModalProps {
  abierto: boolean;
  onCerrar: () => void;
  mascota: Pet | null;
}

const TIPOS_REGISTRO = [
  'Última vacuna',
  'Última desparasitación',
  'Próxima cita',
  'Consulta veterinaria',
] as const;

export default function MedicalRecordModal({
  abierto,
  onCerrar,
  mascota,
}: MedicalRecordModalProps) {
  const { agregarRegistroMedico } = usePetStore();
  const [tipo, setTipo] = useState<string>('Última vacuna');
  const [fecha, setFecha] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!mascota) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha) return;
    setGuardando(true);
    await agregarRegistroMedico(mascota._id, tipo, fecha, notas.trim());
    setFecha('');
    setNotas('');
    setGuardando(false);
    onCerrar();
  };

  return (
    <ModalVentana
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Registrar control médico"
      subtitulo={`Historial clínico de ${mascota.name}`}
      badge="Salud veterinaria"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Tipo de registro
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS_REGISTRO.map((opcion) => {
              const activo = tipo === opcion;
              const esCita = opcion.toLowerCase().includes('cita');
              return (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setTipo(opcion)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left ${
                    activo
                      ? 'bg-green-50 border-green-600 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {esCita ? <Calendar size={14} className="shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
                  <span className="truncate">{opcion}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Notas o detalles (opcional)
          </label>
          <input
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej. Vacuna séxtuple, tableta interna, Dr. Pérez..."
            className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer text-sm disabled:opacity-60"
        >
          {guardando ? 'Guardando registro...' : 'Guardar en historial médico'}
        </button>
      </form>
    </ModalVentana>
  );
}
