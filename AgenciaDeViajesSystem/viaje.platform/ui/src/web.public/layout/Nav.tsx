import { Plane, Menu, LogOut, ChevronDown, MapPin, Calendar, Loader2, X, Heart, User, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../infrastructure/auth/AuthContext";
import client from "../../infrastructure/api/client";
import FavoritosService from "../../infrastructure/services/favoritos.service";
import type { ViajeFavorito } from "../../infrastructure/services/favoritos.service";

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
  Pendiente:  "text-amber-700 border-amber-200 bg-amber-50",
  Confirmada: "text-emerald-700 border-emerald-200 bg-emerald-50",
  Cancelada:  "text-red-700 border-red-200 bg-red-50",
};

function Nav() {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [reservas,       setReservas]       = useState<Reserva[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [favOpen,        setFavOpen]        = useState(false);
  const [favoritos,      setFavoritos]      = useState<ViajeFavorito[]>([]);
  const [loadingFav,     setLoadingFav]     = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const favRef      = useRef<HTMLDivElement>(null);

  const current = window.location.pathname;
  const { user, isAuthenticated: isAuth, logout } = useAuth();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (favRef.current && !favRef.current.contains(e.target as Node)) {
        setFavOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (dropdownOpen && isAuth && reservas.length === 0) {
      setLoadingReservas(true);
      client.get("/api/auth/reservas", { skipAuthRedirect: true } as object)
        .then((res) => setReservas(res.data.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingReservas(false));
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (favOpen && isAuth && favoritos.length === 0) {
      setLoadingFav(true);
      FavoritosService.listar()
        .then(setFavoritos)
        .catch(() => {})
        .finally(() => setLoadingFav(false));
    }
  }, [favOpen]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const iniciales = user?.name
    ?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() ?? "TU";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-orange-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <a href="/" className="inline-flex items-center gap-2 text-gray-900 group flex-shrink-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white group-hover:bg-orange-600 transition">
            <Plane className="w-4 h-4" strokeWidth={2.2} />
          </span>
          <span className="font-bold tracking-tight text-base sm:text-lg uppercase">
            Tu<span className="text-orange-500">Viaje</span>
          </span>
        </a>

        {/* Links de navegación (desktop) */}
        <nav className="hidden md:flex items-center gap-1 text-sm flex-1 justify-center">
          {links.map(({ label, href }) => {
            const isActive = current === href;
            return (
              <a key={label} href={href}
                className={`relative px-4 py-1.5 rounded-md transition ${
                  isActive
                    ? "text-orange-600 font-medium bg-orange-50"
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/60"
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {isAuth ? (
            <div className="relative" ref={favRef}>
              <button
                onClick={() => setFavOpen(!favOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                <Heart className={`w-4 h-4 ${favOpen ? "fill-orange-500 text-orange-500" : ""}`} />
                <span className="hidden lg:inline">Favoritos</span>
              </button>

              {favOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden z-50">

                  <div className="px-5 py-3 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <Heart className="w-4 h-4 fill-white" />
                    <p className="font-medium text-sm">Mis favoritos</p>
                    <button onClick={() => setFavOpen(false)} className="ml-auto text-white/70 hover:text-white transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="px-4 py-3">
                    {loadingFav ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                      </div>
                    ) : favoritos.length === 0 ? (
                      <div className="text-center py-6">
                        <Heart className="w-7 h-7 text-orange-200 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="text-xs text-gray-500">Aún no marcaste viajes favoritos.</p>
                        <a href="/destinos" className="inline-block mt-2 text-xs text-orange-500 hover:underline">
                          Explorá destinos →
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                        {favoritos.map((v) => (
                          <a
                            key={v.id}
                            href={`/viaje/${v.id}`}
                            className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-orange-50/40 transition"
                          >
                            {v.imagen_url ? (
                              <img src={v.imagen_url} alt={v.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Plane className="w-3.5 h-3.5 text-orange-500" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-900 truncate">{v.title}</p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />{v.destination}
                              </p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />{v.start_date}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {v.rating !== undefined && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  {v.rating}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-orange-600">${Number(v.price).toLocaleString()}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
              <Heart className="w-4 h-4" />
              <span className="hidden lg:inline">Favoritos</span>
            </a>
          )}

          {isAuth && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                    {iniciales}
                  </div>
                )}
                <span className="text-gray-700 text-sm max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden z-50">

                  <div className="px-5 py-4 flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {iniciales}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-orange-100 text-xs truncate">{user.email}</p>
                      {user.rol === "admin" && (
                        <span className="inline-block mt-1 text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Administrador
                        </span>
                      )}
                    </div>
                    <button onClick={() => setDropdownOpen(false)} className="ml-auto text-white/70 hover:text-white transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {user.rol === "admin" && (
                    <div className="px-4 pt-3 pb-1">
                      <a href="/admin"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition">
                        <Plane className="w-4 h-4" />
                        Panel de administración
                      </a>
                    </div>
                  )}

                  <div className="px-4 pt-2 pb-1">
                    <a href="/perfil"
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition">
                      <User className="w-4 h-4" />
                      Mi perfil
                    </a>
                  </div>

                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[10px] font-medium text-orange-600 uppercase tracking-wider mb-2">Mis viajes</p>

                    {loadingReservas ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                      </div>
                    ) : reservas.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">
                        Aún no tenés reservas. <a href="/destinos" className="text-orange-500 hover:underline">Explorá destinos</a>
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {reservas.map((r) => (
                          <div key={r.id} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-orange-50/40 transition">
                            {r.imagen_url ? (
                              <img src={r.imagen_url} alt={r.title} className="w-9 h-9 rounded-md object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Plane className="w-3.5 h-3.5 text-orange-500" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-900 truncate">{r.title}</p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />{r.destination}
                              </p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />{r.start_date}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${ESTADO_COLORES[r.estado] ?? ""}`}>
                                {r.estado}
                              </span>
                              <span className="text-[10px] font-semibold text-orange-600">${Number(r.monto).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
              <User className="w-4 h-4" />
              <span>Cuenta</span>
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden rounded-md p-2 text-gray-600 hover:bg-orange-50 transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Menú mobile ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-orange-100 px-4 py-3 space-y-1 bg-white">
          {links.map(({ label, href }) => (
            <a key={label} href={href}
              className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
              {label}
            </a>
          ))}
          {isAuth && user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-gray-100">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                    {iniciales}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">{user.name}</p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                </div>
              </div>
              {user.rol === "admin" && (
                <a href="/admin"
                  className="block text-center rounded-md bg-amber-50 text-amber-700 px-4 py-2 text-sm font-medium hover:bg-amber-100 transition">
                  Panel Admin
                </a>
              )}
              <a href="/perfil"
                className="block text-center rounded-md border border-orange-200 text-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-50 transition">
                Mi perfil
              </a>
              <button onClick={handleLogout}
                className="w-full mt-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <a href="/login"
              className="block mt-2 text-center rounded-full bg-orange-500 text-white px-4 py-2 text-sm font-medium hover:bg-orange-600 transition">
              Iniciar sesión
            </a>
          )}
        </div>
      )}
    </header>
  );
}

export default Nav;
