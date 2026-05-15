import { useState, useEffect } from "react";
import {
  Plus, Search, Pencil, Trash2, CheckSquare,
  X, ImageIcon, Calendar, DollarSign, Users, MapPin,
  AlertTriangle, Loader2,
  Shield, RefreshCw, BadgeCheck, MessageCircle, Plane, CheckCircle2, Clock, CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import client from "../../infrastructure/api/client";

type EstadoViaje = "Activo" | "Pausado" | "Finalizado";

interface Garantia {
  titulo: string;
  desc:   string;
  icon:   string;
}

interface Viaje {
  id:              number;
  title:           string;
  destination:     string;
  price:           number;
  available_seats: number;
  start_date:      string;
  end_date:        string;
  duracion_dias:   number;
  imagen_url:      string;
  incluidos:       string[]   | null;
  galeria:         string[]   | null;
  garantias:       Garantia[] | null;
  estado:          EstadoViaje;
  total_ventas:    number;
}

/** Catálogo cerrado de íconos disponibles para garantías. */
export const ICONOS_GARANTIA: Record<string, LucideIcon> = {
  Shield, RefreshCw, BadgeCheck, MessageCircle, Plane, CheckCircle2, Clock, Users, CreditCard, MapPin,
};
const ICONOS_KEYS = Object.keys(ICONOS_GARANTIA);

const FORM_VACIO = {
  titulo:    "",
  destino:   "",
  imagen:    "",
  salida:    "",
  fin:       "",
  duracion:  "",
  precio:    "",
  plazas:    "",
  estado:    "Activo" as EstadoViaje,
  incluidos: "",   // texto multilinea (una por línea)
  galeria:   "",   // texto multilinea (una URL por línea)
  garantias: [] as Garantia[],
};

function BadgeEstado({ estado }: { estado: EstadoViaje }) {
  const estilos: Record<EstadoViaje, string> = {
    Activo:     "bg-green-50  text-green-700  border-green-200",
    Pausado:    "bg-amber-50  text-amber-700  border-amber-200",
    Finalizado: "bg-gray-100  text-gray-500   border-gray-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${estilos[estado]}`}>
      {estado}
    </span>
  );
}

function Campo({ label, value, onChange, type = "text", placeholder, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; prefix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition ${prefix ? "pl-7 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function EditorGarantias({
  garantias, onChange,
}: { garantias: Garantia[]; onChange: (g: Garantia[]) => void }) {
  const agregar = () => onChange([...garantias, { titulo: "", desc: "", icon: ICONOS_KEYS[0] }]);
  const quitar  = (i: number) => onChange(garantias.filter((_, idx) => idx !== i));
  const actualizar = (i: number, patch: Partial<Garantia>) =>
    onChange(garantias.map((g, idx) => idx === i ? { ...g, ...patch } : g));

  return (
    <div className="space-y-3">
      {garantias.length === 0 && (
        <p className="text-xs text-gray-400 italic">Sin garantías cargadas. Si dejás esto vacío se mostrará el set genérico.</p>
      )}

      {garantias.map((g, i) => {
        const Icon = ICONOS_GARANTIA[g.icon] ?? Shield;
        return (
          <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2 bg-gray-50/40">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <select
                value={g.icon}
                onChange={(e) => actualizar(i, { icon: e.target.value })}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:border-orange-400"
              >
                {ICONOS_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <input
                type="text"
                value={g.titulo}
                onChange={(e) => actualizar(i, { titulo: e.target.value })}
                placeholder="Título"
                className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-orange-400 bg-white"
              />
              <button
                type="button"
                onClick={() => quitar(i)}
                className="p-1 rounded text-gray-400 hover:text-red-600 transition"
                title="Quitar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={g.desc}
              onChange={(e) => actualizar(i, { desc: e.target.value })}
              placeholder="Descripción corta"
              className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-orange-400 bg-white"
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={agregar}
        className="w-full py-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-600 transition flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Agregar garantía
      </button>
    </div>
  );
}

/** Convierte texto multilinea a array de líneas no vacías. */
const linesToArr = (s: string): string[] =>
  s.split("\n").map((l) => l.trim()).filter(Boolean);

const arrToLines = (arr: string[] | null | undefined): string =>
  Array.isArray(arr) ? arr.join("\n") : "";

export default function AdminViajes() {
  const [viajes,        setViajes]        = useState<Viaje[]>([]);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState<string>("Todos");
  const [modalAbierto,  setModalAbierto]  = useState(false);
  const [modoEditar,    setModoEditar]    = useState(false);
  const [viajeEditando, setViajeEditando] = useState<number | null>(null);
  const [form,          setForm]          = useState({ ...FORM_VACIO });
  const [confirmElim,   setConfirmElim]   = useState<number | null>(null);
  const [cargando,      setCargando]      = useState(true);
  const [guardando,     setGuardando]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const cargarViajes = async () => {
    try {
      const res = await client.get("/api/admin/viajes");
      setViajes(res.data.data ?? []);
    } catch {
      setError("No se pudo cargar la lista de viajes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarViajes(); }, []);

  const viajesFiltrados = viajes.filter((v) => {
    const coincide = v.title.toLowerCase().includes(busqueda.toLowerCase()) ||
                     v.destination.toLowerCase().includes(busqueda.toLowerCase());
    const estado   = filtroEstado === "Todos" || v.estado === filtroEstado;
    return coincide && estado;
  });

  const abrirModalCrear = () => {
    setForm({ ...FORM_VACIO, garantias: [] });
    setModoEditar(false);
    setViajeEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (v: Viaje) => {
    setForm({
      titulo:    v.title,
      destino:   v.destination,
      imagen:    v.imagen_url ?? "",
      salida:    v.start_date,
      fin:       v.end_date,
      duracion:  String(v.duracion_dias),
      precio:    String(v.price),
      plazas:    String(v.available_seats),
      estado:    v.estado,
      incluidos: arrToLines(v.incluidos),
      galeria:   arrToLines(v.galeria),
      garantias: Array.isArray(v.garantias) ? v.garantias : [],
    });
    setModoEditar(true);
    setViajeEditando(v.id);
    setModalAbierto(true);
  };

  const guardarViaje = async () => {
    if (!form.titulo || !form.destino || !form.salida || !form.fin) return;
    setGuardando(true);

    // Normaliza garantías: si una entrada tiene título y descripción vacíos, se descarta.
    const garantiasLimpias = form.garantias.filter((g) => g.titulo.trim() || g.desc.trim());

    const payload = {
      title:           form.titulo,
      destination:     form.destino,
      imagen_url:      form.imagen,
      start_date:      form.salida,
      end_date:        form.fin,
      duracion_dias:   Number(form.duracion),
      price:           Number(form.precio),
      available_seats: Number(form.plazas),
      estado:          form.estado,
      incluidos:       linesToArr(form.incluidos),
      galeria:         linesToArr(form.galeria),
      garantias:       garantiasLimpias,
    };
    try {
      if (modoEditar && viajeEditando !== null) {
        await client.put(`/api/admin/viajes/${viajeEditando}`, payload);
      } else {
        await client.post("/api/admin/viajes", payload);
      }
      await cargarViajes();
      setModalAbierto(false);
    } catch {
      setError("Error al guardar el viaje.");
    } finally {
      setGuardando(false);
    }
  };

  const finalizarViaje = async (id: number) => {
    try {
      await client.patch(`/api/admin/viajes/${id}/finalizar`, { estado: "Finalizado" });
      setViajes((prev) => prev.map((v) => v.id === id ? { ...v, estado: "Finalizado" } : v));
    } catch {
      setError("Error al finalizar el viaje.");
    }
  };

  const eliminarViaje = async (id: number) => {
    try {
      await client.delete(`/api/admin/viajes/${id}`);
      setViajes((prev) => prev.filter((v) => v.id !== id));
      setConfirmElim(null);
    } catch {
      setError("Error al eliminar el viaje.");
    }
  };

  const f = (key: keyof typeof form) => (val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5 max-w-7xl">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar destino..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition"
          />
        </div>
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {["Todos", "Activo", "Pausado", "Finalizado"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filtroEstado === f ? "bg-orange-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 active:scale-95 transition shadow-md shadow-orange-900/20 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Crear viaje
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Viaje</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Salida</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Duración</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Precio</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Cupos</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : viajesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    No se encontraron viajes.
                  </td>
                </tr>
              ) : (
                viajesFiltrados.map((viaje) => {
                  const disponibles = viaje.available_seats;
                  const total       = viaje.available_seats + viaje.total_ventas;
                  return (
                    <tr key={viaje.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {viaje.imagen_url ? (
                              <img src={viaje.imagen_url} alt={viaje.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{viaje.title}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-3 h-3" />{viaje.destination}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" />
                          {viaje.start_date}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">{viaje.duracion_dias} días</td>
                      <td className="px-5 py-4 font-bold text-gray-900">
                        <div className="flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          {Number(viaje.price).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-300" />
                          <span className={`font-semibold ${disponibles <= 3 ? "text-red-500" : "text-gray-700"}`}>
                            {disponibles}
                          </span>
                          <span className="text-gray-300">/</span>
                          <span className="text-gray-400">{total}</span>
                          {disponibles <= 3 && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />}
                        </div>
                      </td>
                      <td className="px-5 py-4"><BadgeEstado estado={viaje.estado} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => abrirModalEditar(viaje)} title="Editar"
                            className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {viaje.estado !== "Finalizado" && (
                            <button onClick={() => finalizarViaje(viaje.id)} title="Finalizar"
                              className="p-2 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition">
                              <CheckSquare className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setConfirmElim(viaje.id)} title="Eliminar"
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {viajesFiltrados.length} viaje{viajesFiltrados.length !== 1 ? "s" : ""} encontrado{viajesFiltrados.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-900">
                  {modoEditar ? "Editar viaje" : "Crear nuevo viaje"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modoEditar ? "Modifica los datos del viaje" : "Completa los datos del nuevo destino"}
                </p>
              </div>
              <button onClick={() => setModalAbierto(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Nombre del viaje *" value={form.titulo}  onChange={f("titulo")}  placeholder="Ej. Aventura en Cancún" />
                <Campo label="Destino *"           value={form.destino} onChange={f("destino")} placeholder="Ej. Cancún, México" />
              </div>
              <Campo label="URL de imagen principal" value={form.imagen} onChange={f("imagen")} placeholder="https://..." />
              {form.imagen && (
                <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                  <img src={form.imagen} alt="Preview" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Fecha de salida *" value={form.salida} onChange={f("salida")} type="date" />
                <Campo label="Fecha de fin *"    value={form.fin}    onChange={f("fin")}    type="date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Duración (días)"     value={form.duracion} onChange={f("duracion")} type="number" placeholder="7" />
                <Campo label="Precio por persona"  value={form.precio}   onChange={f("precio")}   type="number" placeholder="2500" prefix="$" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Plazas totales" value={form.plazas} onChange={f("plazas")} type="number" placeholder="20" />
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value as EstadoViaje }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              {/* ─── Contenido editable (incluidos / galería / garantías) ─── */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-3">Contenido de la ficha</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Qué incluye este viaje <span className="font-normal text-gray-400">(una línea por ítem)</span>
                    </label>
                    <textarea
                      value={form.incluidos}
                      onChange={(e) => setForm((prev) => ({ ...prev, incluidos: e.target.value }))}
                      placeholder={"Vuelo de ida y vuelta\nHotel con desayuno\nTraslados aeropuerto-hotel"}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none font-mono"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Si dejás esto vacío se mostrará el set genérico.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Galería de imágenes <span className="font-normal text-gray-400">(una URL por línea)</span>
                    </label>
                    <textarea
                      value={form.galeria}
                      onChange={(e) => setForm((prev) => ({ ...prev, galeria: e.target.value }))}
                      placeholder={"https://...\nhttps://..."}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none font-mono"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">La imagen principal ya se muestra primero. Acá agregás miniaturas extras.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Garantías destacadas</label>
                    <EditorGarantias
                      garantias={form.garantias}
                      onChange={(g) => setForm((prev) => ({ ...prev, garantias: g }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalAbierto(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={guardarViaje} disabled={guardando}
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 active:scale-95 transition shadow-md shadow-orange-900/20 flex items-center gap-2 disabled:opacity-70">
                {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                {modoEditar ? "Guardar cambios" : "Crear viaje"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">¿Eliminar este viaje?</h3>
            <p className="text-sm text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmElim(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => eliminarViaje(confirmElim)}
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
