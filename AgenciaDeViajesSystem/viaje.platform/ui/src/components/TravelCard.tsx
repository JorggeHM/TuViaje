interface TravelCardProps {
  nombre: string;
  precio: number;
  cuposDisponibles: number;
  personasPorViaje: number;
  imagenUrl?: string;
  fechaSalida?: string;
  duracionDias?: number;
  rating?: number;
  descripcionCorta?: string;
}

const TravelCard = ({
  nombre,
  precio,
  cuposDisponibles,
  personasPorViaje,
  imagenUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  fechaSalida = 'Disponible según temporada',
  duracionDias = 7,
  rating = 4.8,
  descripcionCorta = 'Vive una experiencia inolvidable en destinos paradisíacos, con hotel, transporte y excursiones incluidas.'
}: TravelCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-44 overflow-hidden">
        <img
          src={imagenUrl}
          alt={nombre}
          className="h-full w-full object-cover transition duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-cyan-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Top Selección
        </span>
      </div>

      <div className="p-5 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">{nombre}</h2>
        <p className="text-sm text-gray-600">{descripcionCorta}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wider text-gray-500">Salida</p>
            <p className="text-sm font-semibold text-gray-800">{fechaSalida}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wider text-gray-500">Duración</p>
            <p className="text-sm font-semibold text-gray-800">{duracionDias} días</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wider text-gray-500">Cupos</p>
            <p className="text-sm font-semibold text-gray-800">{cuposDisponibles}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wider text-gray-500">Pax</p>
            <p className="text-sm font-semibold text-gray-800">Hasta {personasPorViaje} personas</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-lg text-gray-900">
            <span className="text-base text-gray-500">Desde </span>
            <span className="font-bold text-orange-600">${precio}</span>
          </p>
          <p className="text-sm font-semibold text-amber-500">{rating} ★</p>
        </div>

        <button className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-500">
          Reservar ahora
        </button>
      </div>
    </article>
  );
};

export default TravelCard;