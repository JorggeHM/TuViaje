/**
 * ReservaModal.tsx — Modal de detalle de reserva (ARCHIVO EN DESUSO)
 *
 * ⚠️  Este componente ya NO está en uso.
 * Fue reemplazado por ViajeDetalle.tsx, que es una página completa
 * con mejor estructura de información (galería + info + panel de compra).
 *
 * Puede eliminarse de forma segura o conservarse como referencia
 * si en el futuro se necesita un modal de confirmación rápida.
 *
 * La navegación a la ficha de producto se hace desde TravelCard.tsx:
 *   navigate("/viaje/detalle", { state: { ...datosViaje } })
 */
import { X, Clock, Users, Star, MapPin, CalendarDays, CheckCircle2, Plane, CreditCard } from "lucide-react";

interface ReservaModalProps {
  open: boolean;
  onClose: () => void;
  nombre: string;
  precio: number;
  cuposDisponibles: number;
  personasPorViaje: number;
  imagenUrl: string;
  fechaSalida: string;
  duracionDias: number;
  rating: number;
  descripcionCorta: string;
}

const incluidos = [
  "Vuelo de ida y vuelta",
  "Hotel con desayuno incluido",
  "Traslados aeropuerto-hotel",
  "Guía turístico en español",
  "Seguro de viaje básico",
];

export default function ReservaModal({
  open, onClose, nombre, precio, cuposDisponibles, personasPorViaje,
  imagenUrl, fechaSalida, duracionDias, rating, descripcionCorta,
}: ReservaModalProps) {
  if (!open) return null;

  const cuposBajos = cuposDisponibles <= 5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative h-56 overflow-hidden">
          <img src={imagenUrl} alt={nombre} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition">
            <X className="w-5 h-5" />
          </button>
          <span className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs font-bold text-amber-300">
            <Star className="w-3 h-3 fill-amber-400" />{rating} / 5.0
          </span>
          <div className="absolute bottom-4 left-5">
            <p className="text-orange-300 text-xs font-semibold uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <Plane className="w-3 h-3" /> Destino
            </p>
            <h2 className="text-white text-2xl font-black">{nombre}</h2>
          </div>
        </div>
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <p className="text-gray-500 text-sm leading-relaxed">{descripcionCorta}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Duración</p>
              <p className="text-sm font-bold text-gray-800">{duracionDias} días</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <CalendarDays className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Salida</p>
              <p className="text-sm font-bold text-gray-800 truncate">{fechaSalida}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Personas</p>
              <p className="text-sm font-bold text-gray-800">Hasta {personasPorViaje}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${cuposBajos ? "bg-red-50" : "bg-green-50"}`}>
              <MapPin className={`w-5 h-5 mx-auto mb-1 ${cuposBajos ? "text-red-500" : "text-green-600"}`} />
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cupos</p>
              <p className={`text-sm font-bold ${cuposBajos ? "text-red-600" : "text-green-700"}`}>
                {cuposBajos ? `¡Solo ${cuposDisponibles}!` : cuposDisponibles}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">¿Qué incluye el paquete?</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {incluidos.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-400 text-center">
            * El precio puede variar según disponibilidad y temporada.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Precio por persona</p>
            <p className="text-3xl font-black text-orange-600">${precio}<span className="text-sm font-normal text-gray-400 ml-1">USD</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-xl border border-gray-200 text-gray-600 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-orange-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-orange-700 transition shadow-md shadow-orange-900/20">
              <CreditCard className="w-4 h-4" />Proceder con la compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
