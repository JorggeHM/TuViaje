import { useState, useEffect, type ReactElement } from "react";
import {
  DollarSign, TrendingUp, ShoppingBag,
  Clock, CheckCircle, XCircle, Search, X,
} from "lucide-react";
import client from "../../infrastructure/api/client";

interface Venta {
  id:              number;
  usuario_nombre:  string;
  viaje_titulo:    string;
  viaje_destino:   string;
  monto:           number;
  estado:          string;
  fecha:           string;
}

interface Stats {
  total:        number;
  ingresos:     number;
  confirmadas:  number;
  pendientes:   number;
  canceladas:   number;
  top_destinos: { destino: string; ventas: number; total: number }[];
}

function BadgeEstado({ estado }: { estado: string }) {
  const estilos: Record<string, string> = {
    Confirmada: "bg-green-50 text-green-700 border-green-200",
    Pendiente:  "bg-amber-50 text-amber-700 border-amber-200",
    Cancelada:  "bg-red-50   text-red-700   border-red-200",
  };
  const iconos: Record<string, ReactElement> = {
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

function graficoSemanal(ventas: Venta[]) {
  const ahora = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const fin    = new Date(ahora);
    fin.setDate(ahora.getDate() - i * 7);
    const inicio = new Date(fin);
    inicio.setDate(fin.getDate() - 7);
    const semanaVentas = ventas.filter((v) => {
      const f = new Date(v.fecha);
      return v.estado === "Confirmada" && f >= inicio && f < fin;
    });
    return {
      semana: `Sem ${4 - i}`,
      monto:  semanaVentas.reduce((s, v) => s + Number(v.monto), 0),
      ventas: semanaVentas.length,
    };
  }).reverse();
}

export default function AdminVentas() {
  const [ventas,        setVentas]        = useState<Venta[]>([]);
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState("Todos");
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      client.get("/api/admin/ventas"),
      client.get("/api/admin/ventas/stats"),
    ])
      .then(([ventasRes, statsRes]) => {
        setVentas(ventasRes.data.data ?? []);
        setStats(statsRes.data.data ?? null);
      })
      .catch(() => setError("No se pudieron cargar los datos de ventas."))
      .finally(() => setCargando(false));
  }, []);

  const ventasFiltradas = ventas.filter((v) => {
    const match  = v.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                   v.viaje_destino?.toLowerCase().includes(busqueda.toLowerCase()) ||
                   String(v.id).includes(busqueda);
    const estado = filtroEstado === "Todos" || v.estado === filtroEstado;
    return match && estado;
  });

  const grafico  = graficoSemanal(ventas);
  const maxMonto = Math.max(...grafico.map((s) => s.monto), 1);

  const maxTopVentas = stats?.top_destinos?.[0]?.ventas ?? 1;

  return (
    <div className="space-y-5 max-w-7xl">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Ingresos confirmados", valor: `$${Number(stats?.ingresos ?? 0).toLocaleString()}`, icono: DollarSign, color: "bg-green-50 text-green-600" },
          { label: "Ventas confirmadas",   valor: String(stats?.confirmadas ?? 0),                    icono: TrendingUp, color: "bg-blue-50 text-blue-600"  },
          { label: "Pendientes",           valor: String(stats?.pendientes  ?? 0),                    icono: Clock,      color: "bg-amber-50 text-amber-600" },
          { label: "Canceladas",           valor: String(stats?.canceladas  ?? 0),                    icono: XCircle,    color: "bg-red-50 text-red-500"     },
        ].map(({ label, valor, icono: Icono, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icono className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold leading-tight">{label}</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">
                {cargando ? <span className="inline-block w-16 h-6 bg-gray-100 rounded animate-pulse" /> : valor}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico + top destinos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="text-sm font-black text-gray-900">Ingresos por semana</h2>
            <p className="text-xs text-gray-400 mt-0.5">Últimas 4 semanas — ventas confirmadas</p>
          </div>
          <div className="flex items-end gap-4 h-44">
            {grafico.map(({ semana, monto, ventas: v }) => {
              const altura = Math.round((monto / maxMonto) * 100);
              return (
                <div key={semana} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500">
                    {monto > 0 ? `$${(monto / 1000).toFixed(1)}k` : "-"}
                  </span>
                  <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: "120px" }}>
                    <div className="w-full bg-orange-500 rounded-t-lg transition-all" style={{ height: `${altura}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-600">{semana}</p>
                    <p className="text-[10px] text-gray-400">{v} ventas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-black text-gray-900 mb-4">Top destinos</h2>
          {cargando ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (stats?.top_destinos?.length ?? 0) === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Sin datos aún</p>
          ) : (
            <div className="space-y-4">
              {stats!.top_destinos.map(({ destino, ventas: v }) => {
                const pct = Math.round((v / maxTopVentas) * 100);
                return (
                  <div key={destino} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700 truncate pr-2">{destino}</p>
                      <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                        <ShoppingBag className="w-3 h-3 inline mr-0.5" />{v}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              <button key={f} onClick={() => setFiltroEstado(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtroEstado === f ? "bg-orange-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Viaje</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Monto</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden xl:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                    No se encontraron ventas con ese filtro.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">#{v.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{v.usuario_nombre}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{v.viaje_destino}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">${Number(v.monto).toLocaleString()}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><BadgeEstado estado={v.estado} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden xl:table-cell">
                      {new Date(v.fecha).toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
