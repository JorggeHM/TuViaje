import { useState, useEffect, useMemo } from "react";
import {
  Search, Plane, Trash2, X, Users, Calendar, MapPin, Receipt,
} from "lucide-react";
import client from "../../infrastructure/api/client";

type Estado = "Pendiente" | "Confirmada" | "Cancelada";

interface Reserva {
  id:              number;
  usuario_id:      number;
  usuario_nombre:  string;
  usuario_email:   string;
  viaje_id:        number;
  viaje_titulo:    string;
  viaje_destino:   string;
  start_date:      string;
  imagen_url:      string | null;
  fecha_reserva:   string;
  estado:          Estado;
  monto:           number;
  personas:        number;
}

const ESTADOS: Estado[] = ["Pendiente", "Confirmada", "Cancelada"];

const ESTADO_COLORES: Record<Estado, string> = {
  Pendiente:  "bg-amber-50 text-amber-700 border-amber-200",
  Confirmada: "bg-green-50 text-green-700 border-green-200",
  Cancelada:  "bg-red-50   text-red-700   border-red-200",
};

function iniciales(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminReservas() {
  const [reservas,     setReservas]     = useState<Reserva[]>([]);
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"Todas" | Estado>("Todas");
  const [confirmElim,  setConfirmElim]  = useState<number | null>(null);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    client.get("/api/admin/reservas")
      .then((res) => setReservas(res.data.data ?? []))
      .catch(() => setError("No se pudo cargar la lista de reservas."))
      .finally(() => setCargando(false));
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return reservas.filter((r) => {
      const match = r.usuario_nombre.toLowerCase().includes(q) ||
                    r.usuario_email.toLowerCase().includes(q) ||
                    r.viaje_titulo.toLowerCase().includes(q) ||
                    r.viaje_destino.toLowerCase().includes(q);
      const estadoOk = filtroEstado === "Todas" || r.estado === filtroEstado;
      return match && estadoOk;
    });
  }, [reservas, busqueda, filtroEstado]);

  const cambiarEstado = async (id: number, estado: Estado) => {
    const previo = reservas.find((r) => r.id === id);
    if (!previo || previo.estado === estado) return;

    setReservas((prev) => prev.map((r) => r.id === id ? { ...r, estado } : r));
    try {
      await client.patch(`/api/admin/reservas/${id}/estado`, { estado });
    } catch (err: any) {
      // Rollback
      setReservas((prev) => prev.map((r) => r.id === id ? previo : r));
      setError(err?.response?.data?.message ?? "Error al cambiar el estado.");
    }
  };

  const eliminar = async (id: number) => {
    try {
      await client.delete(`/api/admin/reservas/${id}`);
      setReservas((prev) => prev.filter((r) => r.id !== id));
      setConfirmElim(null);
    } catch {
      setError("Error al eliminar la reserva.");
    }
  };

  const total       = reservas.length;
  const confirmadas = reservas.filter((r) => r.estado === "Confirmada");
  const pendientes  = reservas.filter((r) => r.estado === "Pendiente").length;
  const canceladas  = reservas.filter((r) => r.estado === "Cancelada").length;
  const ingresos    = confirmadas.reduce((s, r) => s + Number(r.monto), 0);
  const personas    = confirmadas.reduce((s, r) => s + Number(r.personas), 0);

  return (
    <div className="space-y-5 max-w-7xl">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Mini métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total reservas", valor: total,                                            color: "bg-purple-50 text-purple-600", Icon: Receipt },
          { label: "Confirmadas",    valor: confirmadas.length,                               color: "bg-green-50  text-green-600",  Icon: Plane },
          { label: "Pendientes",     valor: pendientes,                                       color: "bg-amber-50  text-amber-600",  Icon: Calendar },
          { label: "Canceladas",     valor: canceladas,                                       color: "bg-red-50    text-red-600",    Icon: X },
          { label: "Ingresos MXN",   valor: `$${ingresos.toLocaleString()}`,                  color: "bg-orange-50 text-orange-600", Icon: Users, sub: `${personas} personas` },
        ].map(({ label, valor, color, Icon, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-gray-900 truncate">{valor}</p>
              <p className="text-[10px] text-gray-400 font-semibold truncate">{label}{sub ? ` · ${sub}` : ""}</p>
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
            placeholder="Buscar por usuario, email, viaje o destino..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition"
          />
        </div>
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {(["Todas", ...ESTADOS] as const).map((f) => (
            <button key={f} onClick={() => setFiltroEstado(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filtroEstado === f ? "bg-orange-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f}
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
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Viaje</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Reserva</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Personas</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Monto</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : filtradas.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                  No se encontraron reservas.
                </td></tr>
              ) : (
                filtradas.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {iniciales(r.usuario_nombre)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{r.usuario_nombre}</p>
                          <p className="text-xs text-gray-400 truncate">{r.usuario_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {r.imagen_url ? (
                          <img src={r.imagen_url} alt={r.viaje_titulo} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <Plane className="w-4 h-4 text-orange-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{r.viaje_titulo}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" />{r.viaje_destino}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-xs text-gray-700">{new Date(r.fecha_reserva).toLocaleDateString("es-AR")}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Salida: {r.start_date}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                        <Users className="w-3.5 h-3.5 text-gray-300" />
                        {r.personas}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black text-gray-800">
                      ${Number(r.monto).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={r.estado}
                        onChange={(e) => cambiarEstado(r.id, e.target.value as Estado)}
                        className={`text-xs font-semibold border rounded-full px-2.5 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-100 ${ESTADO_COLORES[r.estado]}`}
                      >
                        {ESTADOS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setConfirmElim(r.id)} title="Eliminar"
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
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {filtradas.length} reserva{filtradas.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Modal confirmar eliminación */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">¿Eliminar esta reserva?</h3>
            <p className="text-sm text-gray-400 mb-6">
              Si la reserva no estaba cancelada, los cupos se restaurarán automáticamente.
              Esta acción es irreversible.
            </p>
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
