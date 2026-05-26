/**
 * ViajeDetalle.tsx — Ficha de producto minimalista de un viaje
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  Star, CheckCircle2, Clock, Users, MapPin, CalendarDays,
  Shield, RefreshCw, CreditCard, Heart, ChevronLeft, Plane,
  BadgeCheck, MessageCircle, X, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ReservasService from "../../infrastructure/services/reservas.service";
import { useAuth } from "../../infrastructure/auth/AuthContext";
import ViajesService, { type Garantia } from "../../infrastructure/services/viajes.service";
import FavoritosService from "../../infrastructure/services/favoritos.service";

/** Galería genérica usada solo cuando el viaje no tiene una propia cargada. */
const GALERIA_FALLBACK = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=300&q=80",
];

const INCLUIDOS_FALLBACK = [
  "Vuelo de ida y vuelta",
  "Hotel con desayuno incluido",
  "Traslados aeropuerto-hotel",
  "Guía turístico en español",
  "Seguro de viaje básico",
];

const GARANTIAS_FALLBACK: Garantia[] = [
  { icon: "RefreshCw",    titulo: "Cancelación gratuita", desc: "Hasta 7 días antes de la salida" },
  { icon: "Shield",       titulo: "Reserva protegida",    desc: "Te devolvemos tu dinero si algo falla" },
  { icon: "BadgeCheck",   titulo: "Precio garantizado",   desc: "El mejor precio del mercado" },
  { icon: "MessageCircle",titulo: "Soporte 24/7",         desc: "Asistencia antes, durante y después" },
];

/** Catálogo cerrado de íconos válidos para garantías guardadas en BD. */
const ICONOS_GARANTIA: Record<string, LucideIcon> = {
  Shield, RefreshCw, BadgeCheck, MessageCircle, Plane, CheckCircle2, Clock, Users,
};

interface ViajeData {
  id?: number; nombre: string; precio: number; cuposDisponibles: number;
  totalAsientos?: number; personasPorViaje: number; imagenUrl: string;
  fechaSalida: string; duracionDias: number; rating: number; descripcionCorta: string;
  incluidos?: string[]   | null;
  galeria?:   string[]   | null;
  garantias?: Garantia[] | null;
}

