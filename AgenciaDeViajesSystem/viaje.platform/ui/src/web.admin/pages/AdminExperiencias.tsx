import { useState, useEffect } from "react";
import {
  Search, Star, MessageSquare, Eye, EyeOff, Trash2, X, Heart,
} from "lucide-react";
import client from "../../infrastructure/api/client";

interface Experiencia {
  id:              number;
  usuario_id:      number;
  usuario_nombre:  string;
  usuario_email:   string;
  destino:         string;
  rating:          number;
  texto:           string;
  fecha:           string;
  likes:           number;
  imagen:          string | null;
  visible:         number;
}

const RATINGS = [0, 5, 4, 3, 2, 1] as const;

function iniciales(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminExperiencias() {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroVis,    setFiltroVis]    = useState<"Todas" | "Visibles" | "Ocultas">("Todas");
  const [filtroRating, setFiltroRating] = useState<number>(0);
  const [confirmElim,  setConfirmElim]  = useState<number | null>(null);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    client.get("/api/admin/experiencias")
      .then((res) => setExperiencias(res.data.data ?? []))
      .catch(() => setError("No se pudo cargar la lista de experiencias."))
      .finally(() => setCargando(false));
  }, []);

  const filtradas = experiencias.filter((e) => {
    const q = busqueda.toLowerCase();
    const match = e.destino.toLowerCase().includes(q) ||
                  e.texto.toLowerCase().includes(q) ||
                  e.usuario_nombre.toLowerCase().includes(q);
    const visOk = filtroVis === "Todas" ||
                  (filtroVis === "Visibles" && e.visible === 1) ||
                  (filtroVis === "Ocultas"  && e.visible === 0);
    const ratingOk = filtroRating === 0 || e.rating === filtroRating;
    return match && visOk && ratingOk;
  });

  const toggleVisible = async (id: number) => {
    try {
      const res = await client.patch(`/api/admin/experiencias/${id}/visible`);
      const nuevoVisible = (res.data.data?.visible ?? 1) as number;
      setExperiencias((prev) => prev.map((e) => e.id === id ? { ...e, visible: nuevoVisible } : e));
    } catch {
      setError("Error al cambiar la visibilidad.");
    }
  };

  const eliminar = async (id: number) => {
    try {
      await client.delete(`/api/admin/experiencias/${id}`);
      setExperiencias((prev) => prev.filter((e) => e.id !== id));
      setConfirmElim(null);
    } catch {
      setError("Error al eliminar la experiencia.");
    }
  };

  const totalVisibles = experiencias.filter((e) => e.visible === 1).length;
  const totalOcultas  = experiencias.filter((e) => e.visible === 0).length;
  const totalLikes    = experiencias.reduce((s, e) => s + (e.likes ?? 0), 0);
  const promedioRating = experiencias.length
    ? (experiencias.reduce((s, e) => s + Number(e.rating), 0) / experiencias.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-5 max-w-7xl">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Mini métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total publicadas", valor: experiencias.length, color: "bg-purple-50 text-purple-600", Icon: MessageSquare },
          { label: "Visibles",         valor: totalVisibles,        color: "bg-green-50  text-green-600",  Icon: Eye },
          { label: "Ocultas",          valor: totalOcultas,         color: "bg-gray-100  text-gray-500",   Icon: EyeOff },
          { label: "Likes totales",    valor: totalLikes,           color: "bg-orange-50 text-orange-600", Icon: Heart },
        ].map(({ label, valor, color, Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{valor}</p>
              <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por destino, texto o usuario..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition"
          />
        </div>

        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {(["Todas", "Visibles", "Ocultas"] as const).map((f) => (
            <button key={f} onClick={() => setFiltroVis(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filtroVis === f ? "bg-orange-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {RATINGS.map((r) => (
            <button key={r} onClick={() => setFiltroRating(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filtroRating === r ? "bg-orange-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {r === 0 ? "Todas" : <>{r}<Star className="w-3 h-3 fill-current" /></>}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Experiencia</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Autor</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Likes</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : filtradas.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                  No se encontraron experiencias.
                </td></tr>
              ) : (
                filtradas.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {e.imagen ? (
                          <img src={e.imagen} alt={e.destino} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">{e.destino}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-md">{e.texto}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(e.fecha).toLocaleDateString("es-AR")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                          {iniciales(e.usuario_nombre)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{e.usuario_nombre}</p>
                          <p className="text-[10px] text-gray-400 truncate">{e.usuario_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${
                            s <= Number(e.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                          }`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Heart className="w-3.5 h-3.5 text-red-300" />
                        {e.likes ?? 0}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        e.visible === 1
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {e.visible === 1 ? <><Eye className="w-3 h-3" />Visible</> : <><EyeOff className="w-3 h-3" />Oculta</>}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleVisible(e.id)}
                          title={e.visible === 1 ? "Ocultar" : "Mostrar"}
                          className={`p-2 rounded-lg transition ${
                            e.visible === 1
                              ? "text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-gray-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {e.visible === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setConfirmElim(e.id)} title="Eliminar"
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
          <span>{filtradas.length} experiencia{filtradas.length !== 1 ? "s" : ""}</span>
          <span>Promedio rating: <strong className="text-gray-600">{promedioRating}</strong></span>
        </div>
      </div>

      {/* Modal confirmar eliminación */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">¿Eliminar esta experiencia?</h3>
            <p className="text-sm text-gray-400 mb-6">Si solo querés que no aparezca en el feed, podés ocultarla en su lugar.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmElim(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmElim)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
