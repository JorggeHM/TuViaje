/**
 * AdminUsuarios.tsx — Gestión de usuarios del panel de administración
 * Ruta: /admin/usuarios
 *
 * Muestra la lista de usuarios registrados con sus datos clave.
 * Permite buscar, filtrar por estado y ver el detalle de cada perfil.
 * Solo UI — sin conexión al backend aún.
 *
 * Pendiente:
 *   - GET  /admin/usuarios           → listado
 *   - PATCH /admin/usuarios/:id/estado → activar/desactivar
 *   - DELETE /admin/usuarios/:id     → eliminar cuenta
 */

import { useState } from "react";
import {
  Search, Plane, ShoppingBag,
  UserCheck, UserX, Trash2, X,
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type EstadoUsuario = "Activo" | "Inactivo";

interface Usuario {
  id:        number;
  nombre:    string;
  email:     string;
  iniciales: string;
  registro:  string;
  viajes:    number;
  compras:   number;
  estado:    EstadoUsuario;
}

// ── Datos estáticos ───────────────────────────────────────────────────────────
const USUARIOS_INICIALES: Usuario[] = [
  { id: 1,  nombre: "Ana García",      email: "ana.garcia@mail.com",       iniciales: "AG", registro: "12 Ene 2024", viajes: 3,  compras: 3,  estado: "Activo"   },
  { id: 2,  nombre: "Carlos Méndez",   email: "carlos.m@mail.com",         iniciales: "CM", registro: "25 Ene 2024", viajes: 1,  compras: 1,  estado: "Activo"   },
  { id: 3,  nombre: "Sofía Torres",    email: "sofia.torres@mail.com",     iniciales: "ST", registro: "03 Feb 2024", viajes: 5,  compras: 4,  estado: "Activo"   },
  { id: 4,  nombre: "Luis Herrera",    email: "lherrera@mail.com",         iniciales: "LH", registro: "14 Feb 2024", viajes: 2,  compras: 2,  estado: "Activo"   },
  { id: 5,  nombre: "María López",     email: "m.lopez@mail.com",          iniciales: "ML", registro: "22 Feb 2024", viajes: 0,  compras: 0,  estado: "Inactivo" },
  { id: 6,  nombre: "Diego Ramírez",   email: "diego.r@mail.com",          iniciales: "DR", registro: "01 Mar 2024", viajes: 4,  compras: 4,  estado: "Activo"   },
  { id: 7,  nombre: "Valentina Cruz",  email: "vcruz@mail.com",            iniciales: "VC", registro: "08 Mar 2024", viajes: 1,  compras: 1,  estado: "Activo"   },
  { id: 8,  nombre: "Andrés Morales",  email: "andres.morales@mail.com",   iniciales: "AM", registro: "15 Mar 2024", viajes: 2,  compras: 1,  estado: "Inactivo" },
  { id: 9,  nombre: "Isabella Vega",   email: "ivega@mail.com",            iniciales: "IV", registro: "28 Mar 2024", viajes: 6,  compras: 6,  estado: "Activo"   },
  { id: 10, nombre: "Roberto Castro",  email: "r.castro@mail.com",         iniciales: "RC", registro: "10 Abr 2024", viajes: 0,  compras: 0,  estado: "Inactivo" },
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminUsuarios() {
  const [usuarios,     setUsuarios]     = useState<Usuario[]>(USUARIOS_INICIALES);
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [confirmElim,  setConfirmElim]  = useState<number | null>(null);

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const usuariosFiltrados = usuarios.filter((u) => {
    const match = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                  u.email.toLowerCase().includes(busqueda.toLowerCase());
    const estado = filtroEstado === "Todos" || u.estado === filtroEstado;
    return match && estado;
  });

  // ── Toggle estado activo/inactivo ─────────────────────────────────────────
  const toggleEstado = (id: number) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" }
          : u
      )
    );
  };

  // ── Eliminar usuario ──────────────────────────────────────────────────────
  const eliminarUsuario = (id: number) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    setConfirmElim(null);
  };

  // ── Métricas rápidas ──────────────────────────────────────────────────────
  const totalActivos   = usuarios.filter((u) => u.estado === "Activo").length;
  const totalInactivos = usuarios.filter((u) => u.estado === "Inactivo").length;
  const totalCompras   = usuarios.reduce((sum, u) => sum + u.compras, 0);

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── Mini métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total usuarios",  valor: usuarios.length,  color: "bg-purple-50 text-purple-600" },
          { label: "Activos",         valor: totalActivos,     color: "bg-green-50  text-green-600"  },
          { label: "Inactivos",       valor: totalInactivos,   color: "bg-gray-100  text-gray-500"   },
          { label: "Total compras",   valor: totalCompras,     color: "bg-orange-50 text-orange-600" },
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

      {/* ── Barra de búsqueda y filtros ───────────────────────────────── */}
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

      {/* ── Tabla de usuarios ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Registro</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Viajes</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Compras</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    {/* Avatar + datos */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {u.iniciales}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.nombre}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Fecha de registro */}
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{u.registro}</td>
                    {/* Nº viajes */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Plane className="w-3.5 h-3.5 text-gray-300" />
                        {u.viajes}
                      </div>
                    </td>
                    {/* Nº compras */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-300" />
                        {u.compras}
                      </div>
                    </td>
                    {/* Estado */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        u.estado === "Activo"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {u.estado}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle activo/inactivo */}
                        <button
                          onClick={() => toggleEstado(u.id)}
                          title={u.estado === "Activo" ? "Desactivar" : "Activar"}
                          className={`p-2 rounded-lg transition ${
                            u.estado === "Activo"
                              ? "text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-gray-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {u.estado === "Activo" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        {/* Eliminar */}
                        <button
                          onClick={() => setConfirmElim(u.id)}
                          title="Eliminar usuario"
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
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""} encontrado{usuariosFiltrados.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Modal confirmar eliminación ───────────────────────────────── */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <button
              onClick={() => setConfirmElim(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">¿Eliminar este usuario?</h3>
            <p className="text-sm text-gray-400 mb-6">
              Se eliminará la cuenta y todos sus datos. Esta acción es irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmElim(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarUsuario(confirmElim)}
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
