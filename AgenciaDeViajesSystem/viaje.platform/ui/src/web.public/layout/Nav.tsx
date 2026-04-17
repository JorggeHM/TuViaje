/**
 * Nav.tsx — Barra de navegación principal
 *
 * Componente sticky (se queda fijo al hacer scroll) que aparece en TODAS
 * las páginas, tanto públicas como privadas (PrivateLayout la reutiliza).
 *
 * Funcionalidades:
 * - Logo con ícono de avión → enlace a la home
 * - Links de navegación desktop con resaltado de ruta activa
 *   (compara window.location.pathname con cada href)
 * - Botón "Iniciar sesión" → navega a /login
 * - Menú hamburguesa para mobile con toggle de estado local
 *
 * Para agregar un nuevo link de navegación:
 *   1. Agrega un objeto { label, href } al array `links`
 *   2. Asegúrate de que la ruta exista en ApplicationRouter.tsx
 */
import { Plane, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Inicio",       href: "/" },
  { label: "Destinos",     href: "/destinos" },
  { label: "Experiencias", href: "/experiencias" },
  { label: "Nosotros",     href: "/nosotros" },
];

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = window.location.pathname;

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
              <a
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "text-white/85 hover:bg-white/15 hover:text-white"
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/login"
            className="rounded-lg bg-white text-orange-600 px-4 py-2 text-sm font-bold shadow-md hover:bg-orange-50 transition"
          >
            Iniciar sesión
          </a>
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
            <a
              key={href}
              href={href}
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              {label}
            </a>
          ))}
          <a
            href="/login"
            className="block mt-2 text-center rounded-lg bg-white text-orange-600 px-4 py-2.5 text-sm font-bold hover:bg-orange-50 transition"
          >
            Iniciar sesión
          </a>
        </div>
      )}
    </header>
  );
}

export default Nav;
