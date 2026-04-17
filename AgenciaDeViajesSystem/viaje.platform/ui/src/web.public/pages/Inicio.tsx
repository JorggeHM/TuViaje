/**
 * Inicio.tsx — Página de inicio (ruta: /)
 *
 * Es la página principal de la aplicación. Muestra contenido estático
 * pensado para convertir visitantes en clientes.
 *
 * Secciones (en orden):
 *   1. Destinos populares  — 3 tarjetas estáticas con imagen, precio y rating
 *   2. ¿Por qué elegirnos? — 4 tarjetas de beneficios con íconos
 *   3. Cómo funciona       — 3 pasos numerados
 *   4. Testimonios         — 3 reseñas de clientes con avatar
 *   5. CTA final           — Banner naranja con botones de acción
 *   6. ChatFloat           — Botón flotante de soporte (esquina inferior derecha)
 *
 * NOTA: Los destinos en esta página son ESTÁTICOS (hardcoded).
 * Los destinos reales de la API se muestran en Destinos.tsx.
 * Las tarjetas usan TravelCard → al hacer clic navegan a /viaje/detalle.
 */
import { Plane, Shield, HeadphonesIcon, Tag, Star, ArrowRight, MapPin, Clock, Users } from "lucide-react";
import ChatFloat from "../../components/ChatFloat";

const destinosDestacados = [
  {
    nombre: "Cancún, México",
    imagen: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=800&q=80",
    precio: 850,
    duracion: "7 días",
    rating: 4.9,
    tag: "Más popular",
  },
  {
    nombre: "Medellín, Colombia",
    imagen: "https://images.unsplash.com/photo-1599230930997-69bcd9ee49dd?auto=format&fit=crop&w=800&q=80",
    precio: 620,
    duracion: "5 días",
    rating: 4.8,
    tag: "Oferta",
  },
  {
    nombre: "La Habana, Cuba",
    imagen: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=800&q=80",
    precio: 790,
    duracion: "6 días",
    rating: 4.7,
    tag: "Nuevo",
  },
];

const razones = [
  {
    icon: Shield,
    titulo: "Viaja con seguridad",
    desc: "Todos nuestros paquetes incluyen seguro de viaje y asistencia en carretera durante las 24 horas.",
  },
  {
    icon: Tag,
    titulo: "Mejores precios",
    desc: "Negociamos directamente con hoteles y aerolíneas para darte tarifas que no encontrarás en otro lado.",
  },
  {
    icon: HeadphonesIcon,
    titulo: "Soporte 24/7",
    desc: "Nuestro equipo está disponible todo el día para ayudarte antes, durante y después de tu viaje.",
  },
  {
    icon: Plane,
    titulo: "Todo incluido",
    desc: "Vuelos, hotel, traslados y excursiones en un solo paquete. Solo preocúpate por hacer la maleta.",
  },
];

const pasos = [
  {
    numero: "01",
    titulo: "Elige tu destino",
    desc: "Explora nuestra amplia selección de destinos y encuentra el que más se adapte a tus sueños.",
  },
  {
    numero: "02",
    titulo: "Reserva en minutos",
    desc: "Selecciona fechas, completa tu información y confirma tu reserva de forma rápida y segura.",
  },
  {
    numero: "03",
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
    rating: 5,
  },
  {
    nombre: "Carlos Rodríguez",
    destino: "La Habana, Cuba",
    texto: "El precio fue justo y el servicio al cliente de primera. Me ayudaron con cada detalle del viaje.",
    avatar: "CR",
    rating: 5,
  },
  {
    nombre: "Sofía López",
    destino: "Medellín, Colombia",
    texto: "Nunca pensé que organizar un viaje podía ser tan fácil. Todo listo en minutos. 100% recomendado.",
    avatar: "SL",
    rating: 5,
  },
];

function Inicio() {
  return (
    <div className="bg-white">

      {/* ── Destinos Destacados ── */}
      <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Explora</span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">Destinos más populares</h2>
            <p className="text-gray-400 text-sm mt-1">Los favoritos de nuestros viajeros este mes</p>
          </div>
          <a
            href="/destinos"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinosDestacados.map((dest) => (
            <article
              key={dest.nombre}
              className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={dest.imagen}
                  alt={dest.nombre}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow">
                  {dest.tag}
                </span>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-semibold">
                  <MapPin className="w-3 h-3" />
                  {dest.nombre}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dest.duracion}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />Cualquier grupo</span>
                  </div>
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />{dest.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Desde</p>
                    <p className="text-2xl font-black text-orange-600">${dest.precio} <span className="text-xs font-normal text-gray-400">USD</span></p>
                  </div>
                  <a
                    href="/destinos"
                    className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 transition shadow-md shadow-orange-900/20"
                  >
                    Reservar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <a href="/destinos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600">
            Ver todos los destinos <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── Por qué elegirnos ── */}
      <section className="py-16 px-6 lg:px-16 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Beneficios</span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">¿Por qué elegirnos?</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              Más de 10 años conectando viajeros con destinos increíbles alrededor del mundo.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {razones.map(({ icon: Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition group"
              >
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500 shadow-md shadow-orange-900/20 group-hover:scale-110 transition">
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Proceso</span>
          <h2 className="text-3xl font-black text-gray-900 mt-1">¿Cómo funciona?</h2>
          <p className="text-gray-400 text-sm mt-2">Reserva tu viaje en 3 simples pasos</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Línea conectora desktop */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-orange-200" />

          {pasos.map(({ numero, titulo, desc }, i) => (
            <div key={numero} className="text-center relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-600 text-white font-black text-2xl shadow-lg shadow-orange-900/20 mb-5 relative z-10">
                {numero}
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{titulo}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="py-16 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Opiniones</span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">Lo que dicen nuestros viajeros</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonios.map(({ nombre, destino, texto, avatar, rating }) => (
              <div key={nombre} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{nombre}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
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
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative bg-gradient-to-br from-orange-700 to-orange-500 text-white text-center px-8 py-16 shadow-xl shadow-orange-900/30">
          {/* Círculos decorativos */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10" />

          <div className="relative z-10">
            <Plane className="w-12 h-12 mx-auto mb-4 opacity-90" strokeWidth={1.5} />
            <h2 className="text-3xl font-black mb-3">¿Listo para tu próxima aventura?</h2>
            <p className="text-orange-100 text-base mb-8 max-w-md mx-auto">
              Únete a más de 1,500 viajeros que ya confiaron en nosotros. Tu destino soñado está a un clic de distancia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/destinos"
                className="rounded-xl bg-white text-orange-600 px-8 py-3 font-bold text-sm hover:bg-orange-50 transition shadow-lg"
              >
                Explorar destinos
              </a>
              <a
                href="/register"
                className="rounded-xl border-2 border-white/60 text-white px-8 py-3 font-bold text-sm hover:bg-white/15 transition"
              >
                Crear cuenta gratis
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Inicio;
