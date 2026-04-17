/**
 * Experiencias.tsx — Página de experiencias de viajeros (ruta: /experiencias)
 *
 * Permite a los usuarios compartir sus experiencias de viaje y ver las de otros.
 * En esta versión solo se implementa la UI — sin conexión al backend.
 *
 * Estructura de la página:
 *   - Header naranja con título
 *   - Layout de 2 columnas:
 *       Izquierda (sticky): Formulario para publicar una experiencia
 *       Derecha:            Filtros + feed de tarjetas de experiencias
 *
 * Pendiente de implementar:
 *   - Conectar el formulario a la API (POST /experiencias)
 *   - Cargar experiencias reales desde la API (GET /experiencias)
 *   - Sistema de likes con autenticación
 *   - Subida real de imágenes al servidor
 */

import { useState } from "react";
import { Star, Upload, ThumbsUp, MessageCircle, MapPin, User, ImageIcon } from "lucide-react";

// ── Datos estáticos de ejemplo ────────────────────────────────────────────────
const DESTINOS = [
  "Cancún, México",
  "Medellín, Colombia",
  "La Habana, Cuba",
  "Tulum, México",
  "Cartagena, Colombia",
  "Buenos Aires, Argentina",
  "Cusco, Perú",
];

const FILTROS = [
  { label: "Todas",       valor: 0 },
  { label: "5 estrellas", valor: 5 },
  { label: "4+ estrellas",valor: 4 },
  { label: "3+ estrellas",valor: 3 },
];

interface Experiencia {
  id: number;
  usuario: string;
  iniciales: string;
  destino: string;
  rating: number;
  texto: string;
  fecha: string;
  likes: number;
  imagen?: string;
}

const EXPERIENCIAS: Experiencia[] = [
  {
    id: 1,
    usuario: "UsuarioEjemplo",
    iniciales: "UE",
    destino: "La Habana, Cuba",
    rating: 5,
    texto: "¡Este lugar es increíble, lo recomiendo totalmente! La música en cada esquina y la gente tan amable hacen de La Habana un destino único. Cada rincón de la ciudad tiene una historia que contar.",
    fecha: "15 de octubre, 2023",
    likes: 12,
  },
  {
    id: 2,
    usuario: "Viajera_Ana",
    iniciales: "VA",
    destino: "Cancún, México",
    rating: 4,
    texto: "Las playas son exactamente como en las fotos. El agua turquesa y la arena blanca son simplemente perfectas. El hotel podría mejorar el servicio, pero en general una experiencia increíble que repetiría sin dudarlo.",
    fecha: "3 de noviembre, 2023",
    likes: 8,
    imagen: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    usuario: "Carlos_Viajes",
    iniciales: "CV",
    destino: "Medellín, Colombia",
    rating: 5,
    texto: "La ciudad de la eterna primavera no decepciona. Los paisajes, la gastronomía y sobre todo la gente hacen de Medellín un destino único en el mundo. El Metro Cable es una experiencia que no puedes perderte.",
    fecha: "22 de noviembre, 2023",
    likes: 24,
  },
  {
    id: 4,
    usuario: "SofíaExplora",
    iniciales: "SE",
    destino: "Buenos Aires, Argentina",
    rating: 4,
    texto: "Buenos Aires tiene una energía especial. La arquitectura europea mezclada con la cultura latinoamericana crea algo difícil de describir. El barrio de San Telmo y La Boca son paradas obligatorias.",
    fecha: "10 de diciembre, 2023",
    likes: 17,
  },
];

