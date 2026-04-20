import { Plane, Menu, LogOut, ChevronDown, MapPin, Calendar, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import AuthService from "../../infrastructure/services/auth.service";
import client from "../../infrastructure/api/client";

const links = [
  { label: "Inicio",       href: "/" },
  { label: "Destinos",     href: "/destinos" },
  { label: "Experiencias", href: "/experiencias" },
  { label: "Nosotros",     href: "/nosotros" },
];

interface Reserva {
  id:          number;
  title:       string;
  destination: string;
  start_date:  string;
  end_date:    string;
  monto:       number;
  estado:      string;
  imagen_url:  string;
}

const ESTADO_COLORES: Record<string, string> = {
  Pendiente:  "bg-amber-50 text-amber-700 border-amber-200",
  Confirmada: "bg-green-50 text-green-700 border-green-200",
  Cancelada:  "bg-red-50   text-red-700   border-red-200",
};

function Nav() {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [reservas,       setReservas]       = useState<Reserva[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = window.location.pathname;
  const isAuth  = AuthService.isAuthenticated();
  const user    = AuthService.getUser();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cargar reservas al abrir el dropdown
  useEffect(() => {
    if (dropdownOpen && isAuth && reservas.length === 0) {
      setLoadingReservas(true);
      client.get("/api/auth/reservas", { skipAuthRedirect: true } as object)
        .then((res) => setReservas(res.data.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingReservas(false));
    }
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await AuthService.logout();
    window.location.href = "/";
  };

  const iniciales = user?.name
    ?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() ?? "TU";

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-700 to-orange-500 shadow-lg shadow-orange-900/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <a href="/" className="inline-flex items-center gap-2 text-white group">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 transition">
            <Plane className="w-4 h-4 text-white" strokeWidth={2} />
          </span>
          <span className="font-black tracking-wide text-lg">TuViaje</span>
        </a>

        {/* Links desktop */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          {links.map(({ label, href }) => {
            const isActive = current === href;
            return (
              <a key={href} href={href}
                className={`px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-white/25 text-white" : "text-white/85 hover:bg-white/15 hover:text-white"
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-2">
          {isAuth && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 transition px-3 py-2"
              >
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-orange-600 text-xs font-black flex-shrink-0">
                  {iniciales}
                </div>
                <span className="text-white text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

                  {/* Header usuario */}
                  <div className="bg-gradient-to-r from-orange-700 to-orange-500 px-5 py-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/30 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {iniciales}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-black text-sm truncate">{user.name}</p>
                      <p className="text-orange-200 text-xs truncate">{user.email}</p>
                      {user.rol === "admin" && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Administrador
                        </span>
                      )}
                    </div>
                    <button onClick={() => setDropdownOpen(false)} className="ml-auto text-white/60 hover:text-white transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Acceso rápido admin */}
                  {user.rol === "admin" && (
                    <div className="px-4 pt-3 pb-1">
                      <a href="/admin"
                        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-orange-50 text-orange-600 text-sm font-bold hover:bg-orange-100 transition">
                        <Plane className="w-4 h-4" />
                        Ir al panel de administración
                      </a>
                    </div>
                  )}

                  {/* Mi perfil */}
                  <div className="px-4 pt-2 pb-1">
                    <a href="/perfil"
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Mi perfil
                    </a>
                  </div>

                  {/* Historial de reservas */}
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mis viajes</p>

                    {loadingReservas ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                      </div>
                    ) : reservas.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">
                        Aún no tenés reservas. <a href="/destinos" className="text-orange-500 font-semibold hover:underline">¡Explorá destinos!</a>
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {reservas.map((r) => (
                          <div key={r.id} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-2.5">
                            {r.imagen_url ? (
                              <img src={r.imagen_url} alt={r.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Plane className="w-4 h-4 text-orange-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 truncate">{r.title}</p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />{r.destination}
                              </p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />{r.start_date}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${ESTADO_COLORES[r.estado] ?? ""}`}>
                                {r.estado}
                              </span>
                              <span className="text-[10px] font-black text-gray-700">${Number(r.monto).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a href="/login"
              className="rounded-lg bg-white text-orange-600 px-4 py-2 text-sm font-bold shadow-md hover:bg-orange-50 transition">
              Iniciar sesión
            </a>
          )}
        </div>

        {/* Botón hamburguesa mobile */}
        <button
          className="md:hidden rounded-lg bg-white/15 p-2 text-white hover:bg-white/25 transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden bg-orange-600 border-t border-white/10 px-4 pb-4 space-y-1">
          {links.map(({ label, href }) => (
            <a key={href} href={href}
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-white/15 transition">
              {label}
            </a>
          ))}
          {isAuth && user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 mt-2 bg-white/10 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-orange-600 text-xs font-black">
                  {iniciales}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">{user.name}</p>
                  <p className="text-orange-200 text-xs truncate">{user.email}</p>
                </div>
              </div>
              {user.rol === "admin" && (
                <a href="/admin"
                  className="block text-center rounded-lg bg-white/20 text-white px-4 py-2.5 text-sm font-bold hover:bg-white/30 transition">
                  Panel Admin
                </a>
              )}
              <button onClick={handleLogout}
                className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg bg-white/10 text-white px-4 py-2.5 text-sm font-semibold hover:bg-white/20 transition">
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <a href="/login"
              className="block mt-2 text-center rounded-lg bg-white text-orange-600 px-4 py-2.5 text-sm font-bold hover:bg-orange-50 transition">
              Iniciar sesión
            </a>
          )}
        </div>
      )}
    </header>
  );
}

export default Nav;
