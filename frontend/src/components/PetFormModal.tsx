import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Camera, Upload, Trash2, Plus, X } from 'lucide-react';
import ModalVentana from './ModalVentana';
import PetAvatar from './PetAvatar';
import { comprimirImagenMultimedia } from '../utils/imageUtils';
import { usePetStore, type Pet } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

interface PetFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  mascotaEditar?: Pet | null;
}

export default function PetFormModal({ abierto, onCerrar, mascotaEditar }: PetFormModalProps) {
  if (!abierto) return null;

  return (
    <ModalVentana
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={mascotaEditar ? `Editar a ${mascotaEditar.name}` : 'Agregar mascota'}
      subtitulo="Personaliza sus datos, foto e indicaciones de cuidado"
    >
      <FormularioMascotaInterno
        key={mascotaEditar?._id || 'nueva_mascota'}
        onCerrar={onCerrar}
        mascotaEditar={mascotaEditar}
      />
    </ModalVentana>
  );
}

function FormularioMascotaInterno({
  onCerrar,
  mascotaEditar,
}: {
  onCerrar: () => void;
  mascotaEditar?: Pet | null;
}) {
  const user = useAuthStore((state) => state.user);
  const {
    catalogRazas,
    cargarCatalogo,
    obtenerTareasSugeridas,
    agregarMascota,
    actualizarMascota,
  } = usePetStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(mascotaEditar?.name || '');
  const [species, setSpecies] = useState(mascotaEditar?.species || 'Perro');
  const [breed, setBreed] = useState(mascotaEditar?.breed || 'Golden Retriever');
  const [age, setAge] = useState(mascotaEditar ? String(mascotaEditar.age) : '2');
  const [gender, setGender] = useState(mascotaEditar?.gender || 'Hembra');
  const [characteristics, setCharacteristics] = useState(mascotaEditar?.characteristics || '');
  // Sin imagen genérica predeterminada: muestra silueta hasta que el usuario suba una foto
  const [imageUrl, setImageUrl] = useState(mascotaEditar?.imageUrl || '');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [tareasPersonalizadas, setTareasPersonalizadas] = useState<string[]>(() =>
    mascotaEditar ? [] : obtenerTareasSugeridas('Perro', 'Golden Retriever')
  );
  const [nuevaTareaTexto, setNuevaTareaTexto] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCatalogo();
  }, [cargarCatalogo]);

  const razasDisponibles = catalogRazas.filter((r) => {
    if (species === 'Perro') return r.category === 'Perros';
    if (species === 'Gato') return r.category === 'Gatos';
    return r.category === 'Otros';
  });

  const handleSpeciesChange = (nuevaEspecie: string) => {
    setSpecies(nuevaEspecie);
    const primeraRaza = catalogRazas.find((r) => {
      if (nuevaEspecie === 'Perro') return r.category === 'Perros';
      if (nuevaEspecie === 'Gato') return r.category === 'Gatos';
      return r.category === 'Otros';
    });
    const nuevaRaza = primeraRaza ? primeraRaza.name : nuevaEspecie;
    setBreed(nuevaRaza);
    if (!mascotaEditar) {
      setTareasPersonalizadas(obtenerTareasSugeridas(nuevaEspecie, nuevaRaza));
    }
  };

  const handleBreedChange = (nuevaRaza: string) => {
    setBreed(nuevaRaza);
    if (!mascotaEditar) {
      setTareasPersonalizadas(obtenerTareasSugeridas(species, nuevaRaza));
    }
  };

  const manejarSeleccionImagen = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    try {
      setNombreArchivo(archivo.name);
      const base64 = await comprimirImagenMultimedia(archivo, 600, 0.8);
      setImageUrl(base64);
    } catch {
      setNombreArchivo('');
    }
  };

  // Elimina la imagen actual dejando únicamente la silueta de la especie
  const quitarImagenSeleccionada = () => {
    setImageUrl('');
    setNombreArchivo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const agregarTareaALista = () => {
    if (!nuevaTareaTexto.trim()) return;
    setTareasPersonalizadas([...tareasPersonalizadas, nuevaTareaTexto.trim()]);
    setNuevaTareaTexto('');
  };

  const quitarTareaDeLista = (idx: number) => {
    setTareasPersonalizadas(tareasPersonalizadas.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setGuardando(true);
    const datosMascota = {
      name: name.trim(),
      species,
      breed,
      age: Number(age) || 0,
      gender,
      characteristics: characteristics.trim(),
      // Si se eliminó o no se seleccionó imagen, se guarda cadena vacía para mostrar la silueta
      imageUrl: imageUrl.trim(),
    };

    if (mascotaEditar) {
      await actualizarMascota(mascotaEditar._id, datosMascota, user?.id);
    } else {
      await agregarMascota(datosMascota, user?.id, tareasPersonalizadas);
    }

    setGuardando(false);
    onCerrar();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={manejarSeleccionImagen}
        className="hidden"
      />

      <div className="flex flex-col items-center mb-5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-28 h-28 rounded-full border-4 border-green-50 shadow-sm overflow-hidden cursor-pointer group"
        >
          <PetAvatar
            imageUrl={imageUrl}
            name={name || species}
            species={species}
            className="w-full h-full rounded-full"
            iconSize={52}
            showLabel={!imageUrl}
          />
          <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
            <Camera size={15} className="text-green-700" />
          </div>
        </button>

        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3.5 py-2 rounded-full border border-green-200 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span>{imageUrl ? 'Cambiar foto' : 'Seleccionar de multimedia'}</span>
          </button>

          {imageUrl && (
            <button
              type="button"
              onClick={quitarImagenSeleccionada}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full border border-red-100 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Quitar foto</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
          {nombreArchivo
            ? `Archivo: ${nombreArchivo}`
            : imageUrl
              ? 'Al quitar la foto se mostrará una silueta limpia sin imágenes genéricas'
              : 'Sin foto asignada (se mostrará el símbolo de su especie)'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Luna"
            className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Especie</label>
            <select
              value={species}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            >
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Conejo">Conejo</option>
              <option value="Ave">Ave</option>
              <option value="Otro">Otro animal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Raza o Tipo</label>
            <select
              value={breed}
              onChange={(e) => handleBreedChange(e.target.value)}
              className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            >
              {razasDisponibles.map((r) => (
                <option key={r._id} value={r.name}>
                  {r.name}
                </option>
              ))}
              <option value="Mestizo">Mestizo / Otra</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2.5">
          <div className="w-28">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Edad</label>
            <div className="flex bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <input
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-12 p-2.5 bg-transparent text-center focus:outline-none text-sm font-semibold"
              />
              <div className="flex items-center px-2 text-xs text-gray-500 border-l border-gray-200">
                años
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sexo</label>
            <div className="flex gap-2">
              {(['Macho', 'Hembra'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    gender === g
                      ? 'bg-green-50 border-green-600 text-green-800'
                      : 'border-gray-200 text-gray-500 bg-gray-50'
                  }`}
                >
                  {g === 'Macho' ? '♂ Macho' : '♀ Hembra'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Indicaciones o características propias (pelaje, dieta, alergias, conducta)
          </label>
          <textarea
            rows={2}
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            placeholder="Ej. Pelaje largo, sensible al calor, dieta sin pollo..."
            className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-xs resize-none"
          />
        </div>

        {!mascotaEditar && (
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tareas iniciales para {species} ({breed})
            </label>
            <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
              {tareasPersonalizadas.map((tarea, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-green-50/70 border border-green-100 px-3 py-1.5 rounded-xl text-xs text-green-900"
                >
                  <span>• {tarea}</span>
                  <button
                    type="button"
                    onClick={() => quitarTareaDeLista(idx)}
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={nuevaTareaTexto}
                onChange={(e) => setNuevaTareaTexto(e.target.value)}
                placeholder="Añadir otra tarea personalizada..."
                className="flex-1 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-green-600"
              />
              <button
                type="button"
                onClick={agregarTareaALista}
                className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-green-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Añadir</span>
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-60 text-sm"
        >
          {guardando
            ? 'Guardando...'
            : mascotaEditar
              ? 'Guardar cambios'
              : 'Registrar mascota'}
        </button>
      </form>
    </>
  );
}
