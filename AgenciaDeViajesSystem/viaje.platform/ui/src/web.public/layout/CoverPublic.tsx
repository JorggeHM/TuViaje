


import _, { useEffect, useState } from 'react';
const imagenesBanner = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d"
];
const imagenAleatoria =
  imagenesBanner[Math.floor(Math.random() * imagenesBanner.length)];
const Header = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="relative h-130 sm:h-140 md:h-155 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
      backgroundImage: `url(${imagenAleatoria})`,
        }}
        
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-black/60" />

      <div className="relative z-10 flex h-full items-center justify-start px-6 sm:px-8 lg:px-16">
        <div
          className={`max-w-xl space-y-5 text-left transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          <span className="inline-flex items-center rounded-full bg-orange-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-orange-200">
            Viajes soñados
          </span>

          <h1 className="text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            Tu proximo viaje comienza aquí
          </h1>

          <p className="text-base text-gray-100 sm:text-xl">
            Desde vuelos hasta alojamiento, te ofrecemos las mejores opciones para que solo te preocupes por disfrutar. 
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#destinos"
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Explorar Destinos
            </a>
            <a
              href="#contacto"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/15"
            >
              Contáctanos
            </a>
          </div>

          <p className="text-sm text-gray-300">
            Reserva ahora y descubre destinos paradisíacos con la mejor asesoría.
          </p>
        </div>
      </div>
    </header>
  );
};
export default Header;
