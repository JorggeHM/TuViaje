/**
 * TravelCardDetailed.tsx — Variante vertical minimalista (3 columnas)
 */
import { Star, MapPin, Clock, Users, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

interface TravelCardDetailedProps {
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
  destino?: string;
}

const formatearFecha = (iso?: string): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
};

const TravelCardDetailed = ({
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
  destino,
}: TravelCardDetailedProps) => {
  const navigate    = useNavigate();
  const cuposBajos  = cuposDisponibles <= 5;
  const fechaFmt    = formatearFecha(fechaSalida);

  const irADetalle = () => {
    const url = id ? `/viaje/${id}` : "/viaje/detalle";
    navigate(url, {
      state: {
        id, nombre, precio, cuposDisponibles, totalAsientos, personasPorViaje,
        imagenUrl, fechaSalida, duracionDias, rating, descripcionCorta
      },
    });
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-white border border-orange-100/60 hover:border-orange-200 transition h-full">

      {/* Imagen */}
      <div
        className="relative shrink-0 h-52 cursor-pointer overflow-hidden bg-orange-50"
        onClick={irADetalle}
      >
        <img
          src={imagenUrl}
          alt={nombre}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {rating !== undefined && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs text-gray-800">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        )}

        {cuposBajos && (
          <span className="absolute top-3 right-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-red-600">
            Últimos cupos
          </span>
        )}
      </div>

      {/* Información */}
      <div className="flex-1 flex flex-col p-5">

        <div className="mb-2">
          <h3 className="text-lg font-medium text-gray-900 leading-tight tracking-tight">{nombre}</h3>
          {destino && destino !== nombre && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <MapPin className="w-3 h-3" />
              {destino}
            </p>
          )}
        </div>

        {descripcionCorta && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {descripcionCorta}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
          {duracionDias !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {duracionDias} días
            </span>
          )}
          {fechaFmt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {fechaFmt}
            </span>
          )}
          {personasPorViaje !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              Hasta {personasPorViaje} pers.
            </span>
          )}
        </div>

        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] ${
              cuposBajos ? "text-red-600" : "text-green-700"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cuposBajos ? "bg-red-500" : "bg-green-500"}`} />
            {cuposBajos ? `Solo ${cuposDisponibles} cupos` : `${cuposDisponibles} cupos disponibles`}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4 border-t border-orange-100/60">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-orange-500">Desde</p>
            <p className="text-xl font-semibold text-orange-600 leading-none mt-1 whitespace-nowrap">
              ${precio}
              <span className="text-[11px] font-normal text-orange-400 ml-1">MXN</span>
            </p>
          </div>
          <button
            onClick={irADetalle}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition"
          >
            Reservar
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default TravelCardDetailed;
