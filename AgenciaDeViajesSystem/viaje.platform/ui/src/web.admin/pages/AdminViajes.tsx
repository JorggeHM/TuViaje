/**
 * AdminViajes.tsx — Gestión de viajes del panel de administración
 * Ruta: /admin/viajes
 *
 * Permite al administrador:
 *   - Ver la lista de todos los viajes
 *   - Crear un nuevo viaje (modal con formulario)
 *   - Editar un viaje existente (mismo modal pre-cargado)
 *   - Finalizar un viaje (cambia su estado)
 *   - Eliminar un viaje
 *
 * Todo es UI únicamente — sin conexión al backend aún.
 *
 * Pendiente:
 *   - POST /admin/viajes        → crear viaje
 *   - PUT  /admin/viajes/:id    → editar viaje
 *   - PATCH /admin/viajes/:id/finalizar → finalizar
 *   - DELETE /admin/viajes/:id  → eliminar
 */

import { useState } from "react";
import {
  Plus, Search, Pencil, Trash2, CheckSquare,
  X, ImageIcon, Calendar, DollarSign, Users, MapPin,
  AlertTriangle,
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type EstadoViaje = "Activo" | "Pausado" | "Finalizado";

interface Viaje {
  id:        number;
  destino:   string;
  pais:      string;
  imagen:    string;
  salida:    string;  // "DD MMM YYYY"
  duracion:  number;  // días
  precio:    number;
  plazas:    number;
  vendidas:  number;
  estado:    EstadoViaje;
}

// ── Datos estáticos de ejemplo ────────────────────────────────────────────────
const VIAJES_INICIALES: Viaje[] = [
  { id: 1, destino: "Cancún",        pais: "México",    imagen: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=400&q=80", salida: "15 Feb 2025", duracion: 7,  precio: 2450, plazas: 20, vendidas: 14, estado: "Activo"     },
  { id: 2, destino: "Medellín",      pais: "Colombia",  imagen: "https://images.unsplash.com/photo-1597598425329-71b5d8b79754?auto=format&fit=crop&w=400&q=80", salida: "03 Mar 2025", duracion: 5,  precio: 1890, plazas: 15, vendidas: 13, estado: "Activo"     },
  { id: 3, destino: "La Habana",     pais: "Cuba",      imagen: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=400&q=80", salida: "20 Mar 2025", duracion: 6,  precio: 2200, plazas: 18, vendidas:  8, estado: "Activo"     },
  { id: 4, destino: "Buenos Aires",  pais: "Argentina", imagen: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=400&q=80", salida: "10 Abr 2025", duracion: 8,  precio: 3100, plazas: 20, vendidas:  6, estado: "Pausado"    },
  { id: 5, destino: "Tulum",         pais: "México",    imagen: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=400&q=80", salida: "01 Dic 2024", duracion: 5,  precio: 2600, plazas: 12, vendidas: 12, estado: "Finalizado" },
  { id: 6, destino: "Cusco",         pais: "Perú",      imagen: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=400&q=80", salida: "25 Abr 2025", duracion: 10, precio: 2750, plazas: 16, vendidas:  4, estado: "Activo"     },
];

// ── Formulario vacío por defecto ──────────────────────────────────────────────
const FORM_VACIO = {
  destino:   "",
  pais:      "",
  imagen:    "",
  salida:    "",
  duracion:  "",
  precio:    "",
  plazas:    "",
  estado:    "Activo" as EstadoViaje,
};

// ── Badge de estado ───────────────────────────────────────────────────────────
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

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminViajes() {
  const [viajes,        setViajes]        = useState<Viaje[]>(VIAJES_INICIALES);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState<string>("Todos");
  const [modalAbierto,  setModalAbierto]  = useState(false);
  const [modoEditar,    setModoEditar]    = useState(false);
  const [viajeEditando, setViajeEditando] = useState<number | null>(null);
  const [form,          setForm]          = useState({ ...FORM_VACIO });
  const [confirmElim,   setConfirmElim]   = useState<number | null>(null);

  // ── Filtrado de la tabla ──────────────────────────────────────────────────
  const viajesFiltrados = viajes.filter((v) => {
    const coincideBusqueda = v.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
                             v.pais.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado   = filtroEstado === "Todos" || v.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  // ── Abrir modal para CREAR ────────────────────────────────────────────────
  const abrirModalCrear = () => {
    setForm({ ...FORM_VACIO });
    setModoEditar(false);
    setViajeEditando(null);
    setModalAbierto(true);
  };

  // ── Abrir modal para EDITAR ───────────────────────────────────────────────
  const abrirModalEditar = (viaje: Viaje) => {
    setForm({
      destino:  viaje.destino,
      pais:     viaje.pais,
      imagen:   viaje.imagen,
      salida:   viaje.salida,
      duracion: String(viaje.duracion),
      precio:   String(viaje.precio),
      plazas:   String(viaje.plazas),
      estado:   viaje.estado,
    });
    setModoEditar(true);
    setViajeEditando(viaje.id);
    setModalAbierto(true);
  };

  // ── Guardar (crear o editar) ──────────────────────────────────────────────
  const guardarViaje = () => {
    if (!form.destino || !form.pais || !form.salida) return; // validación mínima UI
    if (modoEditar && viajeEditando !== null) {
      setViajes((prev) =>
        prev.map((v) =>
          v.id === viajeEditando
            ? { ...v, ...form, duracion: Number(form.duracion), precio: Number(form.precio), plazas: Number(form.plazas) }
            : v
        )
      );
    } else {
      const nuevo: Viaje = {
        id:       Date.now(),
        destino:  form.destino,
        pais:     form.pais,
        imagen:   form.imagen,
        salida:   form.salida,
        duracion: Number(form.duracion),
        precio:   Number(form.precio),
        plazas:   Number(form.plazas),
        vendidas: 0,
        estado:   form.estado,
      };
      setViajes((prev) => [nuevo, ...prev]);
    }
    setModalAbierto(false);
  };

  // ── Finalizar viaje ───────────────────────────────────────────────────────
  const finalizarViaje = (id: number) => {
    setViajes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, estado: "Finalizado" } : v))
    );
  };

  // ── Eliminar viaje ────────────────────────────────────────────────────────
  const eliminarViaje = (id: number) => {
    setViajes((prev) => prev.filter((v) => v.id !== id));
    setConfirmElim(null);
  };

  // ── Campo de formulario reutilizable ─────────────────────────────────────
  const Campo = ({
    label, name, type = "text", placeholder, prefix,
  }: {
    label: string; name: keyof typeof form; type?: string; placeholder?: string; prefix?: string;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">{prefix}</span>
        )}
        <input
          type={type}
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition ${prefix ? "pl-7 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── Barra de acciones ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar destino o país..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition"
          />
        </div>

        {/* Filtros de estado */}
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {["Todos", "Activo", "Pausado", "Finalizado"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filtroEstado === f
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Botón crear */}
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 active:scale-95 transition shadow-md shadow-orange-900/20 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Crear viaje
        </button>
      </div>

      {/* ── Tabla de viajes ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Destino</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Salida</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Duración</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Precio</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Plazas</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {viajesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    No se encontraron viajes con ese filtro.
                  </td>
                </tr>
              ) : (
                viajesFiltrados.map((viaje) => (
                  <tr key={viaje.id} className="hover:bg-gray-50 transition">
                    {/* Destino con imagen */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {viaje.imagen ? (
                            <img src={viaje.imagen} alt={viaje.destino} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{viaje.destino}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {viaje.pais}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Fecha salida */}
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                        {viaje.salida}
                      </div>
                    </td>
                    {/* Duración */}
                    <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                      {viaje.duracion} días
                    </td>
                    {/* Precio */}
                    <td className="px-5 py-4 font-bold text-gray-900">
                      <div className="flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        {viaje.precio.toLocaleString()}
                      </div>
                    </td>
                    {/* Plazas */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-300" />
                        <span className={`font-semibold ${(viaje.plazas - viaje.vendidas) <= 3 ? "text-red-500" : "text-gray-700"}`}>
                          {viaje.plazas - viaje.vendidas}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-400">{viaje.plazas}</span>
                        {(viaje.plazas - viaje.vendidas) <= 3 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                        )}
                      </div>
                    </td>
                    {/* Estado */}
                    <td className="px-5 py-4">
                      <BadgeEstado estado={viaje.estado} />
                    </td>
                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <button
                          onClick={() => abrirModalEditar(viaje)}
                          title="Editar"
                          className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Finalizar (solo si está Activo o Pausado) */}
                        {viaje.estado !== "Finalizado" && (
                          <button
                            onClick={() => finalizarViaje(viaje.id)}
                            title="Finalizar viaje"
                            className="p-2 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}
                        {/* Eliminar */}
                        <button
                          onClick={() => setConfirmElim(viaje.id)}
                          title="Eliminar"
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
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
        {/* Footer de la tabla */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {viajesFiltrados.length} viaje{viajesFiltrados.length !== 1 ? "s" : ""} encontrado{viajesFiltrados.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MODAL — Crear / Editar viaje
      ════════════════════════════════════════════════════════ */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

            {/* Encabezado del modal */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-900">
                  {modoEditar ? "Editar viaje" : "Crear nuevo viaje"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modoEditar ? "Modifica los datos del viaje" : "Completa los datos del nuevo destino"}
                </p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del formulario (scrollable) */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Destino *"   name="destino"  placeholder="Ej. Cancún" />
                <Campo label="País *"      name="pais"     placeholder="Ej. México"  />
              </div>

              <Campo label="URL de imagen (opcional)" name="imagen" placeholder="https://..." />

              {/* Preview de imagen */}
              {form.imagen && (
                <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={form.imagen}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Fecha de salida *"  name="salida"   placeholder="DD MMM YYYY" />
                <Campo label="Duración (días)"     name="duracion" type="number" placeholder="7" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Precio por persona" name="precio" type="number" placeholder="2500" prefix="$" />
                <Campo label="Plazas totales"     name="plazas" type="number" placeholder="20" />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoViaje }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
                >
                  <option value="Activo">Activo</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarViaje}
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 active:scale-95 transition shadow-md shadow-orange-900/20"
              >
                {modoEditar ? "Guardar cambios" : "Crear viaje"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL — Confirmar eliminación
      ════════════════════════════════════════════════════════ */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">¿Eliminar este viaje?</h3>
            <p className="text-sm text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmElim(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarViaje(confirmElim)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
