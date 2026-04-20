import { useState, useEffect, useRef } from "react";
import { Star, Upload, ThumbsUp, MapPin, ImageIcon, Loader2, X } from "lucide-react";
import client from "../../infrastructure/api/client";
import AuthService from "../../infrastructure/services/auth.service";

const FILTROS = [
  { label: "Todas",        valor: 1 },
  { label: "5 estrellas",  valor: 5 },
  { label: "4+ estrellas", valor: 4 },
  { label: "3+ estrellas", valor: 3 },
];

interface Experiencia {
  id:              number;
  usuario_nombre:  string;
  destino:         string;
  rating:          number;
  texto:           string;
  fecha:           string;
  likes:           number;
  imagen:          string | null;
}

// ── Componente de estrellas ───────────────────────────────────────────────────
function Estrellas({ cantidad, max = 5 }: { cantidad: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < cantidad ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

// ── Tarjeta de experiencia ────────────────────────────────────────────────────
function ExperienciaCard({ exp, onLike }: { exp: Experiencia; onLike: (id: number) => void }) {
  const iniciales = exp.usuario_nombre
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const fecha = new Date(exp.fecha).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
          {iniciales}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">{exp.usuario_nombre}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />{exp.destino}
          </p>
        </div>
      </div>

      <Estrellas cantidad={exp.rating} />

      <p className="text-sm text-gray-600 leading-relaxed">{exp.texto}</p>

      {exp.imagen && (
        <div className="rounded-xl overflow-hidden h-48">
          <img src={exp.imagen} alt={`Imagen de ${exp.destino}`} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400">{fecha}</p>
        <button
          onClick={() => onLike(exp.id)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 transition"
        >
          <ThumbsUp className="w-3.5 h-3.5" />{exp.likes}
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Experiencias() {
  const isAuth = AuthService.isAuthenticated();

  const [experiencias,     setExperiencias]     = useState<Experiencia[]>([]);
  const [cargando,         setCargando]         = useState(true);
  const [filtroActivo,     setFiltroActivo]     = useState(1);

  // Destinos disponibles desde las reservas del usuario
  const [destinos,         setDestinos]         = useState<string[]>([]);
  const [cargandoDestinos, setCargandoDestinos] = useState(false);

  // Formulario
  const [destino,         setDestino]         = useState("");
  const [ratingSelected,  setRatingSelected]  = useState(0);
  const [ratingHover,     setRatingHover]     = useState(0);
  const [texto,           setTexto]           = useState("");
  const [enviando,        setEnviando]        = useState(false);
  const [errorForm,       setErrorForm]       = useState("");
  const [exitoForm,       setExitoForm]       = useState("");

  // Imagen
  const [imagenFile,    setImagenFile]    = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 500;

  // Cargar experiencias al montar o cambiar filtro
  useEffect(() => {
    setCargando(true);
    client.get(`/api/experiencias?minRating=${filtroActivo}`, { skipAuthRedirect: true } as object)
      .then((res) => setExperiencias(res.data.data ?? []))
      .catch(() => setExperiencias([]))
      .finally(() => setCargando(false));
  }, [filtroActivo]);

  // Cargar destinos del usuario autenticado desde sus reservas
  useEffect(() => {
    if (!isAuth) return;
    setCargandoDestinos(true);
    client.get("/api/auth/reservas", { skipAuthRedirect: true } as object)
      .then((res) => {
        const reservas: { destination: string; estado: string }[] = res.data.data ?? [];
        const confirmadas = reservas.filter((r) => r.estado !== "Cancelada");
        const unicos = [...new Set(confirmadas.map((r) => r.destination))].filter(Boolean);
        setDestinos(unicos);
      })
      .catch(() => {})
      .finally(() => setCargandoDestinos(false));
  }, [isAuth]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagenPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const quitarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  const handlePublicar = async () => {
    setErrorForm("");
    setExitoForm("");

    if (!isAuth)               { setErrorForm("Debes iniciar sesión para publicar."); return; }
    if (!destino)              { setErrorForm("Selecciona un destino."); return; }
    if (ratingSelected === 0)  { setErrorForm("Selecciona una calificación."); return; }
    if (texto.trim().length < 10) { setErrorForm("El texto debe tener al menos 10 caracteres."); return; }

    setEnviando(true);
    try {
      let res;
      if (imagenFile) {
        const formData = new FormData();
        formData.append("destino", destino);
        formData.append("rating", String(ratingSelected));
        formData.append("texto", texto.trim());
        formData.append("imagen", imagenFile);
        res = await client.post("/api/experiencias", formData);
      } else {
        res = await client.post("/api/experiencias", {
          destino,
          rating: ratingSelected,
          texto: texto.trim(),
        });
      }

      const nueva: Experiencia = res.data.data;
      setExperiencias((prev) => [nueva, ...prev]);
      setDestino("");
      setRatingSelected(0);
      setTexto("");
      quitarImagen();
      setExitoForm("¡Experiencia publicada!");
      setTimeout(() => setExitoForm(""), 3000);
    } catch (err: any) {
      setErrorForm(err.response?.data?.message ?? "Error al publicar.");
    } finally {
      setEnviando(false);
    }
  };

  const handleLike = async (id: number) => {
    if (!isAuth) return;
    try {
      await client.patch(`/api/experiencias/${id}/like`);
      setExperiencias((prev) =>
        prev.map((e) => e.id === id ? { ...e, likes: e.likes + 1 } : e)
      );
    } catch {}
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Cabecera */}
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

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">

          {/* ── Formulario ── */}
          <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            <div>
              <h2 className="text-lg font-black text-gray-900">Escribe tu experiencia</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ayuda a otros viajeros con tu opinión</p>
            </div>

            {!isAuth && (
              <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-700 font-semibold">
                <a href="/login" className="underline">Inicia sesión</a> para publicar tu experiencia.
              </div>
            )}

            {errorForm && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{errorForm}</div>
            )}
            {exitoForm && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-semibold">✓ {exitoForm}</div>
            )}

            {/* Destino */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ¿Sobre qué destino escribes?
              </label>
              {cargandoDestinos ? (
                <div className="flex items-center gap-2 py-2.5 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando tus viajes...
                </div>
              ) : isAuth && destinos.length === 0 ? (
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
                  Aún no tenés viajes confirmados.{" "}
                  <a href="/destinos" className="text-orange-500 font-semibold hover:underline">¡Explorá destinos!</a>
                </div>
              ) : (
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  disabled={!isAuth}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white disabled:opacity-60"
                >
                  <option value="" disabled>Selecciona un destino</option>
                  {destinos.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Califica tu experiencia</label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  const activa = val <= (ratingHover || ratingSelected);
                  return (
                    <button key={i} type="button"
                      onMouseEnter={() => setRatingHover(val)}
                      onMouseLeave={() => setRatingHover(0)}
                      onClick={() => setRatingSelected(val)}
                      disabled={!isAuth}
                      className="transition-transform hover:scale-110 disabled:opacity-60"
                    >
                      <Star className={`w-7 h-7 transition-colors ${activa ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs text-gray-400">{ratingSelected > 0 ? `${ratingSelected}/5` : "0/5"}</span>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto del viaje <span className="text-gray-400 font-normal">(opcional)</span>
              </label>

              {imagenPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={imagenPreview} alt="Vista previa" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={quitarImagen}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-gray-400 px-3 py-1.5">{imagenFile?.name}</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-gray-50">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled={!isAuth}
                      onClick={() => inputFileRef.current?.click()}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-3 h-3 inline mr-1" />Seleccionar imagen
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1.5">JPG, PNG o WEBP · máx 5 MB</p>
                  </div>
                </div>
              )}

              <input
                ref={inputFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImagenChange}
              />
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Comparte tu experiencia..."
                rows={5}
                disabled={!isAuth}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none disabled:opacity-60"
              />
              <p className={`text-xs mt-1 text-right ${texto.length >= MAX_CHARS ? "text-red-500" : "text-gray-400"}`}>
                {texto.length}/{MAX_CHARS} caracteres
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublicar}
              disabled={enviando || !isAuth || (isAuth && destinos.length === 0 && !cargandoDestinos)}
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition shadow-md shadow-orange-900/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enviando ? <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</> : "Publicar experiencia"}
            </button>
          </div>

          {/* ── Feed ── */}
          <div className="space-y-6">

            {/* Filtros */}
            <div>
              <h2 className="text-base font-black text-gray-900 mb-3">Filtrar experiencias</h2>
              <div className="flex flex-wrap gap-2">
                {FILTROS.map(({ label, valor }) => (
                  <button key={valor} type="button"
                    onClick={() => setFiltroActivo(valor)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                      filtroActivo === valor
                        ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-900/20"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                    }`}
                  >
                    {valor > 1 && <Star className="w-3 h-3 fill-current inline mr-1 -mt-0.5" />}
                    {label}
                  </button>
                ))}
                {!cargando && (
                  <span className="ml-auto text-xs text-gray-400 self-center">
                    {experiencias.length} {experiencias.length === 1 ? "resultado" : "resultados"}
                  </span>
                )}
              </div>
            </div>

            {/* Skeleton / feed */}
            {cargando ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-44 animate-pulse" />
                ))}
              </div>
            ) : experiencias.length > 0 ? (
              <div className="space-y-4">
                {experiencias.map((exp) => (
                  <ExperienciaCard key={exp.id} exp={exp} onLike={handleLike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-4">
                  <Star className="w-8 h-8 text-orange-300" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Sin experiencias para este filtro</h3>
                <p className="text-sm text-gray-400">Sé el primero en publicar una experiencia</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
