/**
 * TravelCard.tsx — Tarjeta de viaje para el catálogo
 *
 * Muestra la información resumida de un viaje: imagen, nombre, precio,
 * duración, cupos y rating. Se usa en dos lugares:
 *   1. Destinos.tsx    → recibe datos reales de la API
 *   2. Inicio.tsx      → recibe datos estáticos (destinos destacados)
 *
 * Al hacer clic en "Reservar" o en la imagen, navega a /viaje/detalle
 * pasando todos los datos del viaje como estado de React Router.
 * Esto permite que ViajeDetalle.tsx acceda a la información sin necesitar
 * un endpoint individual de la API.
 *
 * Props:
 *   nombre            — Nombre del destino
 *   precio            — Precio en USD por persona
 *   cuposDisponibles  — Cupos restantes (≤5 se muestra en rojo como alerta)
 *   personasPorViaje  — Máximo de personas por reserva
 *   imagenUrl         — URL de la imagen principal (Unsplash por defecto)
 *   fechaSalida       — Fecha o descripción de salida
 *   duracionDias      — Número de días del viaje
 *   rating            — Calificación de 1 a 5
 *   descripcionCorta  — Texto descriptivo corto (se corta a 2 líneas)
 */
import { Clock, Users, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router";

interface TravelCardProps {
  id?: number;
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
  id,
  nombre,
  precio,
  cuposDisponibles,
  personasPorViaje,
  imagenUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  fechaSalida = "Disponible según temporada",
  duracionDias = 7,
  rating = 4.8,
  descripcionCorta = "Vive una experiencia inolvidable en destinos paradisíacos, con hotel, transporte y excursiones incluidas.",
}: TravelCardProps) => {
  const navigate    = useNavigate();
  const cuposBajos  = cuposDisponibles <= 5; // Umbral para mostrar alerta roja de cupos

  /**
   * Navega a la página de detalle del viaje.
   * Los datos se pasan como "state" para que ViajeDetalle.tsx los lea
   * con useLocation().state — sin necesidad de un endpoint por ID.
   */
  const irADetalle = () => {
    navigate("/viaje/detalle", {
      state: {
        id, nombre, precio, cuposDisponibles, personasPorViaje,
        imagenUrl, fechaSalida, duracionDias, rating, descripcionCorta
      },
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

      {/* ── Imagen con overlays ── */}
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={irADetalle}>
        <img
          src={imagenUrl}
          alt={nombre}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Overlay oscuro para legibilidad del texto sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Badge superior izquierda */}
        <span className="absolute top-3 left-3 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow">
          Top Selección
        </span>

        {/* Rating superior derecha */}
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-amber-300">
          <Star className="w-3 h-3 fill-amber-400" />
          {rating}
        </span>

        {/* Nombre del destino sobre la imagen */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-semibold">
          <MapPin className="w-3 h-3 text-orange-300" />
          {nombre}
        </div>
      </div>

      {/* ── Contenido de la tarjeta ── */}
      <div className="p-5 space-y-4">

        {/* Descripción corta — line-clamp-2 limita a 2 líneas con "..." */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{descripcionCorta}</p>

        {/* Mini info: duración y personas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2">
            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Duración</p>
              <p className="text-xs font-semibold text-gray-800">{duracionDias} días</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2">
            <Users className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Pax</p>
              <p className="text-xs font-semibold text-gray-800">Hasta {personasPorViaje} pers.</p>
            </div>
          </div>
        </div>

        {/* Fecha de salida + indicador de cupos (verde/rojo) */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Salida: <span className="font-medium text-gray-600">{fechaSalida}</span>
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${cuposBajos ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {cuposBajos ? `¡Solo ${cuposDisponibles} cupos!` : `${cuposDisponibles} cupos`}
          </span>
        </div>

        {/* Precio + botón de reserva */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Desde</p>
            <p className="text-2xl font-black text-orange-600">
              ${precio}
              <span className="text-xs font-normal text-gray-400 ml-1">USD</span>
            </p>
          </div>
          {/* El botón navega a la misma función que clicar la imagen */}
          <button
            onClick={irADetalle}
            className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-900/20 hover:bg-orange-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Reservar
          </button>
        </div>
      </div>
    </article>
  );
};

export default TravelCard;
