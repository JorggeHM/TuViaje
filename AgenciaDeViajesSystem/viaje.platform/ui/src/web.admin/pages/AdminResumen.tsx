import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Plane, Users, ShoppingBag, DollarSign,
  ArrowRight, CheckCircle, Clock, XCircle,
} from "lucide-react";
import client from "../../infrastructure/api/client";

interface VentaReciente {
  id:             number;
  usuario_nombre: string;
  viaje_destino:  string;
  monto:          number;
  estado:         string;
  fecha:          string;
}

interface ViajeAlerta {
  title:           string;
  available_seats: number;
  total_ventas:    number;
}

interface Metricas {
  viajesActivos:   number;
  totalUsuarios:   number;
  totalVentas:     number;
  ingresos:        number;
}

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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${estilos[estado] ?? ""}`}>
      {iconos[estado]}
      {estado}
    </span>
  );
}

export default function AdminResumen() {
  const navigate = useNavigate();
  const [metricas,       setMetricas]       = useState<Metricas | null>(null);
  const [ventasRecientes, setVentasRecientes] = useState<VentaReciente[]>([]);
  const [viajesAlerta,   setViajesAlerta]   = useState<ViajeAlerta[]>([]);
  const [cargando,       setCargando]       = useState(true);

  useEffect(() => {
    Promise.all([
      client.get("/api/admin/ventas/stats"),
      client.get("/api/admin/viajes"),
      client.get("/api/admin/usuarios"),
      client.get("/api/admin/ventas"),
    ])
      .then(([statsRes, viajesRes, usuariosRes, ventasRes]) => {
        const stats    = statsRes.data.data    ?? {};
        const viajes   = viajesRes.data.data   ?? [];
        const usuarios = usuariosRes.data.data ?? [];
        const ventas   = ventasRes.data.data   ?? [];

        setMetricas({
          viajesActivos: viajes.filter((v: { estado: string }) => v.estado === "Activo").length,
          totalUsuarios: usuarios.length,
          totalVentas:   stats.total    ?? 0,
          ingresos:      stats.ingresos ?? 0,
        });

        setVentasRecientes(ventas.slice(0, 5));

        setViajesAlerta(
          viajes
            .filter((v: { available_seats: number; estado: string }) => v.available_seats <= 5 && v.estado === "Activo")
            .slice(0, 5)
        );
      })
      .finally(() => setCargando(false));
  }, []);

  const tarjetas = metricas ? [
    { titulo: "Viajes activos",       valor: String(metricas.viajesActivos), icono: Plane,        color: "bg-blue-50 text-blue-600"     },
    { titulo: "Usuarios registrados", valor: String(metricas.totalUsuarios), icono: Users,        color: "bg-purple-50 text-purple-600" },
    { titulo: "Ventas totales",       valor: String(metricas.totalVentas),   icono: ShoppingBag,  color: "bg-orange-50 text-orange-600" },
    { titulo: "Ingresos confirmados", valor: `$${Number(metricas.ingresos).toLocaleString()}`, icono: DollarSign, color: "bg-green-50 text-green-600" },
  ] : [];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cargando ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-24 animate-pulse" />
          ))
        ) : (
          tarjetas.map(({ titulo, valor, icono: Icono, color }) => (
            <div key={titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icono className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-semibold truncate">{titulo}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{valor}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ventas recientes + alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Tabla de últimas ventas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Ventas recientes</h2>
            <button onClick={() => navigate("/admin/ventas")}
              className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cargando ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : ventasRecientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                      Sin ventas registradas aún.
                    </td>
                  </tr>
                ) : (
                  ventasRecientes.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-400">#{v.id}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{v.usuario_nombre}</td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{v.viaje_destino}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">${Number(v.monto).toLocaleString()}</td>
                      <td className="px-5 py-3.5 hidden sm:table-cell"><BadgeEstado estado={v.estado} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plazas limitadas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Plazas limitadas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Viajes activos con ≤ 5 cupos</p>
          </div>
          <div className="p-4 space-y-3">
            {cargando ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))
            ) : viajesAlerta.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Todos los viajes tienen cupos disponibles.</p>
            ) : (
              viajesAlerta.map(({ title, available_seats, total_ventas }) => {
                const total = available_seats + total_ventas;
                const pct   = Math.round((available_seats / Math.max(total, 1)) * 100);
                return (
                  <div key={title} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700 truncate pr-2">{title}</p>
                      <span className="text-xs font-bold text-orange-600 flex-shrink-0">{available_seats}/{total}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400">{pct}% disponible</p>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 pb-4">
            <button onClick={() => navigate("/admin/viajes")}
              className="w-full py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition flex items-center justify-center gap-1.5">
              Gestionar viajes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Crear nuevo viaje", desc: "Agrega un destino al catálogo", ruta: "/admin/viajes",   color: "border-orange-200 bg-orange-50 hover:bg-orange-100" },
          { label: "Ver usuarios",      desc: "Gestiona los viajeros",         ruta: "/admin/usuarios", color: "border-purple-200 bg-purple-50 hover:bg-purple-100" },
          { label: "Reporte de ventas", desc: "Revisa el rendimiento",         ruta: "/admin/ventas",   color: "border-green-200  bg-green-50  hover:bg-green-100"  },
        ].map(({ label, desc, ruta, color }) => (
          <button key={ruta} onClick={() => navigate(ruta)}
            className={`rounded-2xl border p-5 text-left transition flex items-center justify-between ${color}`}>
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
