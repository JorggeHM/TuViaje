import { useState, useEffect } from "react";
import {
  Search, Plane, ShoppingBag,
  UserCheck, UserX, Trash2, X,
} from "lucide-react";
import client from "../../infrastructure/api/client";

interface Usuario {
  id:            number;
  name:          string;
  email:         string;
  rol:           string;
  activo:        number;
  created_at:    string;
  total_compras: number;
}

function iniciales(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminUsuarios() {
  const [usuarios,     setUsuarios]     = useState<Usuario[]>([]);
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [confirmElim,  setConfirmElim]  = useState<number | null>(null);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    client.get("/api/admin/usuarios")
      .then((res) => setUsuarios(res.data.data ?? []))
      .catch(() => setError("No se pudo cargar la lista de usuarios."))
      .finally(() => setCargando(false));
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const match  = u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                   u.email.toLowerCase().includes(busqueda.toLowerCase());
    const estado = filtroEstado === "Todos" ||
                   (filtroEstado === "Activo"   && u.activo === 1) ||
                   (filtroEstado === "Inactivo" && u.activo === 0);
    return match && estado;
  });

  const toggleEstado = async (id: number) => {
    try {
      await client.patch(`/api/admin/usuarios/${id}/estado`);
      setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, activo: u.activo === 1 ? 0 : 1 } : u));
    } catch {
      setError("Error al cambiar el estado del usuario.");
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      await client.delete(`/api/admin/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setConfirmElim(null);
    } catch {
      setError("Error al eliminar el usuario.");
    }
  };

  const totalActivos   = usuarios.filter((u) => u.activo === 1).length;
  const totalInactivos = usuarios.filter((u) => u.activo === 0).length;
  const totalCompras   = usuarios.reduce((sum, u) => sum + (u.total_compras ?? 0), 0);

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
          { label: "Total usuarios", valor: usuarios.length,  color: "bg-purple-50 text-purple-600" },
          { label: "Activos",        valor: totalActivos,     color: "bg-green-50  text-green-600"  },
          { label: "Inactivos",      valor: totalInactivos,   color: "bg-gray-100  text-gray-500"   },
          { label: "Total compras",  valor: totalCompras,     color: "bg-orange-50 text-orange-600" },
        ].map(({ label, valor, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <ShoppingBag className="w-4 h-4" />
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
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition"
          />
        </div>
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {["Todos", "Activo", "Inactivo"].map((f) => (
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
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Registro</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Rol</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Compras</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {iniciales(u.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        u.rol === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Plane className="w-3.5 h-3.5 text-gray-300" />
                        {u.total_compras ?? 0}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        u.activo === 1
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {u.activo === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleEstado(u.id)}
                          title={u.activo === 1 ? "Desactivar" : "Activar"}
                          className={`p-2 rounded-lg transition ${
                            u.activo === 1
                              ? "text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-gray-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {u.activo === 1 ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setConfirmElim(u.id)} title="Eliminar"
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
          {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""} encontrado{usuariosFiltrados.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Modal confirmar eliminación */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">¿Eliminar este usuario?</h3>
            <p className="text-sm text-gray-400 mb-6">Se eliminará la cuenta y todos sus datos. Esta acción es irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmElim(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => eliminarUsuario(confirmElim)}
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
