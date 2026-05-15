/**
 * TravelCard.tsx — Tarjeta de viaje minimalista
 *
 * Una sola imagen con overlay sutil; nombre, precio y cupos abajo.
 * Toda la tarjeta es clickeable y navega a /viaje/:id.
 */
import { Star, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

interface TravelCardProps {
  id?: number;
  nombre: string;
  precio: number;
  cuposDisponibles: number;
  totalAsientos?: number;
  personasPorViaje?: number;
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
  totalAsientos,
  personasPorViaje,
  imagenUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  fechaSalida,
  duracionDias,
  rating,
  descripcionCorta,
}: TravelCardProps) => {
  const navigate    = useNavigate();
  const cuposBajos  = cuposDisponibles <= 5;

  const irADetalle = () => {
    const destino = id ? `/viaje/${id}` : "/viaje/detalle";
    navigate(destino, {
      state: {
        id, nombre, precio, cuposDisponibles, totalAsientos, personasPorViaje,
        imagenUrl, fechaSalida, duracionDias, rating, descripcionCorta
      },
    });
  };

  return (
    <article
      onClick={irADetalle}
      className="group cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative h-[280px] overflow-hidden rounded-xl bg-orange-50">
        <img
          src={imagenUrl}
          alt={nombre}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge superior */}
        {cuposBajos && (
          <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-red-600">
            Últimos cupos
          </span>
        )}
        {rating !== undefined && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2 py-1 text-xs text-gray-800">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 px-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-medium text-gray-900 text-base leading-snug flex-1">
            {nombre}
          </h3>
          <p className="text-base font-semibold text-orange-600 whitespace-nowrap">
            ${precio}
            <span className="text-xs font-normal text-orange-400 ml-0.5">MXN</span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {duracionDias !== undefined && <span>{duracionDias} días</span>}
          {duracionDias !== undefined && (
            <span className="text-gray-300">·</span>
          )}
          <span className={cuposBajos ? "text-red-500" : ""}>
            {cuposBajos ? `Solo ${cuposDisponibles} cupos` : `${cuposDisponibles} cupos`}
          </span>
        </div>

        {descripcionCorta && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{descripcionCorta}</span>
          </p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); irADetalle(); }}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-medium text-white hover:bg-orange-600 transition"
        >
          Reservar
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};

export default TravelCard;
