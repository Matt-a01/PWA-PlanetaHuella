import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import {
  Search,
  PawPrint,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Camera,
  CheckCircle2,
  X,
} from 'lucide-react';
import PetAvatar from '../components/PetAvatar';
import ModalVentana from '../components/ModalVentana';
import { comprimirImagenMultimedia } from '../utils/imageUtils';
import { usePetStore, type BreedItem } from '../store/usePetStore';
import { useAuthStore, esUsuarioAdmin } from '../store/useAuthStore';

export default function Razas() {
  const { user, sincronizarRolDesdeBD } = useAuthStore();
  const {
    catalogRazas,
    cargarCatalogo,
    agregarRazaCatalogo,
    actualizarRazaCatalogo,
    eliminarRazaCatalogo,
  } = usePetStore();
  const esAdmin = esUsuarioAdmin(user);

  const [categoria, setCategoria] = useState<'Perros' | 'Gatos' | 'Otros'>('Perros');
  const [busqueda, setBusqueda] = useState('');
  const [razaDetalle, setRazaDetalle] = useState<BreedItem | null>(null);

  // Estado de la ventana flotante de Administrador con selector multimedia (sin URL manual)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [modalAdminAbierto, setModalAdminAbierto] = useState(false);
  const [razaEditando, setRazaEditando] = useState<BreedItem | null>(null);
  const [catForm, setCatForm] = useState<'Perros' | 'Gatos' | 'Otros'>('Perros');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaImgBase64, setNuevaImgBase64] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [tareasSugeridasForm, setTareasSugeridasForm] = useState<string[]>([]);
  const [tareaInput, setTareaInput] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCatalogo();
    sincronizarRolDesdeBD();
  }, [cargarCatalogo, sincronizarRolDesdeBD]);

  const razasFiltradas = catalogRazas.filter(
    (r) =>
      (r.category || 'Perros') === categoria &&
      (r.name || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const especieParaSilueta = (cat: 'Perros' | 'Gatos' | 'Otros', nombre?: string) => {
    if (cat === 'Perros') return 'Perro';
    if (cat === 'Gatos') return 'Gato';
    if (nombre?.toLowerCase().includes('conejo')) return 'Conejo';
    return 'Otro';
  };

  const abrirModalCrear = () => {
    setRazaEditando(null);
    setCatForm(categoria);
    setNuevoNombre('');
    setNuevaDesc('');
    setNuevaImgBase64('');
    setNombreArchivo('');
    setTareasSugeridasForm(['Dar alimento adecuado', 'Renovar agua fresca', 'Cuidado diario']);
    setTareaInput('');
    setModalAdminAbierto(true);
  };

  const abrirModalEditar = (raza: BreedItem) => {
    setRazaEditando(raza);
    setCatForm(raza.category);
    setNuevoNombre(raza.name);
    setNuevaDesc(raza.desc);
    setNuevaImgBase64(raza.img || '');
    setNombreArchivo('');
    setTareasSugeridasForm(
      raza.suggestedTasks?.length
        ? [...raza.suggestedTasks]
        : ['Dar alimento adecuado', 'Agua fresca']
    );
    setTareaInput('');
    setModalAdminAbierto(true);
  };

  const manejarSeleccionMultimedia = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    try {
      setNombreArchivo(archivo.name);
      const comprimida = await comprimirImagenMultimedia(archivo, 720, 0.82);
      setNuevaImgBase64(comprimida);
    } catch {
      setNombreArchivo('');
    }
  };

  const quitarImagenMultimedia = () => {
    setNuevaImgBase64('');
    setNombreArchivo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const agregarTareaSugerida = () => {
    if (!tareaInput.trim()) return;
    setTareasSugeridasForm([...tareasSugeridasForm, tareaInput.trim()]);
    setTareaInput('');
  };

  const quitarTareaSugerida = (idx: number) => {
    setTareasSugeridasForm(tareasSugeridasForm.filter((_, i) => i !== idx));
  };

  const handleGuardarRazaAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevaDesc.trim()) return;

    setGuardando(true);
    const payload = {
      name: nuevoNombre.trim(),
      category: catForm,
      desc: nuevaDesc.trim(),
      img: nuevaImgBase64,
      bg: 'bg-green-50',
      suggestedTasks:
        tareasSugeridasForm.length > 0
          ? tareasSugeridasForm
          : ['Dar alimento adecuado', 'Agua fresca', 'Cuidado diario'],
    };

    if (razaEditando) {
      await actualizarRazaCatalogo(razaEditando._id, payload);
    } else {
      await agregarRazaCatalogo(payload);
      setCategoria(catForm);
    }

    setGuardando(false);
    setModalAdminAbierto(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 p-5">
      <div className="flex justify-between items-center mb-5 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {categoria === 'Otros' ? 'Otros animales' : 'Razas'}
          </h1>
          <p className="text-xs text-gray-500">
            Explora características y cuidados recomendados por especie
          </p>
        </div>

        {esAdmin && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus size={15} />
            <span>Agregar</span>
          </button>
        )}
      </div>

      {/* Pestañas de categoría unificadas */}
      <div className="flex gap-2 mb-4">
        {(['Perros', 'Gatos', 'Otros'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoria(cat)}
            className={`flex-1 font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer ${
              categoria === cat
                ? 'bg-green-700 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
            }`}
          >
            {cat === 'Otros' ? 'Otros animales' : cat}
          </button>
        ))}
      </div>

      {/* Buscador disponible en todas las categorías */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={
            categoria === 'Otros' ? 'Buscar especie (ej. Conejos, Aves)...' : 'Buscar raza...'
          }
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:border-green-600 focus:outline-none text-sm"
        />
      </div>

      {/* Tarjetas verticales más largas, centralizadas y con imágenes de alta calidad */}
      <div className="grid grid-cols-2 gap-4">
        {razasFiltradas.map((item) => (
          <div
            key={item._id}
            onClick={() => setRazaDetalle(item)}
            className="group bg-white rounded-3xl p-3 shadow-xs border border-gray-100 hover:border-green-300 hover:shadow-md transition-all relative flex flex-col justify-between cursor-pointer"
          >
            {esAdmin && (
              <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirModalEditar(item);
                  }}
                  className="bg-white/95 p-1.5 rounded-full shadow-sm text-gray-600 hover:text-green-700 cursor-pointer"
                  title="Editar (Admin)"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarRazaCatalogo(item._id);
                  }}
                  className="bg-white/95 p-1.5 rounded-full shadow-sm text-red-500 hover:bg-red-50 cursor-pointer"
                  title="Eliminar del catálogo (Admin)"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            <div>
              <PetAvatar
                imageUrl={item.img}
                name={item.name}
                species={especieParaSilueta(item.category, item.name)}
                className="w-full h-52 sm:h-60 rounded-2xl mb-3"
                imgClassName="group-hover:scale-105 transition-transform duration-300"
                iconSize={64}
              />

              <div className="px-1 text-center">
                <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.desc}</p>
              </div>
            </div>

            {item.suggestedTasks?.length > 0 && (
              <p className="text-[11px] font-medium text-green-800 bg-green-50 border border-green-100 rounded-xl px-2.5 py-1.5 mt-3 text-center truncate">
                ✓ {item.suggestedTasks[0]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 mt-6">
        <PawPrint size={20} className="text-green-700 shrink-0" />
        <p className="text-xs font-semibold text-green-900">
          Toca cualquier tarjeta para ver su imagen completa y la rutina de cuidados recomendada.
        </p>
      </div>

      {/* Ventana flotante con el detalle completo de la raza seleccionada */}
      {razaDetalle && (
        <ModalVentana
          abierto={Boolean(razaDetalle)}
          onCerrar={() => setRazaDetalle(null)}
          titulo={razaDetalle.name}
          subtitulo={razaDetalle.desc}
          badge={razaDetalle.category === 'Otros' ? 'Otras especies' : razaDetalle.category}
        >
          <div className="space-y-4">
            <PetAvatar
              imageUrl={razaDetalle.img}
              name={razaDetalle.name}
              species={especieParaSilueta(razaDetalle.category, razaDetalle.name)}
              className="w-full h-64 rounded-2xl"
              iconSize={76}
            />

            <div>
              <h4 className="text-xs font-bold text-gray-800 mb-2">
                Cuidados y tareas sugeridas al registrar esta especie/raza:
              </h4>
              <div className="space-y-1.5">
                {razaDetalle.suggestedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-green-50/60 border border-green-100 px-3 py-2 rounded-xl text-xs text-green-900"
                  >
                    <CheckCircle2 size={14} className="text-green-700 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalVentana>
      )}

      {/* Ventana flotante de Administrador con selector de imagen desde multimedia */}
      <ModalVentana
        abierto={modalAdminAbierto}
        onCerrar={() => setModalAdminAbierto(false)}
        titulo={razaEditando ? `Editar ${razaEditando.name}` : `Agregar a ${catForm}`}
        subtitulo="Se guardará en el catálogo global de MongoDB"
        badge="Panel Administrador"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={manejarSeleccionMultimedia}
          className="hidden"
        />

        <form onSubmit={handleGuardarRazaAdmin} className="space-y-3.5">
          {/* Vista previa vertical y selector de multimedia (sin campo URL) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-44 h-52 rounded-2xl border-2 border-green-100 shadow-xs overflow-hidden cursor-pointer group"
            >
              <PetAvatar
                imageUrl={nuevaImgBase64}
                name={nuevoNombre || catForm}
                species={especieParaSilueta(catForm, nuevoNombre)}
                className="w-full h-full rounded-2xl"
                iconSize={58}
                showLabel={!nuevaImgBase64}
              />
              <div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
                <Camera size={15} className="text-green-700" />
              </div>
            </button>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3.5 py-2 rounded-full border border-green-200 transition-colors cursor-pointer"
              >
                <Upload size={14} />
                <span>{nuevaImgBase64 ? 'Cambiar imagen' : 'Seleccionar desde multimedia'}</span>
              </button>

              {nuevaImgBase64 && (
                <button
                  type="button"
                  onClick={quitarImagenMultimedia}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full border border-red-100 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Quitar</span>
                </button>
              )}
            </div>

            {nombreArchivo && (
              <p className="text-[11px] text-gray-400 mt-1">Imagen seleccionada: {nombreArchivo}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
              <select
                value={catForm}
                onChange={(e) => setCatForm(e.target.value as 'Perros' | 'Gatos' | 'Otros')}
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
              >
                <option value="Perros">Perros</option>
                <option value="Gatos">Gatos</option>
                <option value="Otros">Otros animales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Nombre de raza / especie
              </label>
              <input
                type="text"
                required
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej. Shiba Inu, Cacatúa..."
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Descripción breve
            </label>
            <input
              type="text"
              required
              value={nuevaDesc}
              onChange={(e) => setNuevaDesc(e.target.value)}
              placeholder="Ej. Leal, ágil y muy atento"
              className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tareas sugeridas predeterminadas
            </label>
            <div className="space-y-1.5 mb-2 max-h-28 overflow-y-auto pr-1">
              {tareasSugeridasForm.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-green-50/70 border border-green-100 px-3 py-1.5 rounded-xl text-xs text-green-900"
                >
                  <span>• {t}</span>
                  <button
                    type="button"
                    onClick={() => quitarTareaSugerida(idx)}
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
                value={tareaInput}
                onChange={(e) => setTareaInput(e.target.value)}
                placeholder="Añadir cuidado sugerido..."
                className="flex-1 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-green-600"
              />
              <button
                type="button"
                onClick={agregarTareaSugerida}
                className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-green-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {guardando
              ? 'Guardando en MongoDB...'
              : razaEditando
                ? 'Guardar cambios en catálogo'
                : 'Guardar en catálogo de razas'}
          </button>
        </form>
      </ModalVentana>
    </div>
  );
}
