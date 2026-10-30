import { useState, useEffect, type FormEvent } from 'react';
import {
  ChevronRight,
  Footprints,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Shield,
  CheckCircle2,
  FileText,
  Info,
} from 'lucide-react';
import PetAvatar from '../components/PetAvatar';
import ModalVentana from '../components/ModalVentana';
import PetFormModal from '../components/PetFormModal';
import { usePetStore, type Pet, type TipItem } from '../store/usePetStore';
import { useAuthStore, esUsuarioAdmin } from '../store/useAuthStore';

export default function Recomendaciones() {
  const { user, sincronizarRolDesdeBD } = useAuthStore();
  const {
    pets,
    catalogRazas,
    catalogTips,
    cargarDatos,
    cargarCatalogo,
    obtenerTareasSugeridas,
    agregarTipCatalogo,
    actualizarTipCatalogo,
    eliminarTipCatalogo,
  } = usePetStore();
  const esAdmin = esUsuarioAdmin(user);

  const [mascotaVentana, setMascotaVentana] = useState<Pet | null>(null);
  const [mascotaEditarIndicaciones, setMascotaEditarIndicaciones] = useState<Pet | null>(null);
  const [filtroEspecie, setFiltroEspecie] = useState<string>('Todos');
  const [tipExpandido, setTipExpandido] = useState<string | null>(null);

  // Estado de la ventana flotante de Administrador para agregar o editar Tips
  const [modalTipAdmin, setModalTipAdmin] = useState(false);
  const [tipEditando, setTipEditando] = useState<TipItem | null>(null);
  const [tituloTip, setTituloTip] = useState('');
  const [descTip, setDescTip] = useState('');
  const [detalleTip, setDetalleTip] = useState('');
  const [especieTip, setEspecieTip] = useState('Todos');
  const [iconoTip, setIconoTip] = useState('footprints');
  const [guardandoTip, setGuardandoTip] = useState(false);

  useEffect(() => {
    cargarDatos(user?.id);
    cargarCatalogo();
    sincronizarRolDesdeBD();
  }, [cargarDatos, cargarCatalogo, sincronizarRolDesdeBD, user?.id]);

  // Mantiene sincronizada la mascota abierta si el usuario edita sus indicaciones
  const mascotaActivaModal = mascotaVentana
    ? pets.find((p) => p._id === mascotaVentana._id) || mascotaVentana
    : null;

  const tipsFiltrados =
    filtroEspecie === 'Todos'
      ? catalogTips
      : catalogTips.filter((t) => {
          const esp = (t.species || 'Todos').toLowerCase();
          return esp === 'todos' || esp.includes(filtroEspecie.toLowerCase());
        });

  const obtenerEstiloIcono = (iconType: string) => {
    if (iconType === 'sparkles') {
      return { icon: <Sparkles size={20} className="text-teal-700" />, bg: 'bg-teal-50' };
    }
    if (iconType === 'heart') {
      return { icon: <Heart size={20} className="text-emerald-700" />, bg: 'bg-emerald-50' };
    }
    return { icon: <Footprints size={20} className="text-green-700" />, bg: 'bg-green-50' };
  };

  // Genera recomendaciones adicionales según la edad y las indicaciones escritas por el usuario
  const generarAnalisisMascota = (pet: Pet) => {
    const infoRaza = catalogRazas.find(
      (r) => r.name.toLowerCase() === pet.breed.toLowerCase()
    );
    const cuidadosRaza = obtenerTareasSugeridas(pet.species, pet.breed);

    let etapaVida = 'Etapa adulta: mantén raciones medidas, hidratación constante y revisión anual.';
    if (pet.age <= 1) {
      etapaVida =
        'Etapa juvenil / cachorro: requiere refuerzo en su esquema de vacunación, socialización temprana y alimento de crecimiento.';
    } else if (pet.age >= 8) {
      etapaVida =
        'Etapa senior: prioriza paseos suaves, chequeos articulares y dentales cada 6 meses.';
    }

    const notas = (pet.characteristics || '').toLowerCase();
    const consejosPorIndicacion: string[] = [];
    if (notas.includes('pelaje') || notas.includes('pelo') || notas.includes('largo')) {
      consejosPorIndicacion.push(
        'Por su tipo de pelaje: realiza cepillado frecuente para evitar nudos y acumulación de humedad en la piel.'
      );
    }
    if (notas.includes('calor') || notas.includes('sol')) {
      consejosPorIndicacion.push(
        'Sensibilidad térmica: programa sus paseos temprano o al atardecer y mantén agua fresca a la sombra.'
      );
    }
    if (notas.includes('alerg') || notas.includes('piel') || notas.includes('pollo') || notas.includes('dieta')) {
      consejosPorIndicacion.push(
        'Cuidado alimenticio/dermatológico: respeta estrictamente su dieta indicada y evita premios con ingredientes no habituales.'
      );
    }
    if (notas.includes('juguet') || notas.includes('activ') || notas.includes('energ')) {
      consejosPorIndicacion.push(
        'Nivel alto de energía: combina ejercicio físico con juegos de olfato o estimulación mental diaria.'
      );
    }
    if (notas.includes('tranquil') || notas.includes('dormir') || notas.includes('casa')) {
      consejosPorIndicacion.push(
        'Temperamento tranquilo: vigila sus porciones de alimento e incentiva sesiones breves de juego para cuidar su peso.'
      );
    }

    const tipsEspecie = catalogTips.filter((t) => {
      const esp = (t.species || 'Todos').toLowerCase();
      return esp === 'todos' || esp.includes(pet.species.toLowerCase());
    });

    return { infoRaza, cuidadosRaza, etapaVida, consejosPorIndicacion, tipsEspecie };
  };

  const abrirModalNuevoTip = () => {
    setTipEditando(null);
    setTituloTip('');
    setDescTip('');
    setDetalleTip('');
    setEspecieTip('Todos');
    setIconoTip('footprints');
    setModalTipAdmin(true);
  };

  const abrirModalEditarTip = (tip: TipItem) => {
    setTipEditando(tip);
    setTituloTip(tip.title);
    setDescTip(tip.desc);
    setDetalleTip(tip.detail || '');
    setEspecieTip(tip.species || 'Todos');
    setIconoTip(tip.iconType || 'footprints');
    setModalTipAdmin(true);
  };

  const handleGuardarTipAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!tituloTip.trim() || !descTip.trim()) return;

    setGuardandoTip(true);
    const payload = {
      title: tituloTip.trim(),
      desc: descTip.trim(),
      detail: detalleTip.trim() || descTip.trim(),
      species: especieTip,
      iconType: iconoTip,
    };

    if (tipEditando) {
      await actualizarTipCatalogo(tipEditando._id, payload);
    } else {
      await agregarTipCatalogo(payload);
    }

    setGuardandoTip(false);
    setModalTipAdmin(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 p-5">
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recomendaciones</h1>
          <p className="text-xs text-gray-500">
            Selecciona una mascota para ver su guía por raza y tus indicaciones
          </p>
        </div>
        {esAdmin && (
          <button
            type="button"
            onClick={abrirModalNuevoTip}
            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus size={15} />
            <span>Agregar Tip</span>
          </button>
        )}
      </div>

      {/* Ventanas 2x2 de las mascotas del usuario */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">Guía personalizada por mascota</h2>
        {pets.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-gray-100 shadow-xs">
            <p className="text-sm text-gray-500">
              Agrega una mascota en Inicio para recibir recomendaciones adaptadas a su raza e indicaciones.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {pets.map((pet) => (
              <button
                key={pet._id}
                type="button"
                onClick={() => setMascotaVentana(pet)}
                className="group bg-white rounded-3xl p-3 shadow-xs border border-gray-100 hover:border-green-300 hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <PetAvatar
                    imageUrl={pet.imageUrl}
                    name={pet.name}
                    species={pet.species}
                    className="w-full h-36 sm:h-40 rounded-2xl mb-2.5"
                    imgClassName="group-hover:scale-105 transition-transform duration-300"
                    iconSize={56}
                  />
                  <div className="px-1">
                    <h3 className="font-bold text-gray-900 text-base truncate">{pet.name}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {pet.species} • {pet.breed}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 px-2.5 py-1.5 bg-green-50 rounded-xl flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-green-800 truncate">
                    {pet.characteristics ? 'Ver guía + indicaciones' : 'Ver guía de raza'}
                  </span>
                  <ChevronRight size={14} className="text-green-700 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Catálogo general de consejos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Consejos de bienestar</h2>
          {esAdmin && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-800 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
              <Shield size={12} />
              <span>Modo Admin</span>
            </span>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {(['Todos', 'Perro', 'Gato', 'Conejo', 'Ave'] as const).map((esp) => (
            <button
              key={esp}
              type="button"
              onClick={() => setFiltroEspecie(esp)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                filtroEspecie === esp
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
              }`}
            >
              {esp === 'Todos' ? `Todos (${catalogTips.length})` : esp}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {tipsFiltrados.map((tip) => {
            const { icon, bg } = obtenerEstiloIcono(tip.iconType);
            const abierto = tipExpandido === tip._id;
            return (
              <div
                key={tip._id}
                onClick={() => setTipExpandido(abierto ? null : tip._id)}
                className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 hover:border-green-200 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-gray-900">{tip.title}</p>
                        <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                          {tip.species || 'Todos'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {esAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalEditarTip(tip);
                          }}
                          className="p-2 text-gray-400 hover:text-green-700 cursor-pointer"
                          title="Editar recomendación (Admin)"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarTipCatalogo(tip._id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
                          title="Eliminar recomendación (Admin)"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                    <ChevronRight
                      size={20}
                      className={`text-gray-400 transition-transform ${abierto ? 'rotate-90' : ''}`}
                    />
                  </div>
                </div>
                {abierto && tip.detail && (
                  <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                    {tip.detail}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Ventana flotante con la información general de la raza y las indicaciones propias del usuario */}
      {mascotaActivaModal && (() => {
        const { infoRaza, cuidadosRaza, etapaVida, consejosPorIndicacion, tipsEspecie } =
          generarAnalisisMascota(mascotaActivaModal);

        return (
          <ModalVentana
            abierto={Boolean(mascotaActivaModal)}
            onCerrar={() => setMascotaVentana(null)}
            titulo={`Guía de cuidado para ${mascotaActivaModal.name}`}
            subtitulo={`${mascotaActivaModal.species} • ${mascotaActivaModal.breed} • ${mascotaActivaModal.age} ${mascotaActivaModal.age === 1 ? 'año' : 'años'}`}
            badge="Recomendación personalizada"
            maxWidthClass="max-w-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-green-50/60 border border-green-100 rounded-2xl p-3.5">
                <PetAvatar
                  imageUrl={mascotaActivaModal.imageUrl}
                  name={mascotaActivaModal.name}
                  species={mascotaActivaModal.species}
                  className="w-20 h-20 rounded-2xl shrink-0 border border-white shadow-xs"
                  iconSize={44}
                />
                <div>
                  <p className="text-xs font-bold text-green-800">
                    Perfil de raza: {mascotaActivaModal.breed}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {infoRaza
                      ? infoRaza.desc
                      : `Cuidados generales recomendados para ${mascotaActivaModal.species}.`}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">{etapaVida}</p>
                </div>
              </div>

              {/* Sección 1: Indicaciones proporcionadas por el propio usuario */}
              <div className="bg-white border border-green-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <FileText size={14} className="text-green-700" />
                    <span>Tus indicaciones para {mascotaActivaModal.name}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMascotaEditarIndicaciones(mascotaActivaModal)}
                    className="text-[11px] font-semibold text-green-700 hover:underline cursor-pointer"
                  >
                    {mascotaActivaModal.characteristics ? 'Editar' : '+ Agregar'}
                  </button>
                </div>

                {mascotaActivaModal.characteristics ? (
                  <>
                    <p className="text-xs text-green-900 bg-green-50/80 rounded-xl px-3 py-2 border border-green-100">
                      "{mascotaActivaModal.characteristics}"
                    </p>
                    {consejosPorIndicacion.length > 0 && (
                      <ul className="mt-2.5 space-y-1.5">
                        {consejosPorIndicacion.map((c, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-500">
                    Aún no has escrito indicaciones propias (como alergias, tipo de pelaje, dieta o conducta). Agrégalas para personalizar aún más esta guía.
                  </p>
                )}
              </div>

              {/* Sección 2: Rutina sugerida según su raza */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                  <Info size={14} className="text-green-700" />
                  <span>Rutina ideal según su raza ({mascotaActivaModal.breed})</span>
                </h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {cuidadosRaza.map((tarea, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-gray-700 bg-white px-3 py-2 rounded-xl border border-gray-100"
                    >
                      <CheckCircle2 size={14} className="text-green-700 shrink-0" />
                      <span>{tarea}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 3: Consejos de su especie */}
              {tipsEspecie.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-900 mb-2">
                    Consejos clave para {mascotaActivaModal.species}
                  </h3>
                  <div className="space-y-2">
                    {tipsEspecie.slice(0, 4).map((t) => (
                      <div
                        key={t._id}
                        className="bg-white border border-gray-100 rounded-xl p-3"
                      >
                        <p className="text-xs font-semibold text-gray-900">{t.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{t.detail || t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalVentana>
        );
      })()}

      {/* Sub-ventana para editar indicaciones de la mascota */}
      <PetFormModal
        abierto={Boolean(mascotaEditarIndicaciones)}
        onCerrar={() => setMascotaEditarIndicaciones(null)}
        mascotaEditar={mascotaEditarIndicaciones}
      />

      {/* Ventana flotante de Administrador para agregar o editar Tips */}
      <ModalVentana
        abierto={modalTipAdmin}
        onCerrar={() => setModalTipAdmin(false)}
        titulo={tipEditando ? 'Editar recomendación' : 'Nueva recomendación'}
        subtitulo="Se publicará en el catálogo global de MongoDB para todos los usuarios"
        badge="Panel Administrador"
      >
        <form onSubmit={handleGuardarTipAdmin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Título del consejo
            </label>
            <input
              type="text"
              required
              value={tituloTip}
              onChange={(e) => setTituloTip(e.target.value)}
              placeholder="Ej. Hidratación en temporada de calor"
              className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Resumen breve
            </label>
            <input
              type="text"
              required
              value={descTip}
              onChange={(e) => setDescTip(e.target.value)}
              placeholder="Ej. Previene golpes de calor y deshidratación"
              className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Explicación detallada
            </label>
            <textarea
              rows={3}
              value={detalleTip}
              onChange={(e) => setDetalleTip(e.target.value)}
              placeholder="Escribe la recomendación completa para el cuidado de la mascota..."
              className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Especie destino
              </label>
              <select
                value={especieTip}
                onChange={(e) => setEspecieTip(e.target.value)}
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-xs"
              >
                <option value="Todos">Todas las especies</option>
                <option value="Perro">Perros</option>
                <option value="Gato">Gatos</option>
                <option value="Conejo">Conejos</option>
                <option value="Ave">Aves</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Ícono visual
              </label>
              <select
                value={iconoTip}
                onChange={(e) => setIconoTip(e.target.value)}
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none text-xs"
              >
                <option value="footprints">Actividad / Huella</option>
                <option value="sparkles">Higiene / Pelaje</option>
                <option value="heart">Salud / Bienestar</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardandoTip}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {guardandoTip
              ? 'Guardando en MongoDB...'
              : tipEditando
                ? 'Actualizar recomendación'
                : 'Publicar recomendación'}
          </button>
        </form>
      </ModalVentana>
    </div>
  );
}
