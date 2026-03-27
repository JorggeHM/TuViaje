import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="bg-gray-950 text-gray-100 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2">
              <span className="text-2xl">✈</span>
              <span className="text-xl font-bold tracking-wide">TViaje</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Tu compañero de confianza para explorar el mundo con estilo y seguridad.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Información</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-gray-100 transition">Sobre nosotros</a></li>
              <li><a href="#" className="hover:text-gray-100 transition">Contacto</a></li>
              <li><a href="#" className="hover:text-gray-100 transition">Política de privacidad</a></li>
              <li><a href="#" className="hover:text-gray-100 transition">Términos y condiciones</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Destinos</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#destinos" className="hover:text-gray-100 transition">Medellín, Colombia</a></li>
              <li><a href="#destinos" className="hover:text-gray-100 transition">Tequila, México</a></li>
              <li><a href="#destinos" className="hover:text-gray-100 transition">La Habana, Cuba</a></li>
              <li><a href="#destinos" className="hover:text-gray-100 transition">Ver todos</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Síguenos</h4>
            <div className="flex items-center gap-3 text-gray-400">
              <a href="#" aria-label="Facebook" className="rounded-full bg-gray-900 p-2 hover:bg-gray-800 transition"><i className="fab fa-facebook" /></a>
              <a href="#" aria-label="Twitter" className="rounded-full bg-gray-900 p-2 hover:bg-gray-800 transition"><i className="fab fa-twitter" /></a>
              <a href="#" aria-label="Instagram" className="rounded-full bg-gray-900 p-2 hover:bg-gray-800 transition"><i className="fab fa-instagram" /></a>
              <a href="#" aria-label="TikTok" className="rounded-full bg-gray-900 p-2 hover:bg-gray-800 transition"><i className="fab fa-tiktok" /></a>
            </div>
            <p className="text-sm text-gray-300 inline-flex items-center gap-2">
              <i className="fas fa-envelope text-gray-400" /> soporte@tviaje.com
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} TViaje. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
