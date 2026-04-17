/**
 * AdminVentas.tsx — Reporte de ventas del panel de administración
 * Ruta: /admin/ventas
 *
 * Muestra métricas de ingresos, un gráfico de barras mensual (visual, sin librería),
 * y la tabla completa de ventas con filtros por estado.
 * Solo UI — sin conexión al backend aún.
 *
 * Pendiente:
 *   - GET /admin/ventas           → historial de ventas
 *   - GET /admin/ventas/stats     → métricas de ingresos
 *   - PATCH /admin/ventas/:id/estado → cambiar estado
 */

import { useState } from "react";
import {
  DollarSign, TrendingUp, ShoppingBag,
  Clock, CheckCircle, XCircle, Search,
} from "lucide-react";

// ── Datos estáticos: ventas del mes por semana (para el gráfico) ──────────────
const GRAFICO_SEMANAL = [
  { semana: "Sem 1",  monto: 18400, ventas: 7  },
  { semana: "Sem 2",  monto: 32500, ventas: 12 },
  { semana: "Sem 3",  monto: 27800, ventas: 10 },
  { semana: "Sem 4",  monto: 45600, ventas: 18 },
];

// ── Datos estáticos: historial de ventas ─────────────────────────────────────
const VENTAS_LISTA = [
  { id: "#0047", usuario: "Ana García",      destino: "Cancún, México",          personas: 2, monto: 4900,  estado: "Confirmada", fecha: "Hoy, 10:23"       },
  { id: "#0046", usuario: "Carlos Méndez",   destino: "Medellín, Colombia",      personas: 1, monto: 1890,  estado: "Confirmada", fecha: "Hoy, 09:05"       },
  { id: "#0045", usuario: "Sofía Torres",    destino: "Buenos Aires, Argentina", personas: 1, monto: 3100,  estado: "Pendiente",  fecha: "Ayer, 18:40"      },
  { id: "#0044", usuario: "Luis Herrera",    destino: "La Habana, Cuba",         personas: 1, monto: 2200,  estado: "Confirmada", fecha: "Ayer, 14:15"      },
  { id: "#0043", usuario: "María López",     destino: "Cusco, Perú",             personas: 2, monto: 5500,  estado: "Cancelada",  fecha: "Ayer, 11:00"      },
  { id: "#0042", usuario: "Diego Ramírez",   destino: "Cancún, México",          personas: 3, monto: 7350,  estado: "Confirmada", fecha: "15 Abr, 16:30"    },
  { id: "#0041", usuario: "Valentina Cruz",  destino: "Medellín, Colombia",      personas: 1, monto: 1890,  estado: "Confirmada", fecha: "14 Abr, 09:00"    },
  { id: "#0040", usuario: "Andrés Morales",  destino: "Tulum, México",           personas: 2, monto: 5200,  estado: "Pendiente",  fecha: "13 Abr, 20:15"    },
  { id: "#0039", usuario: "Isabella Vega",   destino: "Buenos Aires, Argentina", personas: 4, monto: 12400, estado: "Confirmada", fecha: "12 Abr, 14:45"    },
  { id: "#0038", usuario: "Roberto Castro",  destino: "La Habana, Cuba",         personas: 1, monto: 2200,  estado: "Cancelada",  fecha: "11 Abr, 11:30"    },
];

