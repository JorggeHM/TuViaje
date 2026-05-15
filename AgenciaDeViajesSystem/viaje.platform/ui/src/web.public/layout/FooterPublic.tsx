/**
 * FooterPublic.tsx — Pie de página minimalista
 */
import React from 'react';
import { Plane, Mail } from "lucide-react";

// SVGs inline porque la versión instalada de lucide-react (1.7.0) no exporta íconos
// de redes sociales. Usar SVGs directos también garantiza el branding correcto de cada red.
type IconProps = { className?: string };

const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
  </svg>
);

const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YoutubeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TikTokIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.85a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z"/>
  </svg>
);

const redes = [
  { label: "Facebook",  href: "https://facebook.com/tuviaje",  Icon: FacebookIcon  },
  { label: "Instagram", href: "https://instagram.com/tuviaje", Icon: InstagramIcon },
  { label: "Twitter",   href: "https://twitter.com/tuviaje",   Icon: TwitterIcon   },
  { label: "YouTube",   href: "https://youtube.com/@tuviaje",  Icon: YoutubeIcon   },
  { label: "TikTok",    href: "https://tiktok.com/@tuviaje",   Icon: TikTokIcon    },
];

const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="bg-orange-50/50 border-t border-orange-100 text-gray-600">
      <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />
      <div className="max-w-7xl mx-auto px-6 py-14 sm:px-8 lg:px-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-500 text-white">
                <Plane className="w-3.5 h-3.5" />
              </span>
              <span className="text-base font-semibold tracking-tight text-gray-900">TuViaje</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tu compañero de confianza para explorar el mundo con estilo y seguridad.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Información</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/nosotros" className="hover:text-orange-600 transition">Sobre nosotros</a></li>
              <li><a href="/nosotros" className="hover:text-orange-600 transition">Contacto</a></li>
              <li><a href="/nosotros" className="hover:text-orange-600 transition">Política de privacidad</a></li>
              <li><a href="/nosotros" className="hover:text-orange-600 transition">Términos y condiciones</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Destinos</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/destinos" className="hover:text-orange-600 transition">Medellín, Colombia</a></li>
              <li><a href="/destinos" className="hover:text-orange-600 transition">Tequila, México</a></li>
              <li><a href="/destinos" className="hover:text-orange-600 transition">La Habana, Cuba</a></li>
              <li><a href="/destinos" className="hover:text-orange-600 transition">Ver todos</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-orange-600">Síguenos</h4>
            <div className="flex items-center flex-wrap gap-2 text-orange-500">
              {redes.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="rounded-full bg-white border border-orange-100 p-2 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500 inline-flex items-center gap-2 pt-1">
              <Mail className="w-4 h-4 text-orange-500" /> soporte@tuviaje.com
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-orange-100 pt-6 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} TuViaje. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
