/**
 * CoverPublic.tsx — Hero banner de la sección pública
 *
 * Gran sección de imagen de fondo con texto animado, buscador y
 * chips de destinos rápidos. Se muestra en las páginas:
 *   /  →  /destinos  →  /experiencias  →  /nosotros
 *
 * NO se muestra en /viaje/detalle (ver PublicLayout.tsx → SIN_COVER).
 * NO se muestra en /login ni /register (usan PrivateLayout).
 *
 * La imagen de fondo se elige aleatoriamente de imagenesBanner
 * al cargar la página (se recalcula solo al refrescar el navegador).
 *
 * Animación de entrada: el contenido empieza invisible (opacity-0,
 * translate-y-6) y después de 120ms transiciona a visible.
 */
import { useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";

const imagenesBanner = [  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80",
];

const imagenAleatoria = imagenesBanner[Math.floor(Math.random() * imagenesBanner.length)];

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="relative h-[520px] sm:h-[560px] md:h-[620px] overflow-hidden">

      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[8000ms] ease-out"
        style={{ backgroundImage: `url(${imagenAleatoria})` }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Contenido principal */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-20">
        <div
          className={`max-w-2xl space-y-6 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/25 backdrop-blur-sm border border-orange-400/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-300">
            <MapPin className="w-3 h-3" />
            Viajes soñados, precios reales
          </span>

          <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl leading-tight">
            Tu próximo viaje<br />
            <span className="text-orange-400">
              comienza aquí
            </span>
          </h1>

          <p className="text-base text-gray-200 sm:text-lg max-w-lg leading-relaxed">
            Desde vuelos hasta alojamiento, te ofrecemos las mejores opciones para que solo te preocupes por disfrutar.
          </p>

          {/* Buscador */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 max-w-md">
            <div className="flex-1 flex items-center gap-2 pl-2">
              <Search className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <input
                type="text"
                placeholder="¿A dónde quieres ir?"
                className="bg-transparent text-white placeholder-gray-400 text-sm w-full focus:outline-none"
              />
            </div>
            <a
              href="/destinos"
              className="flex-shrink-0 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-900/20 hover:bg-orange-700 transition"
            >
              Buscar
            </a>
          </div>

          {/* Links rápidos */}
          <div className="flex flex-wrap gap-2">
            {["Cancún", "Medellín", "La Habana", "Tulum"].map((dest) => (
              <a
                key={dest}
                href="/destinos"
                className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-medium text-white hover:bg-white/20 transition"
              >
                {dest}
              </a>
            ))}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
