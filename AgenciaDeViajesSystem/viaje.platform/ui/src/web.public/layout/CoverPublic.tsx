/**
 * CoverPublic.tsx — Header compartido del área pública
 *
 * Dos modos:
 *   - compact=false (home): hero grande con título principal + stats + CTAs
 *   - compact=true (otras): banner reducido, decorativo, con título corto
 *
 * Imagen aleatoria de fondo + overlay tintado naranja en ambos modos.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocation, Link } from "react-router";
import CoversService from "../../infrastructure/services/covers.service";
import StatsService, { formatearMiles } from "../../infrastructure/services/stats.service";
import type { StatsPublicas } from "../../infrastructure/services/stats.service";

const imagenesFallback = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80",
];

interface HeaderProps {
  compact?: boolean;
  title?: string;
  subtitle?: string;
  tag?: string;
}

const Header = ({ compact = false, title, subtitle, tag }: HeaderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [urls, setUrls]           = useState<string[]>(imagenesFallback);
  const [stats, setStats]         = useState<StatsPublicas | null>(null);
  const { pathname } = useLocation();
  const esHome = pathname === "/";

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    CoversService.listarPublicas()
      .then((covers) => {
        if (covers.length > 0) setUrls(covers.map((c) => c.url));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (compact) return;
    StatsService.obtener()
      .then(setStats)
      .catch(() => {});
  }, [compact]);

  const imagenAleatoria = useMemo(
    () => urls[Math.floor(Math.random() * urls.length)],
    [urls]
  );

  const irAComoFunciona = () => {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Modo compacto ─────────────────────────────────────────
  if (compact) {
    return (
      <header className="relative overflow-hidden h-[200px] sm:h-[220px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imagenAleatoria})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/80 via-orange-900/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
          <div
            className={`max-w-2xl transition-all duration-500 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {tag && (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-orange-100 bg-orange-500/25 backdrop-blur-sm border border-orange-300/30 px-2.5 py-1 rounded-full mb-3">
                {tag}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-white/80 mt-1.5 max-w-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ── Modo grande (home) ────────────────────────────────────
  return (
    <header className="relative overflow-hidden min-h-[560px] lg:min-h-[600px] flex items-center">

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imagenAleatoria})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-orange-950/55 via-orange-900/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-20">
        <div
          className={`max-w-2xl space-y-6 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-orange-100 bg-orange-500/25 backdrop-blur-sm border border-orange-300/30 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Viajes soñados, precios reales
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            <span className="block text-orange-300">Los mejores</span>
            <span className="block text-white">destinos online</span>
            <span className="block text-white">del <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">mundo</span></span>
          </h1>

          <p className="text-base text-white/85 max-w-md leading-relaxed">
            Vuelos, alojamiento y experiencias únicas en un solo paquete. Solo te queda hacer la maleta.
          </p>

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <Link
              to="/destinos"
              className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-7 py-3 text-sm font-semibold hover:bg-orange-50 transition shadow-lg"
            >
              Reservar
              <ArrowRight className="w-4 h-4" />
            </Link>
            {esHome && (
              <button
                type="button"
                onClick={irAComoFunciona}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white px-7 py-3 text-sm font-medium hover:bg-white/20 transition"
              >
                Cómo funciona
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 pt-5 border-t border-white/20">
            <div>
              {stats ? (
                <p className="text-xl font-bold text-white">{stats.ciudades_visitadas}+</p>
              ) : (
                <div className="h-6 w-12 rounded bg-white/20 animate-pulse" />
              )}
              <p className="text-[11px] text-white/60 uppercase tracking-wider mt-1">Destinos</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              {stats ? (
                <p className="text-xl font-bold text-white">{formatearMiles(stats.personas_viajeras)}+</p>
              ) : (
                <div className="h-6 w-12 rounded bg-white/20 animate-pulse" />
              )}
              <p className="text-[11px] text-white/60 uppercase tracking-wider mt-1">Viajeros</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              {stats ? (
                <p className="text-xl font-bold text-white">{stats.satisfaccion}%</p>
              ) : (
                <div className="h-6 w-12 rounded bg-white/20 animate-pulse" />
              )}
              <p className="text-[11px] text-white/60 uppercase tracking-wider mt-1">Satisfacción</p>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
