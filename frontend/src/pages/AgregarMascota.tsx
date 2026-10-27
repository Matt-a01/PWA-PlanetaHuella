import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { ChevronLeft, Camera, Upload, Trash2, Plus, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePetStore } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function AgregarMascota() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const user = useAuthStore((state) => state.user);
  const {
    pets,
    catalogRazas,
    cargarCatalogo,
    obtenerTareasSugeridas,
    agregarMascota,
    actualizarMascota,
  } = usePetStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mascotaEditar = pets.find((p) => p._id === editId);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Perro');
  const [breed, setBreed] = useState('Golden Retriever');
  const [age, setAge] = useState('3');
  const [gender, setGender] = useState('Hembra');
  const [characteristics, setCharacteristics] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [tareasPersonalizadas, setTareasPersonalizadas] = useState<string[]>([]);
  const [nuevaTareaTexto, setNuevaTareaTexto] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCatalogo();
  }, [cargarCatalogo]);

  // Filtra las razas disponibles en la base de datos según la especie elegida
  const razasDisponibles = catalogRazas.filter((r) => {
    if (species === 'Perro') return r.category === 'Perros';
    if (species === 'Gato') return r.category === 'Gatos';
    return r.category === 'Otros';
  });

  useEffect(() => {
    if (mascotaEditar) {
      setName(mascotaEditar.name);
      setSpecies(mascotaEditar.species);
      setBreed(mascotaEditar.breed);
      setAge(String(mascotaEditar.age));
      setGender(mascotaEditar.gender);
      setCharacteristics(mascotaEditar.characteristics || '');
      setImageUrl(mascotaEditar.imageUrl || '');
    }
  }, [mascotaEditar]);

  // Actualiza las tareas predeterminadas sugeridas al cambiar la especie o raza (solo en registro nuevo)
  useEffect(() => {
    if (!mascotaEditar) {
      setTareasPersonalizadas(obtenerTareasSugeridas(species, breed));
    }
  }, [species, breed, mascotaEditar, obtenerTareasSugeridas]);

  const handleSpeciesChange = (nuevaEspecie: string) => {
    setSpecies(nuevaEspecie);
    const primeraRaza = catalogRazas.find((r) => {
      if (nuevaEspecie === 'Perro') return r.category === 'Perros';
      if (nuevaEspecie === 'Gato') return r.category === 'Gatos';
      return r.category === 'Otros';
    });
    setBreed(primeraRaza ? primeraRaza.name : nuevaEspecie);
  };

  const fotoPorDefecto =
    species === 'Gato'
      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80';

  const manejarSeleccionImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setNombreArchivo(archivo.name);

    const reader = new FileReader();
    reader.onload = (evento) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 500;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        setImageUrl(canvas.toDataURL('image/jpeg', 0.75));
      };
      if (typeof evento.target?.result === 'string') {
        img.src = evento.target.result;
      }
    };
    reader.readAsDataURL(archivo);
  };

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
      age: Number(age) || 1,
      gender,
      characteristics: characteristics.trim(),
      imageUrl: imageUrl.trim() || fotoPorDefecto,
    };

    if (mascotaEditar) {
      await actualizarMascota(mascotaEditar._id, datosMascota, user?.id);
    } else {
      await agregarMascota(datosMascota, user?.id, tareasPersonalizadas);
    }

    setGuardando(false);
    navigate('/mascotas');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      <header className="p-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <Link to="/mascotas" className="text-gray-700 p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">
            {mascotaEditar ? 'Editar mascota' : 'Agregar mascota'}
          </h1>
          <div className="w-6" />
        </div>
        <div className="flex justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <span className="w-5 h-1.5 rounded-full bg-green-700" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </div>
      </header>

      <div className="p-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={manejarSeleccionImagen}
          className="hidden"
        />

        <div className="flex flex-col items-center mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-28 h-28 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden cursor-pointer group"
          >
            <img
              src={imageUrl.trim() || fotoPorDefecto}
              alt="Vista previa"
              className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
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
              <span>{imageUrl ? 'Cambiar foto' : 'Seleccionar foto'}</span>
            </button>

            {imageUrl && (
              <button
                type="button"
                onClick={quitarImagenSeleccionada}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full border border-red-100 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Eliminar actual</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-1.5 text-center">
            {nombreArchivo
              ? `Foto seleccionada: ${nombreArchivo} (reemplaza la anterior en BD)`
              : 'La foto se guarda en tu cuenta y reemplaza la anterior si la cambias'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Luna"
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Especie</label>
            <select
              value={species}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            >
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Conejo">Conejo</option>
              <option value="Ave">Ave</option>
              <option value="Otro">Otro animal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Raza o Tipo (Cargado de BD)</label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            >
              {razasDisponibles.map((r) => (
                <option key={r._id} value={r.name}>
                  {r.name}
                </option>
              ))}
              <option value="Mestizo">Mestizo / Otra</option>
            </select>
          </div>

          <div className="flex gap-3">
            <div className="w-28">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Edad</label>
              <div className="flex bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <input
                  type="number"
                  min="0"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="3"
                  className="w-12 p-3 bg-transparent text-center focus:outline-none text-sm font-semibold"
                />
                <div className="flex items-center px-2 text-xs text-gray-500 border-l border-gray-200">
                  años
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Sexo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Macho')}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                    gender === 'Macho'
                      ? 'bg-green-50 border-green-600 text-green-800'
                      : 'border-gray-200 text-gray-500 bg-gray-50'
                  }`}
                >
                  ♂ Macho
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Hembra')}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                    gender === 'Hembra'
                      ? 'bg-green-50 border-green-600 text-green-800'
                      : 'border-gray-200 text-gray-500 bg-gray-50'
                  }`}
                >
                  ♀ Hembra
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Características únicas (pelaje, alergias, comportamiento)
            </label>
            <input
              type="text"
              value={characteristics}
              onChange={(e) => setCharacteristics(e.target.value)}
              placeholder="Ej. Pelaje largo, muy activo, sensible al calor..."
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            />
          </div>

          {/* Tareas sugeridas según especie y raza que el usuario puede quitar o personalizar */}
          {!mascotaEditar && (
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tareas sugeridas para {species} ({breed})
              </label>
              <p className="text-[11px] text-gray-400 mb-2">
                Puedes quitar las actividades que no necesites o agregar nuevas para esta mascota:
              </p>

              <div className="space-y-1.5 mb-3">
                {tareasPersonalizadas.map((tarea, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-green-50/70 border border-green-100 px-3 py-2 rounded-xl text-xs text-green-900"
                  >
                    <span>• {tarea}</span>
                    <button
                      type="button"
                      onClick={() => quitarTareaDeLista(idx)}
                      className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                      title="Quitar tarea sugerida"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevaTareaTexto}
                  onChange={(e) => setNuevaTareaTexto(e.target.value)}
                  placeholder="Agregar otra actividad para esta mascota..."
                  className="flex-1 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-green-600"
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
            className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-xl mt-2 hover:bg-green-800 transition-colors cursor-pointer disabled:opacity-60"
          >
            {guardando
              ? 'Guardando en la base de datos...'
              : mascotaEditar
                ? 'Guardar cambios y actualizar foto'
                : 'Guardar mascota y sus actividades'}
          </button>
        </form>
      </div>
    </div>
  );
}
