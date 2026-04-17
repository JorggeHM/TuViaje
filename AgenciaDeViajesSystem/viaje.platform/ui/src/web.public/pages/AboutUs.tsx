/**
 * AboutUs.tsx — Página "Sobre Nosotros" (ruta: /nosotros)
 *
 * Presenta la identidad, valores y datos de contacto de la empresa.
 * Usa el componente InfoCard para mostrar las secciones de contenido.
 *
 * Estructura de la página:
 *   1. Hero naranja   — Título, descripción y botones de acción
 *   2. Misión y Visión — 2 InfoCards con accent (fondo naranja suave)
 *   3. Estadísticas   — Barra naranja con 4 métricas clave de la empresa
 *                       (única página donde aparece esta barra de stats)
 *   4. Valores        — 3 InfoCards: Seguridad, Integridad, Compromiso
 *   5. Contacto y Términos — 2 InfoCards finales
 */
import Card from "../../components/InfoCard";
import { Globe, Mail, Shield, Heart, Star, Plane, Target, FileText, Users, MapPin, Trophy } from "lucide-react";

const stats = [
  { valor: "+250", label: "Viajes realizados", icon: Plane },
  { valor: "+1,500", label: "Personas que han viajado", icon: Users },
  { valor: "+45", label: "Ciudades visitadas", icon: MapPin },
  { valor: "98%", label: "Clientes satisfechos", icon: Trophy },
];

export default function AboutTravelPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <header className="relative bg-orange-600 text-white py-20 px-6 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10" />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
              Nuestra historia
            </span>
            <h1 className="text-4xl font-black mb-4 leading-tight">
              Explora el mundo<br />con nosotros
            </h1>
            <p className="text-orange-100 text-base leading-relaxed max-w-md">
              Creamos experiencias de viaje inolvidables para aventureros, familias y empresas que desean descubrir nuevos destinos con total confianza.
            </p>
            <div className="flex gap-3 mt-7">
              <a href="/destinos" className="rounded-xl bg-white text-orange-600 px-5 py-2.5 text-sm font-bold hover:bg-orange-50 transition shadow-md">
                Ver destinos
              </a>
              <a href="#contacto" className="rounded-xl border-2 border-white/50 text-white px-5 py-2.5 text-sm font-bold hover:bg-white/15 transition">
                Contáctanos
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex items-center justify-center w-44 h-44 rounded-3xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30 shadow-2xl">
              <Globe size={90} className="text-white opacity-90" strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Misión y Visión ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <Card
          icon={Target}
          title="Nuestra Misión"
          description="Brindar experiencias de viaje accesibles, seguras y memorables conectando a las personas con destinos únicos alrededor del mundo, con atención personalizada en cada paso del camino."
          accent
        />
        <Card
          icon={Star}
          title="Nuestra Visión"
          description="Ser la agencia de viajes de referencia en Latinoamérica, reconocida por transformar sueños en experiencias reales, con innovación, confianza y pasión por el turismo responsable."
          accent
        />
      </section>

      {/* ── Estadísticas ── */}
      <section className="bg-orange-600 py-14 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ valor, label, icon: Icon }) => (
            <div key={label} className="text-center text-white">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3">
                <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <p className="text-3xl font-black">{valor}</p>
              <p className="text-orange-100 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Valores ── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Lo que nos define</span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">Nuestros Valores</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card
              icon={Shield}
              title="Seguridad"
              description="Priorizamos la seguridad de nuestros viajeros en cada destino y experiencia, con seguros y asistencia incluida."
            />
            <Card
              icon={Heart}
              title="Integridad"
              description="Mantenemos altos estándares de ética y honestidad en todas nuestras operaciones y con cada cliente."
            />
            <Card
              icon={Star}
              title="Compromiso"
              description="Nos comprometemos a ofrecer el mejor servicio y experiencia de viaje, superando las expectativas de cada cliente."
            />
          </div>
        </div>
      </section>

      {/* ── Contacto y Términos ── */}
      <section id="contacto" className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <Card
            icon={Mail}
            title="Contáctanos"
            description="Estamos aquí para ayudarte con cualquier pregunta o solicitud. Escríbenos a soporte@tviaje.com o llámanos al +52 800 000 0000, disponibles de lunes a domingo."
          />
          <Card
            icon={FileText}
            title="Términos y Condiciones"
            description="Consulta nuestros términos y condiciones para conocer las políticas de reserva, cancelación y uso de nuestros servicios. Tu tranquilidad es nuestra prioridad."
          />
        </div>
      </section>

    </div>
  );
}