// ── Componente de estrellas reutilizable ──────────────────────────────────────
function Estrellas({ cantidad, max = 5 }: { cantidad: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < cantidad ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

// ── Componente de tarjeta de experiencia ─────────────────────────────────────
function ExperienciaCard({ exp }: { exp: Experiencia }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 space-y-3">

      {/* Encabezado: avatar + usuario + destino */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
          {exp.iniciales}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">{exp.usuario}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {exp.destino}
          </p>
        </div>
      </div>

      {/* Rating */}
      <Estrellas cantidad={exp.rating} />

      {/* Texto de la experiencia */}
      <p className="text-sm text-gray-600 leading-relaxed">{exp.texto}</p>

      {/* Imagen adjunta (opcional) */}
      {exp.imagen && (
        <div className="rounded-xl overflow-hidden h-48">
          <img
            src={exp.imagen}
            alt={`Imagen de ${exp.destino}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Pie: fecha + acciones */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400">{exp.fecha}</p>
        <div className="flex items-center gap-2">
          {/* Botón de like — solo UI */}
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 transition">
            <ThumbsUp className="w-3.5 h-3.5" />
            {exp.likes}
          </button>
          {/* Botón comentar — solo UI */}
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">
            <MessageCircle className="w-3.5 h-3.5" />
            Comentar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Experiencias() {
  // Estado del formulario (solo UI, sin envío al backend)
  const [ratingHover,    setRatingHover]    = useState(0);
  const [ratingSelected, setRatingSelected] = useState(0);
  const [texto,          setTexto]          = useState("");
  const [filtroActivo,   setFiltroActivo]   = useState(0);

  const MAX_CHARS = 500;

  // Filtra las experiencias según el filtro activo (solo UI, sin API)
  const experienciasFiltradas = filtroActivo === 0
    ? EXPERIENCIAS
    : EXPERIENCIAS.filter((e) => e.rating >= filtroActivo);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Cabecera de sección ──────────────────────────────────────────── */}
      <div className="bg-orange-600 px-6 py-12 text-white text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-4">
          <Star className="w-3 h-3 fill-white" />
          Comunidad de viajeros
        </span>
        <h1 className="text-3xl font-black md:text-4xl">Experiencias</h1>
        <p className="text-orange-100 text-sm mt-2 max-w-md mx-auto">
          Comparte tu viaje e inspira a otros aventureros
        </p>
      </div>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">

          {/* ══════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA — Formulario de publicación
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            <div>
              <h2 className="text-lg font-black text-gray-900">Escribe tu experiencia</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ayuda a otros viajeros con tu opinión</p>
            </div>

            {/* Selector de destino */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ¿Sobre qué destino escribes?
              </label>
              <select
                defaultValue=""
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
              >
                <option value="" disabled>Selecciona un destino</option>
                {DESTINOS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Calificación con estrellas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Califica tu experiencia
              </label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  const activa = val <= (ratingHover || ratingSelected);
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setRatingHover(val)}
                      onMouseLeave={() => setRatingHover(0)}
                      onClick={() => setRatingSelected(val)}
                      className="transition-transform hover:scale-110"
                      aria-label={`${val} estrellas`}
                    >
                      <Star className={`w-7 h-7 transition-colors ${activa ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs text-gray-400">
                  {ratingSelected > 0 ? `${ratingSelected}/5` : "0/5"}
                </span>
              </div>
            </div>

            {/* Subida de imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto del viaje <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-orange-300 transition cursor-pointer bg-gray-50 hover:bg-orange-50">
                {/* Placeholder de preview */}
                <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-orange-400 hover:text-orange-600 transition shadow-sm"
                  >
                    <Upload className="w-3 h-3 inline mr-1" />
                    Seleccionar imagen
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1.5">JPG, PNG o WEBP · Máx. 5MB</p>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Comparte tu experiencia..."
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
              />
              {/* Contador de caracteres */}
              <p className={`text-xs mt-1 text-right ${texto.length >= MAX_CHARS ? "text-red-500" : "text-gray-400"}`}>
                {texto.length}/{MAX_CHARS} caracteres
              </p>
            </div>

            {/* Botón publicar */}
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition shadow-md shadow-orange-900/20 active:scale-95"
            >
              Publicar experiencia
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════
              COLUMNA DERECHA — Filtros + Feed de experiencias
          ══════════════════════════════════════════════════════════ */}
          <div className="space-y-6">

            {/* Filtros */}
            <div>
              <h2 className="text-base font-black text-gray-900 mb-3">Filtrar experiencias</h2>
              <div className="flex flex-wrap gap-2">
                {FILTROS.map(({ label, valor }) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setFiltroActivo(valor)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                      filtroActivo === valor
                        ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-900/20"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                    }`}
                  >
                    {valor > 0 && (
                      <Star className="w-3 h-3 fill-current inline mr-1 -mt-0.5" />
                    )}
                    {label}
                  </button>
                ))}
                {/* Contador de resultados */}
                <span className="ml-auto text-xs text-gray-400 self-center">
                  {experienciasFiltradas.length} {experienciasFiltradas.length === 1 ? "resultado" : "resultados"}
                </span>
              </div>
            </div>

            {/* Feed de experiencias */}
            {experienciasFiltradas.length > 0 ? (
              <div className="space-y-4">
                {experienciasFiltradas.map((exp) => (
                  <ExperienciaCard key={exp.id} exp={exp} />
                ))}
              </div>
            ) : (
              /* Estado vacío */
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-4">
                  <Star className="w-8 h-8 text-orange-300" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Sin experiencias para este filtro</h3>
                <p className="text-sm text-gray-400">Intenta con otro filtro o sé el primero en publicar</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
