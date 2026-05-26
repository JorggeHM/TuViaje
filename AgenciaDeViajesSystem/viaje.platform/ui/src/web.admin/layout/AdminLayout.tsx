/**
 * AdminLayout.tsx — Layout base del panel de administración
 *
 * Proporciona la estructura visual persistente del área de admin:
 *   - Sidebar izquierdo con navegación por secciones
 *   - Topbar superior con nombre del admin
 *   - Área de contenido principal (Outlet de React Router)
 *
 * Rutas hijas que usan este layout (definidas en ApplicationRouter.tsx):
 *   /admin             → AdminResumen   (overview general)
 *   /admin/viajes      → AdminViajes    (gestión de viajes)
 *   /admin/usuarios    → AdminUsuarios  (gestión de usuarios)
 *   /admin/ventas      → AdminVentas    (reporte de ventas)
 *
 * Pendiente:
 *   - Guard de autenticación: verificar que el usuario tiene rol "admin"
 *     antes de renderizar el Outlet; si no → redirigir a /login
 */

import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router";
import {
  LayoutDashboard,
  Plane,
  Users,
  TrendingUp,
  MessageSquare,
  Receipt,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../infrastructure/auth/AuthContext";

// ── Definición de ítems del menú lateral ─────────────────────────────────────
const NAV_ITEMS = [
  { to: "/admin",              label: "Resumen",      icon: LayoutDashboard, end: true  },
  { to: "/admin/viajes",       label: "Viajes",       icon: Plane,           end: false },
  { to: "/admin/usuarios",     label: "Usuarios",     icon: Users,           end: false },
  { to: "/admin/ventas",       label: "Ventas",       icon: TrendingUp,      end: false },
  { to: "/admin/experiencias", label: "Experiencias", icon: MessageSquare,   end: false },
  { to: "/admin/covers",       label: "Hero",         icon: ImageIcon,       end: false },
];

// ── Mapa de títulos para el topbar ────────────────────────────────────────────
const TITULOS: Record<string, string> = {
  "/admin":              "Resumen general",
  "/admin/viajes":       "Gestión de viajes",
  "/admin/usuarios":     "Gestión de usuarios",
  "/admin/ventas":       "Reporte de ventas",
  "/admin/experiencias": "Moderación de experiencias",
  "/admin/covers":       "Imágenes del header",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const { user: adminUser, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)         return <Navigate to="/"      replace />;

  const tituloPagina = TITULOS[pathname] ?? "Panel de administración";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Overlay oscuro en móvil cuando el sidebar está abierto ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════
          SIDEBAR IZQUIERDO
      ════════════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >

        {/* Logo de la app */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">TuViaje</p>
            <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">
              Panel Admin
            </p>
          </div>
          {/* Botón cerrar en móvil */}
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Perfil del admin + botón de salida */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          {/* Info admin */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {adminUser?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{adminUser?.name ?? "Admin"}</p>
              <p className="text-[10px] text-gray-400 truncate">{adminUser?.email ?? ""}</p>
            </div>
          </div>
          {/* Botón cerrar sesión */}
          <button
            onClick={async () => { await logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          ÁREA PRINCIPAL (topbar + contenido)
      ════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          {/* Botón hamburger (solo en móvil) */}
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Título de la sección activa */}
          <h1 className="text-base font-bold text-gray-900 flex-1 truncate">{tituloPagina}</h1>

        </header>

        {/* Contenido de la página activa (inyectado por React Router) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
