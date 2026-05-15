/**
 * AboutUs.tsx — Página "Sobre Nosotros" (ruta: /nosotros)
 */
import { useEffect, useState } from "react";
import Card from "../../components/InfoCard";
import { Mail, Shield, Heart, Star, Plane, Target, FileText, Users, MapPin, Trophy, Award, Globe2, BadgeCheck } from "lucide-react";
import StatsService, { formatearMiles } from "../../infrastructure/services/stats.service";
import type { StatsPublicas } from "../../infrastructure/services/stats.service";

const certificaciones = [
  { icon: BadgeCheck, label: "Certificación IATA",            desc: "Operador acreditado" },
  { icon: Award,      label: "Premio TripAdvisor 2024",       desc: "Excelencia en servicio" },
  { icon: Globe2,     label: "Miembro SkyTeam Travel",        desc: "Red global de aerolíneas" },
];

export default function AboutTravelPage() {
  const [stats, setStats] = useState<StatsPublicas | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    StatsService.obtener()
      .then(setStats)
      .finally(() => setCargando(false));
  }, []);

  const items = [
    { valor: stats ? `+${formatearMiles(stats.viajes_realizados)}`  : null, label: "Reservas gestionadas",  icon: Plane },
    { valor: stats ? `+${formatearMiles(stats.personas_viajeras)}`  : null, label: "Clientes atendidos",    icon: Users },
    { valor: stats ? `+${stats.ciudades_visitadas}`                 : null, label: "Destinos en cartera",   icon: MapPin },
    { valor: stats ? `${stats.satisfaccion}%`                       : null, label: "Índice de satisfacción", icon: Trophy },
  ];

  return (
    <div className="bg-white">

      {/* ── Intro corporativa ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold">Quiénes somos</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-[1.1] tracking-tight mt-3">
            Una agencia comprometida con el<br />
            <span className="text-orange-500 italic font-normal">viajero moderno</span>
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-md mt-5">
            Fundada en 2014, TuViaje es una agencia de turismo internacional que diseña, opera y comercializa
            paquetes de viaje a medida. Combinamos infraestructura tecnológica propia con un equipo de asesores
            certificados para garantizar la trazabilidad de cada reserva, la transparencia tarifaria y la asistencia
            permanente durante el desplazamiento del cliente.
          </p>
          <div className="flex gap-3 mt-8">
            <a href="/destinos" className="rounded-full bg-orange-500 text-white px-6 py-2.5 text-sm font-medium hover:bg-orange-600 transition shadow-sm shadow-orange-500/20">
              Ver catálogo
            </a>
            <a href="#contacto" className="rounded-full border border-orange-200 text-orange-600 px-6 py-2.5 text-sm font-medium hover:bg-orange-50 transition">
              Contactar al equipo
            </a>
          </div>
        </div>

        <div className="hidden md:flex justify-center">
          <div className="w-full max-w-sm aspect-square rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Plane className="w-16 h-16 text-white/90" strokeWidth={1.2} />
          </div>
        </div>
      </section>

      {/* ── Misión y Visión ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <Card
          icon={Target}
          title="Misión"
          description="Facilitar el acceso al turismo internacional mediante una operación segura, transparente y orientada al cliente, asegurando estándares profesionales en cada etapa del viaje: desde la planificación hasta el regreso."
          accent
        />
        <Card
          icon={Star}
          title="Visión"
          description="Consolidarnos como agencia de referencia en Latinoamérica para el segmento de turismo internacional, distinguidos por la innovación tecnológica, la calidad operativa y un compromiso firme con el turismo responsable."
          accent
        />
      </section>

      {/* ── Indicadores de gestión ── */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white mb-10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-orange-100">Resultados</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">Indicadores de gestión</h2>
            <p className="text-orange-50 text-sm mt-2 max-w-md mx-auto">
              Cifras consolidadas a partir de operaciones realizadas durante los últimos 12 meses.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map(({ valor, label, icon: Icon }) => (
              <div key={label} className="text-center text-white">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm mb-3">
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.6} />
                </div>
                {cargando || valor === null ? (
                  <div className="h-9 w-20 mx-auto rounded bg-white/20 animate-pulse" />
                ) : (
                  <p className="text-3xl font-semibold tracking-tight">{valor}</p>
                )}
                <p className="text-orange-50 text-xs mt-2 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pilares operativos ── */}
      <section className="py-20 px-6 bg-orange-50/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold">Principios rectores</span>
            <h2 className="text-3xl font-semibold text-gray-900 mt-2 tracking-tight">Pilares operativos</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-lg mx-auto">
              Los valores que orientan nuestra operación diaria y la relación con cada uno de nuestros clientes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card
              icon={Shield}
              title="Seguridad operacional"
              description="Todos los paquetes incluyen pólizas de asistencia médica internacional y cobertura ante imprevistos. Operamos exclusivamente con proveedores auditados y certificados localmente."
            />
            <Card
              icon={Heart}
              title="Transparencia"
              description="Tarifas finales sin cargos ocultos, condiciones claras de cancelación y un sistema de seguimiento online que permite consultar el estado de cualquier reserva en tiempo real."
            />
            <Card
              icon={Star}
              title="Excelencia en servicio"
              description="Asesoría personalizada antes, durante y después del viaje. Tiempo medio de respuesta inferior a 30 minutos y soporte 24/7 los 365 días del año."
            />
          </div>
        </div>
      </section>

      {/* ── Certificaciones y reconocimientos ── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold">Acreditaciones</span>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2 tracking-tight">Certificaciones y reconocimientos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {certificaciones.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto y términos ── */}
      <section id="contacto" className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <Card
            icon={Mail}
            title="Atención al cliente"
            description="Para consultas comerciales, gestión de reservas o asistencia durante un viaje, escríbanos a soporte@tuviaje.com o comuníquese al +52 800 000 0000. Disponibilidad de lunes a domingo, 24 horas."
          />
          <Card
            icon={FileText}
            title="Términos y condiciones"
            description="Consulte la documentación legal vigente para conocer las políticas de reserva, cancelación, modificación y reembolso. Operamos bajo normativa internacional de turismo y protección al consumidor."
          />
        </div>
      </section>

    </div>
  );
}
