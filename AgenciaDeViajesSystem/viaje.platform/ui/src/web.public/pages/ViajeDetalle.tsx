/**
 * ViajeDetalle.tsx — Ficha de producto de un viaje (ruta: /viaje/detalle)
 *
 * Página de detalle al estilo e-commerce (similar a MercadoLibre).
 * Se accede SIEMPRE desde TravelCard.tsx mediante navigate() con state,
 * nunca directamente por URL, porque los datos vienen del state de React Router.
 *
 * Flujo de acceso:
 *   TravelCard.tsx → navigate("/viaje/detalle", { state: { ...datosViaje } })
 *   ViajeDetalle → useLocation().state para leer los datos
 *   Si no hay state (acceso directo por URL) → redirige a /destinos
 *
 * Layout de 3 columnas (desktop):
 *   1. Galería  — Imagen principal + 4 miniaturas intercambiables
 *   2. Info     — Breadcrumb, título, rating, precio, descripción,
 *                 qué incluye, características del viaje
 *   3. Compra   — Panel sticky con precio, selector de personas,
 *                 total calculado, botón de reserva, garantías
 *
 * El panel de compra es "sticky" (se queda fijo mientras scrolleas el contenido).
 * El selector de personas actualiza el total en tiempo real.
 *
 * NOTA: CoverPublic no se muestra en esta ruta (ver PublicLayout.tsx → SIN_COVER).
 */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Star, CheckCircle2, Clock, Users, MapPin, CalendarDays,
  Shield, RefreshCw, CreditCard, Heart, ChevronLeft, Plane,
  BadgeCheck, MessageCircle,
} from "lucide-react";

const THUMBNAILS_EXTRA = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=300&q=80",
];

const INCLUIDOS = [
  "Vuelo de ida y vuelta",
  "Hotel con desayuno incluido",
  "Traslados aeropuerto-hotel",
  "Guía turístico en español",
  "Seguro de viaje básico",
];

const GARANTIAS = [
  { icon: RefreshCw,    titulo: "Cancelación gratuita",  desc: "Hasta 7 días antes de la salida" },
  { icon: Shield,       titulo: "Reserva protegida",     desc: "Te devolvemos tu dinero si algo falla" },
  { icon: BadgeCheck,   titulo: "Precio garantizado",    desc: "El mejor precio del mercado" },
  { icon: MessageCircle,titulo: "Soporte 24/7",          desc: "Asistencia antes, durante y después" },
];