// ── Helper badge de estado ────────────────────────────────────────────────────
function BadgeEstado({ estado }: { estado: string }) {
  const estilos: Record<string, string> = {
    Confirmada: "bg-green-50 text-green-700 border-green-200",
    Pendiente:  "bg-amber-50 text-amber-700 border-amber-200",
    Cancelada:  "bg-red-50   text-red-700   border-red-200",
  };
  const iconos: Record<string, JSX.Element> = {
    Confirmada: <CheckCircle className="w-3 h-3" />,
    Pendiente:  <Clock       className="w-3 h-3" />,
    Cancelada:  <XCircle     className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${estilos[estado] ?? ""}`}>
      {iconos[estado]}
      {estado}
    </span>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminVentas() {
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // ── Métricas calculadas ───────────────────────────────────────────────────
  const totalIngresos    = VENTAS_LISTA.filter((v) => v.estado === "Confirmada").reduce((s, v) => s + v.monto, 0);
  const totalConfirmadas = VENTAS_LISTA.filter((v) => v.estado === "Confirmada").length;
  const totalPendientes  = VENTAS_LISTA.filter((v) => v.estado === "Pendiente").length;
  const totalCanceladas  = VENTAS_LISTA.filter((v) => v.estado === "Cancelada").length;

  // ── Filtrado de la tabla ──────────────────────────────────────────────────
  const ventasFiltradas = VENTAS_LISTA.filter((v) => {
    const match  = v.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
                   v.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
                   v.id.includes(busqueda);
    const estado = filtroEstado === "Todos" || v.estado === filtroEstado;
    return match && estado;
  });

  // ── Máximo del gráfico para calcular porcentajes ──────────────────────────
  const maxMonto = Math.max(...GRAFICO_SEMANAL.map((s) => s.monto));

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── Tarjetas de métricas ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Ingresos confirmados",
            valor: `$${totalIngresos.toLocaleString()}`,
            icono: DollarSign,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Ventas confirmadas",
            valor: String(totalConfirmadas),
            icono: TrendingUp,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Pendientes",
            valor: String(totalPendientes),
            icono: Clock,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Canceladas",
            valor: String(totalCanceladas),
            icono: XCircle,
            color: "bg-red-50 text-red-500",
          },
        ].map(({ label, valor, icono: Icono, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icono className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold leading-tight">{label}</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Fila: gráfico semanal + desglose por destino ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        {/* Gráfico de barras por semana */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="text-sm font-black text-gray-900">Ingresos por semana</h2>
            <p className="text-xs text-gray-400 mt-0.5">Mes actual — ventas confirmadas</p>
          </div>
          <div className="flex items-end gap-4 h-44">
            {GRAFICO_SEMANAL.map(({ semana, monto, ventas }) => {
              const altura = Math.round((monto / maxMonto) * 100);
              return (
                <div key={semana} className="flex-1 flex flex-col items-center gap-2">
                  {/* Valor encima */}
                  <span className="text-[10px] font-bold text-gray-500">
                    ${(monto / 1000).toFixed(1)}k
                  </span>
                  {/* Barra */}
                  <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: "120px" }}>
                    <div
                      className="w-full bg-orange-500 rounded-t-lg transition-all"
                      style={{ height: `${altura}%` }}
                    />
                  </div>
                  {/* Etiqueta */}
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-600">{semana}</p>
                    <p className="text-[10px] text-gray-400">{ventas} ventas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desglose por destino */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-black text-gray-900 mb-4">Top destinos</h2>
          <div className="space-y-4">
            {[
              { destino: "Cancún, México",     ventas: 12, pct: 100 },
              { destino: "Medellín, Colombia", ventas: 10, pct: 83  },
              { destino: "Buenos Aires, Arg.", ventas: 8,  pct: 67  },
              { destino: "La Habana, Cuba",    ventas: 6,  pct: 50  },
              { destino: "Cusco, Perú",        ventas: 4,  pct: 33  },
            ].map(({ destino, ventas, pct }) => (
              <div key={destino} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700 truncate pr-2">{destino}</p>
                  <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                    <ShoppingBag className="w-3 h-3 inline mr-0.5" />
                    {ventas}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabla de ventas ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Barra de filtros de la tabla */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por usuario, destino o ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition"
            />
          </div>
          <div className="flex gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1">
            {["Todos", "Confirmada", "Pendiente", "Cancelada"].map((f) => (
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
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Destino</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Personas</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Monto</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden xl:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    No se encontraron ventas con ese filtro.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{v.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{v.usuario}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{v.destino}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">{v.personas} {v.personas === 1 ? "persona" : "personas"}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">${v.monto.toLocaleString()}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><BadgeEstado estado={v.estado} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden xl:table-cell">{v.fecha}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? "s" : ""}
        </div>
      </div>

    </div>
  );
}
