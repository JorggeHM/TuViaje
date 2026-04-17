/**
 * AdminResumen.tsx — Vista de resumen general del panel de administración
 * Ruta: /admin (índice del AdminLayout)
 *
 * Muestra métricas clave, últimas ventas y accesos rápidos a las secciones.
 * Todos los datos son estáticos — pendiente conectar a la API.
 *
 * Pendiente:
 *   - GET /admin/stats → tarjetas de métricas
 *   - GET /admin/ventas/recientes → tabla de ventas recientes
 */

import { useNavigate } from "react-router";
import {
  Plane,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// ── Datos estáticos de métricas ───────────────────────────────────────────────
const METRICAS = [
  {
    titulo:  "Viajes activos",
    valor:   "12",
    cambio:  "+2 este mes",
    subida:  true,
    icono:   Plane,
    color:   "bg-blue-50 text-blue-600",
  },
  {
    titulo:  "Usuarios registrados",
    valor:   "284",
    cambio:  "+18 esta semana",
    subida:  true,
    icono:   Users,
    color:   "bg-purple-50 text-purple-600",
  },
  {
    titulo:  "Ventas este mes",
    valor:   "47",
    cambio:  "-3 vs mes anterior",
    subida:  false,
    icono:   ShoppingBag,
    color:   "bg-orange-50 text-orange-600",
  },
  {
    titulo:  "Ingresos del mes",
    valor:   "$124,300",
    cambio:  "+12% vs mes anterior",
    subida:  true,
    icono:   DollarSign,
    color:   "bg-green-50 text-green-600",
  },
];

// ── Últimas ventas (datos estáticos) ─────────────────────────────────────────
const VENTAS_RECIENTES = [
  { id: "#0047", usuario: "Ana García",     destino: "Cancún, México",          monto: "$2,450", estado: "Confirmada", fecha: "Hoy, 10:23" },
  { id: "#0046", usuario: "Carlos Méndez",  destino: "Medellín, Colombia",      monto: "$1,890", estado: "Confirmada", fecha: "Hoy, 09:05" },
  { id: "#0045", usuario: "Sofía Torres",   destino: "Buenos Aires, Argentina", monto: "$3,100", estado: "Pendiente",  fecha: "Ayer, 18:40" },
  { id: "#0044", usuario: "Luis Herrera",   destino: "La Habana, Cuba",         monto: "$2,200", estado: "Confirmada", fecha: "Ayer, 14:15" },
  { id: "#0043", usuario: "María López",    destino: "Cusco, Perú",             monto: "$2,750", estado: "Cancelada",  fecha: "Ayer, 11:00" },
];

// ── Viajes con plazas bajas (alerta) ─────────────────────────────────────────
const VIAJES_ALERTA = [
  { destino: "Tulum, México",          plazas: 3,  total: 20 },
  { destino: "Cartagena, Colombia",    plazas: 2,  total: 15 },
  { destino: "La Habana, Cuba",        plazas: 5,  total: 18 },
];

// ── Helpers de estado ─────────────────────────────────────────────────────────
function BadgeEstado({ estado }: { estado: string }) {
  const estilos: Record<string, string> = {
    Confirmada: "bg-green-50 text-green-700 border-green-200",
    Pendiente:  "bg-amber-50  text-amber-700  border-amber-200",
    Cancelada:  "bg-red-50    text-red-700    border-red-200",
  };
  const iconos: Record<string, JSX.Element> = {
    Confirmada: <CheckCircle className="w-3 h-3" />,
    Pendiente:  <Clock       className="w-3 h-3" />,
    Cancelada:  <XCircle     className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${estilos[estado] ?? ""}`}>
      {iconos[estado]}
      {estado}
    </span>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminResumen() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Tarjetas de métricas ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICAS.map(({ titulo, valor, cambio, subida, icono: Icono, color }) => (
          <div key={titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icono className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-semibold truncate">{titulo}</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{valor}</p>
              <p className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${subida ? "text-green-600" : "text-red-500"}`}>
                {subida ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {cambio}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Fila: ventas recientes + alertas de plazas ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Tabla de últimas ventas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Ventas recientes</h2>
            <button
              onClick={() => navigate("/admin/ventas")}
              className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Destino</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Monto</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {VENTAS_RECIENTES.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{v.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{v.usuario}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{v.destino}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{v.monto}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><BadgeEstado estado={v.estado} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{v.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de alertas: plazas bajas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Plazas limitadas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Viajes con pocas plazas disponibles</p>
          </div>
          <div className="p-4 space-y-3">
            {VIAJES_ALERTA.map(({ destino, plazas, total }) => {
              const pct = Math.round((plazas / total) * 100);
              return (
                <div key={destino} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700 truncate pr-2">{destino}</p>
                    <span className="text-xs font-bold text-orange-600 flex-shrink-0">{plazas}/{total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">{pct}% disponible</p>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => navigate("/admin/viajes")}
              className="w-full py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition flex items-center justify-center gap-1.5"
            >
              Gestionar viajes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ── Accesos rápidos ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Crear nuevo viaje", desc: "Agrega un destino al catálogo", ruta: "/admin/viajes",    color: "border-orange-200 bg-orange-50 hover:bg-orange-100" },
          { label: "Ver usuarios",      desc: "Gestiona los viajeros",         ruta: "/admin/usuarios",  color: "border-purple-200 bg-purple-50 hover:bg-purple-100" },
          { label: "Reporte de ventas", desc: "Revisa el rendimiento",         ruta: "/admin/ventas",    color: "border-green-200  bg-green-50  hover:bg-green-100"  },
        ].map(({ label, desc, ruta, color }) => (
          <button
            key={ruta}
            onClick={() => navigate(ruta)}
            className={`rounded-2xl border p-5 text-left transition flex items-center justify-between ${color}`}
          >
            <div>
              <p className="text-sm font-bold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        ))}
      </div>

    </div>
  );
}
