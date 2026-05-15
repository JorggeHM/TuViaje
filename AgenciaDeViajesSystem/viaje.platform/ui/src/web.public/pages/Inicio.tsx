//importacion de componentes usados en la pagina
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plane, Shield, HeadphonesIcon, Tag, Star, ArrowRight, MapPin } from "lucide-react";
import ChatFloat from "../../components/ChatFloat";
import TravelCard from "../../components/TravelCard";
import ViajesService from "../../infrastructure/services/viajes.service";
import type { Viaje } from "../../infrastructure/services/viajes.service";
import { useAuth } from "../../infrastructure/auth/AuthContext";

//Declaracion de estructuras de informacion 

//La interfaz de cada componente recibe la estructura de la informacion
const razones = [
  {
    icon: Shield,
    color: "bg-orange-100 text-orange-600",
    titulo: "Viaja con seguridad",
    desc: "Todos nuestros paquetes incluyen seguro de viaje y asistencia en carretera durante las 24 horas.",
  },
  {
    icon: Tag,
    color: "bg-amber-100 text-amber-700",
    titulo: "Mejores precios",
    desc: "Negociamos directamente con hoteles y aerolíneas para darte tarifas que no encontrarás en otro lado.",
  },
  {
    icon: HeadphonesIcon,
    color: "bg-orange-200 text-orange-700",
    titulo: "Soporte 24/7",
    desc: "Nuestro equipo está disponible todo el día para ayudarte antes, durante y después de tu viaje.",
  },
  {
    icon: Plane,
    color: "bg-orange-50 text-orange-500 border border-orange-200",
    titulo: "Todo incluido",
    desc: "Vuelos, hotel, traslados y excursiones en un solo paquete. Solo preocúpate por hacer la maleta.",
  },
];

const pasos = [
  {
    numero: "01",
    color: "bg-orange-400 text-white shadow-orange-400/30",
    titulo: "Elige tu destino",
    desc: "Explora nuestra amplia selección de destinos y encuentra el que más se adapte a tus sueños.",
  },
  {
    numero: "02",
    color: "bg-orange-500 text-white shadow-orange-500/30",
    titulo: "Reserva en minutos",
    desc: "Selecciona fechas, completa tu información y confirma tu reserva de forma rápida y segura.",
  },
  {
    numero: "03",
    color: "bg-orange-600 text-white shadow-orange-600/30",
    titulo: "¡Disfruta tu viaje!",
    desc: "Nosotros nos encargamos de todo. Tú solo enfócate en vivir la experiencia de tu vida.",
  },
];

const testimonios = [
  {
    nombre: "Andrea Martínez",
    destino: "Cancún, México",
    texto: "Increíble experiencia. Todo estuvo perfecto desde el vuelo hasta el hotel. Sin duda volvería a reservar con TuViaje.",
    avatar: "AM",
    color: "bg-gradient-to-br from-amber-400 to-orange-500",
    rating: 5,
  },
  {
    nombre: "Carlos Rodríguez",
    destino: "La Habana, Cuba",
    texto: "El precio fue justo y el servicio al cliente de primera. Me ayudaron con cada detalle del viaje.",
    avatar: "CR",
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    rating: 5,
  },
  {
    nombre: "Sofía López",
    destino: "Medellín, Colombia",
    texto: "Nunca pensé que organizar un viaje podía ser tan fácil. Todo listo en minutos. 100% recomendado.",
    avatar: "SL",
    color: "bg-gradient-to-br from-amber-500 to-orange-700",
    rating: 5,
  },
];

//Funcion principal