export default function ViajeDetalle() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const stateViaje = location.state as ViajeData | null;

  const [viaje,        setViaje]        = useState<ViajeData | null>(stateViaje);
  const [imgActiva,    setImgActiva]    = useState(0);
  const [personas,     setPersonas]     = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando,     setCargando]     = useState(false);
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const [fetchError,    setFetchError]    = useState(false);
  const [favMsg,        setFavMsg]        = useState<string | null>(null);
  const [esFavorito,    setEsFavorito]    = useState(false);
  const [favLoading,    setFavLoading]    = useState(false);

  useEffect(() => {
    if (!stateViaje && paramId) {
      const numId = parseInt(paramId, 10);
      if (!isNaN(numId)) {
        ViajesService.obtener(numId)
          .then((v) => {
            setViaje({
              id:               v.id,
              nombre:           v.title,
              precio:           v.price,
              cuposDisponibles: v.available_seats,
              totalAsientos:    v.available_seats + (v.total_ventas ?? 0),
              personasPorViaje: v.max_personas ?? 2,
              imagenUrl:        v.imagen_url,
              fechaSalida:      v.start_date,
              duracionDias:     v.duracion_dias,
              rating:           v.rating,
              descripcionCorta: v.description,
              incluidos:        v.incluidos,
              galeria:          v.galeria,
              garantias:        v.garantias,
            });
          })
          .catch(() => setFetchError(true));
      }
    }
  }, [paramId]);

  useEffect(() => {
    const viajeId = viaje?.id;
    if (!viajeId || !isAuthenticated) {
      setEsFavorito(false);
      return;
    }
    FavoritosService.listarIds()
      .then((ids) => setEsFavorito(ids.includes(viajeId)))
      .catch(() => {});
  }, [viaje?.id]);

  if (fetchError) {
    navigate("/destinos");
    return null;
  }

  if (!viaje) {
    if (!paramId) {
      navigate("/destinos");
      return null;
    }
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  const {
    nombre, precio, cuposDisponibles, totalAsientos, personasPorViaje,
    imagenUrl, fechaSalida, duracionDias, rating, descripcionCorta,
  } = viaje as ViajeData;

  const galeriaExtra = Array.isArray(viaje.galeria) && viaje.galeria.length > 0
    ? viaje.galeria
    : GALERIA_FALLBACK;
  const incluidos    = Array.isArray(viaje.incluidos) && viaje.incluidos.length > 0
    ? viaje.incluidos
    : INCLUIDOS_FALLBACK;
  const garantias    = Array.isArray(viaje.garantias) && viaje.garantias.length > 0
    ? viaje.garantias
    : GARANTIAS_FALLBACK;

  const galeria        = [imagenUrl, ...galeriaExtra];
  const cuposBajos     = cuposDisponibles <= 5;
  const total          = precio * personas;
  const totalRef       = totalAsientos && totalAsientos > 0 ? totalAsientos : Math.max(cuposDisponibles, 1);
  const pctDisponible  = Math.min((cuposDisponibles / totalRef) * 100, 100);
  const maxPersonas    = Math.min(cuposDisponibles, personasPorViaje);

  const handleReservar = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setModalAbierto(true);
    setErrorMsg(null);
  };

  const handleToggleFavorito = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const viajeId = viaje?.id ?? (paramId ? parseInt(paramId, 10) : 0);
    if (!viajeId) return;

    setFavLoading(true);
    const previo = esFavorito;
    setEsFavorito(!previo);
    try {
      if (previo) {
        await FavoritosService.eliminar(viajeId);
        setFavMsg("Eliminado de favoritos");
      } else {
        await FavoritosService.agregar(viajeId);
        setFavMsg("Agregado a favoritos");
      }
      setTimeout(() => setFavMsg(null), 2200);
    } catch {
      setEsFavorito(previo);
      setFavMsg("No pudimos actualizar tus favoritos");
      setTimeout(() => setFavMsg(null), 2500);
    } finally {
      setFavLoading(false);
    }
  };

  const confirmarReserva = async () => {
    if (!viaje?.id && !paramId) {
      setErrorMsg("No se puede identificar el viaje. Volvé al catálogo y seleccionalo de nuevo.");
      return;
    }
    setCargando(true);
    setErrorMsg(null);
    try {
      const viajeId = viaje?.id ?? (paramId ? parseInt(paramId, 10) : 0);
      const { url } = await ReservasService.crear(viajeId, personas);
      if (!url) {
        setErrorMsg("No pudimos iniciar el pago. Intentá de nuevo.");
        return;
      }
      window.location.href = url;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMsg(msg ?? "Ocurrió un error al crear la reserva. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
    <div className="bg-white min-h-screen pb-16">

      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate("/")}         className="hover:text-orange-600 transition">Inicio</button>
          <span className="text-gray-300">/</span>
          <button onClick={() => navigate("/destinos")} className="hover:text-orange-600 transition">Destinos</button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 truncate max-w-xs">{nombre}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-600 transition lg:hidden"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_290px] gap-10 items-start">

          {/* ─── Galería ─── */}
          <div className="space-y-3 lg:sticky lg:top-24">
            <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
              <img
                src={galeria[imgActiva]}
                alt={nombre}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {galeria.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgActiva(i)}
                  className={`rounded-md overflow-hidden aspect-square transition ${
                    i === imgActiva
                      ? "ring-2 ring-orange-400 ring-offset-1"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ─── Información ─── */}
          <div className="space-y-7">

            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="border border-orange-200 text-orange-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Top selección
              </span>
              <span className="text-gray-400 flex items-center gap-1">
                <Plane className="w-3 h-3" />
                +124 viajeros este mes
              </span>
            </div>

            <h1 className="text-3xl font-semibold text-gray-900 leading-tight tracking-tight">{nombre}</h1>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700">{rating}</span>
              <span className="text-sm text-gray-400">(124 reseñas)</span>
            </div>

            <div className="border-y border-orange-100/60 py-5 bg-orange-50/40 -mx-2 px-4 rounded-lg">
              <p className="text-[10px] text-orange-500 uppercase tracking-widest mb-1">Precio por persona</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-semibold text-orange-600 tracking-tight">${precio}</p>
                <p className="text-base text-orange-400 mb-1">MXN</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">IVA incluido</p>

              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                3 mensualidades sin interés de ${Math.round(precio / 3)} MXN
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-2 uppercase tracking-wider text-[11px]">Sobre este destino</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{descripcionCorta}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Lo que necesitas saber</h2>
              <ul className="space-y-2">
                {incluidos.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Características del viaje</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Clock,        label: "Duración",   valor: `${duracionDias} días` },
                  { icon: CalendarDays, label: "Salida",     valor: fechaSalida },
                  { icon: Users,        label: "Personas",   valor: `Hasta ${personasPorViaje} por reserva` },
                  { icon: MapPin,       label: "Cupos",      valor: cuposDisponibles <= 5 ? `Solo ${cuposDisponibles} disponibles` : `${cuposDisponibles} disponibles` },
                ].map(({ icon: Icon, label, valor }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3">
                    <Icon className="w-4 h-4 text-orange-500 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
                      <p className="text-sm text-gray-800">{valor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
              {garantias.map(({ icon, titulo, desc }) => {
                const Icon = ICONOS_GARANTIA[icon] ?? Shield;
                return (
                  <div key={titulo} className="flex items-start gap-2.5 text-sm">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-gray-800">{titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Panel de compra ─── */}
          <div className="space-y-4 lg:sticky lg:top-24">

            <div className="bg-white rounded-xl border border-orange-200 p-5 space-y-5 shadow-sm shadow-orange-500/5">

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 -m-5 mb-0 px-5 py-4 rounded-t-xl text-white">
                <p className="text-[10px] text-orange-100 uppercase tracking-widest">Mejor precio</p>
                <p className="text-white text-3xl font-semibold mt-1 tracking-tight">
                  ${precio} <span className="text-sm font-normal text-orange-100">MXN</span>
                </p>
                <p className="text-orange-100 text-xs mt-1">por persona · IVA incluido</p>
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Disponibilidad</span>
                  <span className={cuposBajos ? "text-red-600" : "text-green-700"}>
                    {cuposBajos ? `Solo ${cuposDisponibles} cupos` : `${cuposDisponibles} cupos`}
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cuposBajos ? "bg-red-400" : "bg-green-500"}`}
                    style={{ width: `${pctDisponible}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-600">Personas</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPersonas(Math.max(1, personas - 1))}
                    className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-600 transition text-base leading-none"
                  >−</button>
                  <span className="text-sm w-5 text-center">{personas}</span>
                  <button
                    onClick={() => setPersonas(Math.min(maxPersonas, personas + 1))}
                    className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-600 transition text-base leading-none"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5">
                <span className="text-gray-600">
                  Total <span className="text-gray-400">({personas} {personas === 1 ? "persona" : "personas"})</span>
                </span>
                <span className="font-semibold text-orange-600 text-lg">${total} MXN</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleReservar}
                  disabled={cuposDisponibles === 0}
                  className="w-full py-3 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4" />
                  {cuposDisponibles === 0 ? "Sin cupos disponibles" : "Reservar"}
                </button>
                <button
                  onClick={handleToggleFavorito}
                  disabled={favLoading}
                  className={`w-full py-3 rounded-full border transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 ${
                    esFavorito
                      ? "border-orange-300 bg-orange-50 text-orange-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${esFavorito ? "fill-orange-500 text-orange-500" : ""}`} />
                  {esFavorito ? "En tus favoritos" : "Agregar a favoritos"}
                </button>
                {favMsg && (
                  <p className="text-xs text-center text-orange-500">{favMsg}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                <Plane className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  TuViaje Oficial <BadgeCheck className="w-3.5 h-3.5 text-orange-500" />
                </p>
                <p className="text-xs text-gray-400">+500 viajes realizados</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Modal de confirmación */}
    {modalAbierto && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">

          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-gray-900 font-medium text-base tracking-tight">Confirmar reserva</h2>
            {!cargando && (
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <img src={imagenUrl} alt={nombre} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm leading-tight">{nombre}</p>
                <p className="text-xs text-gray-400 mt-1">{fechaSalida} · {duracionDias} días</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Personas</span>
                <span className="text-gray-800">{personas}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Precio por persona</span>
                <span className="text-gray-800">${precio} MXN</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-3">
                <span>Total</span>
                <span>${total} MXN</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Te redirigiremos a Stripe Checkout para completar el pago de forma segura.
              La reserva quedará confirmada cuando el pago se acredite.
            </p>

            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{errorMsg}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                disabled={cargando}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReserva}
                disabled={cargando}
                className="flex-1 py-2.5 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {cargando ? "Redirigiendo..." : "Pagar con Stripe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
