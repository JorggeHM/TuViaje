import { useState, useEffect, useRef } from "react";
import { Star, Upload, ThumbsUp, MapPin, ImageIcon, Loader2, X, Pencil, Trash2, Check } from "lucide-react";
import client from "../../infrastructure/api/client";
import { useAuth } from "../../infrastructure/auth/AuthContext";
import ExperienciasService, { type Experiencia } from "../../infrastructure/services/experiencias.service";

const FILTROS = [
  { label: "Todas",        valor: 1 },
  { label: "5 estrellas",  valor: 5 },
  { label: "4+ estrellas", valor: 4 },
  { label: "3+ estrellas", valor: 3 },
];

function Estrellas({ cantidad, max = 5 }: { cantidad: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < cantidad ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

function ExperienciaCard({
  exp, esPropia, onLike, onEditar, onEliminar,
}: {
  exp:        Experiencia;
  esPropia:   boolean;
  onLike:     (id: number) => void;
  onEditar:   (exp: Experiencia) => void;
  onEliminar: (id: number) => void;
}) {
  const iniciales = exp.usuario_nombre
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const fecha = new Date(exp.fecha).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {iniciales}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm leading-tight">{exp.usuario_nombre}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{exp.destino}
            </p>
          </div>
        </div>

        {esPropia && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditar(exp)}
              title="Editar"
              className="p-1.5 rounded-md text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEliminar(exp.id)}
              title="Eliminar"
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <Estrellas cantidad={exp.rating} />

      <p className="text-sm text-gray-600 leading-relaxed">{exp.texto}</p>

      {exp.imagen && (
        <div className="rounded-lg overflow-hidden h-48 bg-gray-100">
          <img src={exp.imagen} alt={`Imagen de ${exp.destino}`} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">{fecha}</p>
        <button
          onClick={() => onLike(exp.id)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-gray-500 hover:text-orange-600 transition"
        >
          <ThumbsUp className="w-3.5 h-3.5" />{exp.likes}
        </button>
      </div>
    </div>
  );
}

export default function Experiencias() {
  const { isAuthenticated: isAuth, user } = useAuth();

  const [experiencias,     setExperiencias]     = useState<Experiencia[]>([]);
  const [cargando,         setCargando]         = useState(true);
  const [filtroActivo,     setFiltroActivo]     = useState(1);

  const [destinos,         setDestinos]         = useState<string[]>([]);
  const [cargandoDestinos, setCargandoDestinos] = useState(false);

  const [destino,         setDestino]         = useState("");
  const [ratingSelected,  setRatingSelected]  = useState(0);
  const [ratingHover,     setRatingHover]     = useState(0);
  const [texto,           setTexto]           = useState("");
  const [enviando,        setEnviando]        = useState(false);
  const [errorForm,       setErrorForm]       = useState("");
  const [exitoForm,       setExitoForm]       = useState("");

  const [imagenFile,    setImagenFile]    = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [editando,       setEditando]       = useState<Experiencia | null>(null);
  const [editTexto,      setEditTexto]      = useState("");
  const [editRating,     setEditRating]     = useState(0);
  const [editGuardando,  setEditGuardando]  = useState(false);
  const [editError,      setEditError]      = useState("");

  const [confirmElim,    setConfirmElim]    = useState<number | null>(null);
  const [eliminando,     setEliminando]     = useState(false);

  const MAX_CHARS = 500;

  useEffect(() => {
    setCargando(true);
    ExperienciasService.listar(filtroActivo)
      .then(setExperiencias)
      .catch(() => setExperiencias([]))
      .finally(() => setCargando(false));
  }, [filtroActivo]);

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
      await ExperienciasService.like(id);
      setExperiencias((prev) =>
        prev.map((e) => e.id === id ? { ...e, likes: e.likes + 1 } : e)
      );
    } catch {}
  };

  const abrirEdicion = (exp: Experiencia) => {
    setEditando(exp);
    setEditTexto(exp.texto);
    setEditRating(exp.rating);
    setEditError("");
  };

  const cerrarEdicion = () => {
    if (editGuardando) return;
    setEditando(null);
    setEditError("");
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    if (editTexto.trim().length < 10) {
      setEditError("El texto debe tener al menos 10 caracteres.");
      return;
    }
    if (editRating < 1 || editRating > 5) {
      setEditError("Selecciona una calificación entre 1 y 5.");
      return;
    }
    setEditGuardando(true);
    setEditError("");
    try {
      const actualizada = await ExperienciasService.actualizar(editando.id, {
        texto:  editTexto.trim(),
        rating: editRating,
      });
      setExperiencias((prev) => prev.map((e) => e.id === editando.id ? actualizada : e));
      setEditando(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "Error al guardar los cambios.");
    } finally {
      setEditGuardando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (confirmElim === null) return;
    setEliminando(true);
    try {
      await ExperienciasService.eliminar(confirmElim);
      setExperiencias((prev) => prev.filter((e) => e.id !== confirmElim));
      setConfirmElim(null);
    } catch {
      // Mostrar feedback mínimo — se podría poner un toast después
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 items-start">

          {/* Formulario */}
          <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-100 p-6 space-y-5">

            <div>
              <h2 className="text-base font-medium text-gray-900 tracking-tight">Escribe tu experiencia</h2>
              <p className="text-xs text-gray-400 mt-1">Ayuda a otros viajeros con tu opinión</p>
            </div>

            {!isAuth && (
              <div className="rounded-lg border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm text-orange-700">
                <a href="/login" className="underline">Inicia sesión</a> para publicar tu experiencia.
              </div>
            )}

            {errorForm && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{errorForm}</div>
            )}
            {exitoForm && (
              <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">✓ {exitoForm}</div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                ¿Sobre qué destino escribes?
              </label>
              {cargandoDestinos ? (
                <div className="flex items-center gap-2 py-2.5 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando tus viajes...
                </div>
              ) : isAuth && destinos.length === 0 ? (
                <div className="rounded-lg border border-gray-200 px-4 py-3 text-xs text-gray-500">
                  Aún no tenés viajes confirmados.{" "}
                  <a href="/destinos" className="text-orange-500 hover:underline">Explorá destinos</a>
                </div>
              ) : (
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  disabled={!isAuth}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 transition bg-white disabled:opacity-60"
                >
                  <option value="" disabled>Selecciona un destino</option>
                  {destinos.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Califica tu experiencia</label>
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
                      className="transition disabled:opacity-60"
                    >
                      <Star className={`w-6 h-6 transition-colors ${activa ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs text-gray-400">{ratingSelected > 0 ? `${ratingSelected}/5` : "0/5"}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                Foto del viaje <span className="normal-case text-gray-400">(opcional)</span>
              </label>

              {imagenPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={imagenPreview} alt="Vista previa" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={quitarImagen}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-gray-400 px-3 py-1.5">{imagenFile?.name}</p>
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                  <div>
                    <button
                      type="button"
                      disabled={!isAuth}
                      onClick={() => inputFileRef.current?.click()}
                      className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Comparte tu experiencia..."
                rows={5}
                disabled={!isAuth}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 transition resize-none disabled:opacity-60"
              />
              <p className={`text-xs mt-1 text-right ${texto.length >= MAX_CHARS ? "text-red-500" : "text-gray-400"}`}>
                {texto.length}/{MAX_CHARS}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublicar}
              disabled={enviando || !isAuth || (isAuth && destinos.length === 0 && !cargandoDestinos)}
              className="w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enviando ? <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</> : "Publicar experiencia"}
            </button>
          </div>

          {/* Feed */}
          <div className="space-y-6">

            <div>
              <div className="flex flex-wrap gap-2">
                {FILTROS.map(({ label, valor }) => (
                  <button key={valor} type="button"
                    onClick={() => setFiltroActivo(valor)}
                    className={`rounded-full px-4 py-1.5 text-sm border transition ${
                      filtroActivo === valor
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-orange-100 hover:border-orange-300 hover:text-orange-600"
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

            {cargando ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-5 h-44 animate-pulse" />
                ))}
              </div>
            ) : experiencias.length > 0 ? (
              <div className="space-y-4">
                {experiencias.map((exp) => (
                  <ExperienciaCard
                    key={exp.id}
                    exp={exp}
                    esPropia={!!user && exp.usuario_id === user.id}
                    onLike={handleLike}
                    onEditar={abrirEdicion}
                    onEliminar={(id) => setConfirmElim(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-xl border border-gray-100">
                <Star className="w-8 h-8 text-gray-300 mx-auto mb-3" strokeWidth={1.2} />
                <h3 className="font-medium text-gray-800 mb-1">Sin experiencias para este filtro</h3>
                <p className="text-sm text-gray-400">Sé el primero en publicar una experiencia</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de edición */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-gray-900 font-medium text-base tracking-tight">Editar experiencia</h2>
              {!editGuardando && (
                <button onClick={cerrarEdicion} className="text-gray-400 hover:text-gray-600 transition">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Destino</label>
                <p className="text-sm text-gray-700 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  {editando.destino}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">El destino no se puede modificar.</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Calificación</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1;
                    const activa = val <= editRating;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditRating(val)}
                        disabled={editGuardando}
                        className="transition disabled:opacity-50"
                      >
                        <Star className={`w-6 h-6 ${activa ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs text-gray-400">{editRating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Tu opinión</label>
                <textarea
                  value={editTexto}
                  onChange={(e) => setEditTexto(e.target.value.slice(0, MAX_CHARS))}
                  rows={5}
                  disabled={editGuardando}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-orange-400 transition resize-none disabled:opacity-60"
                />
                <p className={`text-xs mt-1 text-right ${editTexto.length >= MAX_CHARS ? "text-red-500" : "text-gray-400"}`}>
                  {editTexto.length}/{MAX_CHARS}
                </p>
              </div>

              {editError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{editError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={cerrarEdicion}
                  disabled={editGuardando}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-medium text-sm hover:border-gray-300 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicion}
                  disabled={editGuardando}
                  className="flex-1 py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {editGuardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editGuardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">¿Eliminar esta experiencia?</h3>
            <p className="text-sm text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmElim(null)}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {eliminando && <Loader2 className="w-4 h-4 animate-spin" />}
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