function Inicio() {
  const [destinos, setDestinos] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const { isAuthenticated: estaLogueado } = useAuth();

  useEffect(() => {
    ViajesService.listar()
      .then((viajes) => {
        const mezclados = [...viajes].sort(() => Math.random() - 0.5);
        setDestinos(mezclados.slice(0, 3));
      })
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="bg-white">

      {/* ── Destinos Destacados ── */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              Explora
            </span>
            <h2 className="text-3xl font-semibold text-gray-900 mt-3 tracking-tight">Destinos destacados</h2>
            <p className="text-gray-500 text-sm mt-2">Una selección aleatoria de nuestro catálogo</p>
          </div>
          <Link
            to="/destinos"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 transition"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {cargando && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-100 h-[380px] animate-pulse" />
            ))}
          </div>
        )}

        {!cargando && destinos.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-gray-100">
            <Plane className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.2} />
            <p className="text-gray-600 mb-2">Aún no hay destinos disponibles</p>
            <Link to="/destinos" className="text-sm text-orange-600 hover:text-orange-700">
              Explorar catálogo →
            </Link>
          </div>
        )}

        {!cargando && destinos.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinos.map((viaje) => (
              <TravelCard
                key={viaje.id}
                id={viaje.id}
                nombre={viaje.title}
                precio={viaje.price}
                cuposDisponibles={viaje.available_seats}
                totalAsientos={viaje.available_seats + (viaje.total_ventas ?? 0)}
                personasPorViaje={2}
                descripcionCorta={viaje.description}
                fechaSalida={viaje.start_date}
                duracionDias={viaje.duracion_dias}
                rating={viaje.rating}
                imagenUrl={viaje.imagen_url}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link to="/destinos" className="inline-flex items-center gap-1.5 text-sm text-orange-600">
            Ver todos los destinos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Por qué elegirnos ── */}
      <section className="py-20 px-6 lg:px-16 bg-orange-50/60 border-y border-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-orange-600">Beneficios</span>
            <h2 className="text-3xl font-semibold text-gray-900 mt-2 tracking-tight">¿Por qué elegirnos?</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto">
              Más de 10 años conectando viajeros con destinos increíbles alrededor del mundo.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {razones.map(({ icon: Icon, color, titulo, desc }) => (
              <div
                key={titulo}
                className="bg-white p-7 rounded-2xl border border-orange-100/70 hover:border-orange-300 hover:-translate-y-0.5 transition shadow-sm"
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${color} mb-5`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-orange-600">Proceso</span>
          <h2 className="text-3xl font-semibold text-gray-900 mt-2 tracking-tight">¿Cómo funciona?</h2>
          <p className="text-gray-500 text-sm mt-3">Reserva tu viaje en 3 simples pasos</p>
        </div>
        <div className="grid gap-12 md:grid-cols-3 relative">
          <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-px bg-orange-200" />

          {pasos.map(({ numero, color, titulo, desc }) => (
            <div key={numero} className="text-center relative">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full font-bold text-base mb-5 relative z-10 shadow-lg ${color}`}>
                {numero}
              </div>
              <h3 className="font-semibold text-gray-900 text-base mb-2">{titulo}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="py-20 px-6 lg:px-16 bg-gradient-to-b from-white to-orange-50/40 border-t border-orange-100/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-orange-600">Opiniones</span>
            <h2 className="text-3xl font-semibold text-gray-900 mt-2 tracking-tight">Lo que dicen nuestros viajeros</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonios.map(({ nombre, destino, texto, avatar, color, rating }) => (
              <div key={nombre} className="bg-white rounded-2xl p-7 border border-orange-100/60 hover:border-orange-200 hover:-translate-y-0.5 transition shadow-sm">
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{texto}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-xs font-semibold shadow-md`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{nombre}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{destino}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatFloat />

      {/* ── CTA final ── */}
      <section className="py-20 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white px-10 py-16 text-center">
          <Plane className="w-9 h-9 mx-auto mb-6 text-white/90" strokeWidth={1.3} />
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4 tracking-tight">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-orange-50 text-base mb-10 max-w-md mx-auto leading-relaxed">
            Únete a más de 1,500 viajeros que ya confiaron en nosotros. Tu destino soñado está a un clic de distancia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/destinos"
              className="rounded-full bg-white text-orange-600 px-8 py-3 font-medium text-sm hover:bg-orange-50 transition"
            >
              Explorar destinos
            </Link>
            <Link
              to={estaLogueado ? "/perfil" : "/register"}
              className="rounded-full border border-white/60 text-white px-8 py-3 font-medium text-sm hover:bg-white/10 transition"
            >
              {estaLogueado ? "Ir a mi perfil" : "Crear cuenta gratis"}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Inicio;
