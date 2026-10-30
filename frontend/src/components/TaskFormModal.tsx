import { useState, type FormEvent } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import ModalVentana from './ModalVentana';
import { usePetStore, type Pet } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

interface TaskFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  mascota: Pet | null;
}

export default function TaskFormModal({ abierto, onCerrar, mascota }: TaskFormModalProps) {
  const user = useAuthStore((state) => state.user);
  const { tasks, obtenerTareasSugeridas, agregarTarea } = usePetStore();
  const [titulo, setTitulo] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!mascota) return null;

  const tareasActuales = tasks.filter((t) => {
    const pid = typeof t.petId === 'object' ? t.petId._id : t.petId;
    return pid === mascota._id;
  });

  const sugeridasDisponibles = obtenerTareasSugeridas(mascota.species, mascota.breed).filter(
    (sug) => !tareasActuales.some((t) => t.title.toLowerCase() === sug.toLowerCase())
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setGuardando(true);
    await agregarTarea(mascota._id, mascota.name, titulo.trim(), user?.id);
    setTitulo('');
    setGuardando(false);
    onCerrar();
  };

  const handleAgregarSugerida = async (sug: string) => {
    setGuardando(true);
    await agregarTarea(mascota._id, mascota.name, sug, user?.id);
    setGuardando(false);
    onCerrar();
  };

  return (
    <ModalVentana
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={`Nueva tarea para ${mascota.name}`}
      subtitulo={`${mascota.species} • ${mascota.breed}`}
      badge="Cuidados diarios"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Descripción de la actividad
          </label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Dar vitaminas, cepillar pelaje, paseo..."
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
          />
        </div>

        {sugeridasDisponibles.length > 0 && (
          <div className="bg-green-50/70 border border-green-100 rounded-2xl p-3.5">
            <p className="text-xs font-bold text-green-900 flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-green-700" />
              <span>Sugeridas para {mascota.breed}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sugeridasDisponibles.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={guardando}
                  onClick={() => handleAgregarSugerida(sug)}
                  className="bg-white hover:bg-green-100 text-green-800 border border-green-200 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-sm disabled:opacity-60"
        >
          <Plus size={16} />
          <span>{guardando ? 'Guardando...' : 'Guardar tarea'}</span>
        </button>
      </form>
    </ModalVentana>
  );
}