export default function ViajeDetalle() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const viaje     = location.state as null | {
    nombre: string; precio: number; cuposDisponibles: number;
    personasPorViaje: number; imagenUrl: string; fechaSalida: string;
    duracionDias: number; rating: number; descripcionCorta: string;
  };

  const [imgActiva,  setImgActiva]  = useState(0);
  const [personas,   setPersonas]   = useState(1);

  if (!viaje) {
    navigate("/destinos");
    return null;
  }

  const {
    nombre, precio, cuposDisponibles, personasPorViaje,
    imagenUrl, fechaSalida, duracionDias, rating, descripcionCorta,
  } = viaje;

  const galeria   = [imagenUrl, ...THUMBNAILS_EXTRA];
  const cuposBajos = cuposDisponibles <= 5;
  const total      = precio * personas;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate("/")}         className="hover:text-orange-600 transition">Inicio</button>
          <span className="text-gray-300">/</span>
          <button onClick={() => navigate("/destinos")} className="hover:text-orange-600 transition">Destinos</button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{nombre}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Botón volver mobile */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm text-orange-600 font-semibold hover:text-orange-700 transition lg:hidden"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_290px] gap-8 items-start">

          {/* ══════════════════════════════
              COLUMNA 1 — Galería
          ══════════════════════════════ */}
          <div className="space-y-3 lg:sticky lg:top-24">

            {/* Imagen principal */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 aspect-[4/3]">
              <img
                src={galeria[imgActiva]}
                alt={nombre}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-5 gap-2">
              {galeria.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgActiva(i)}
                  className={`rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                    i === imgActiva
                      ? "border-orange-500 shadow-md"
                      : "border-transparent hover:border-orange-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════
              COLUMNA 2 — Información
          ══════════════════════════════ */}
          <div className="space-y-6">

            {/* Badge + contador */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                TOP SELECCIÓN
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Plane className="w-3.5 h-3.5 text-orange-400" />
                +124 viajeros este mes
              </span>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-black text-gray-900 leading-snug">{nombre}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{rating}</span>
              <span className="text-sm text-gray-400">(124 reseñas)</span>
            </div>

            {/* Precio */}
            <div className="border-t border-b border-gray-100 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Precio por persona</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-gray-900">${precio}</p>
                <p className="text-lg text-gray-400 mb-1">USD</p>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">IVA incluido</p>

              {/* Pago sin intereses */}
              <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-green-700 font-semibold">
                  3 mensualidades sin interés de ${Math.round(precio / 3)} USD
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h2 className="font-bold text-gray-900 mb-2">Sobre este destino</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{descripcionCorta}</p>
            </div>

            {/* Qué incluye */}
            <div>
              <h2 className="font-bold text-gray-900 mb-3">Lo que necesitas saber</h2>
              <ul className="space-y-2.5">
                {INCLUIDOS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Detalles del viaje */}
            <div>
              <h2 className="font-bold text-gray-900 mb-3">Características del viaje</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Clock,        label: "Duración",   valor: `${duracionDias} días` },
                  { icon: CalendarDays, label: "Salida",     valor: fechaSalida },
                  { icon: Users,        label: "Personas",   valor: `Hasta ${personasPorViaje} por reserva` },
                  { icon: MapPin,       label: "Cupos",      valor: cuposDisponibles <= 5 ? `¡Solo ${cuposDisponibles} disponibles!` : `${cuposDisponibles} disponibles` },
                ].map(({ icon: Icon, label, valor }) => (
                  <div key={label} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{valor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantías (versión desktop inline) */}
            <div className="hidden lg:grid grid-cols-2 gap-3 pt-2">
              {GARANTIAS.map(({ icon: Icon, titulo, desc }) => (
                <div key={titulo} className="flex items-start gap-2.5 text-sm">
                  <Icon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">{titulo}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════
              COLUMNA 3 — Panel de compra
          ══════════════════════════════ */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Card principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Header naranja */}
              <div className="bg-gradient-to-r from-orange-700 to-orange-500 px-5 py-4">
                <p className="text-orange-200 text-xs uppercase tracking-widest">Mejor precio</p>
                <p className="text-white text-3xl font-black mt-0.5">${precio} <span className="text-base font-normal text-orange-200">USD</span></p>
                <p className="text-orange-200 text-xs mt-0.5">por persona · IVA incluido</p>
              </div>

              <div className="p-5 space-y-4">

                {/* Disponibilidad */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500 font-medium">Disponibilidad</span>
                    <span className={`font-bold ${cuposBajos ? "text-red-600" : "text-green-600"}`}>
                      {cuposBajos ? `¡Solo ${cuposDisponibles} cupos!` : `${cuposDisponibles} cupos`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${cuposBajos ? "bg-red-400" : "bg-green-500"}`}
                      style={{ width: `${Math.min((cuposDisponibles / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Selector de personas */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-600 font-medium">Personas</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPersonas(Math.max(1, personas - 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600 transition text-base font-bold leading-none"
                    >−</button>
                    <span className="text-sm font-bold w-5 text-center">{personas}</span>
                    <button
                      onClick={() => setPersonas(Math.min(personasPorViaje, personas + 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600 transition text-base font-bold leading-none"
                    >+</button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-600">
                    Total <span className="text-gray-400">({personas} {personas === 1 ? "persona" : "personas"})</span>
                  </span>
                  <span className="font-black text-orange-600 text-lg">${total} USD</span>
                </div>

                {/* Botones */}
                <button className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 active:scale-95 transition-all shadow-md shadow-orange-900/20 flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Reservar ahora
                </button>
                <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-orange-300 hover:text-orange-600 transition flex items-center justify-center gap-2 text-sm">
                  <Heart className="w-4 h-4" />
                  Agregar a favoritos
                </button>
              </div>
            </div>

            {/* Garantías */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              {GARANTIAS.map(({ icon: Icon, titulo, desc }) => (
                <div key={titulo} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{titulo}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vendedor */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  TuViaje Oficial <BadgeCheck className="w-4 h-4 text-orange-500" />
                </p>
                <p className="text-xs text-gray-400">+1,500 viajes realizados</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
