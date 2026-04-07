import React from "react";
import Card from "../../components/InfoCard";
import { Mail, Phone, Globe, ShieldCheck } from "lucide-react";

export default function AboutTravelPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER NARANJA CON LOGO */}
      <header className="bg-linear-to-r from-orange-500 to-orange-600 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Explora el Mundo con Nosotros
            </h1>
            <p className="text-lg opacity-90">
              Creamos experiencias de viaje inolvidables para aventureros,
              familias y empresas que desean descubrir nuevos destinos.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white/20 rounded-3xl p-8 backdrop-blur-sm">
              {/*iiCONO DE GLOBO */}
              <Globe size={120} />
            </div>
          </div>
        </div>
      </header>

      {/* Mision Vision */}
      <section className="-mt-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Mision card */}
          <Card
            title="Nuestra Misión"
            description="Brindar experiencias de viaje accesibles, seguras y memorables conectando a las personas con destinos únicos alrededor del mundo."
          />
                {/* Vision card */}
              <Card
            title="Nuestra Misión"
            description="Brindar experiencias de viaje accesibles, seguras y memorables conectando a las personas con destinos únicos alrededor del mundo."
          />
        </div>
      </section>

      {/* Estadisticas(Vincular con DB despues)*/}
      <section className="bg-orange-100 mt-16 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-3 text-center">
          <div>
            <h2 className="text-3xl font-bold text-orange-600">+250</h2>
            <p>Viajes Realizados</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-orange-600">+1500</h2>
            <p>Personas que Han Viajado</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-orange-600">+45</h2>
            <p>Cuidades Visitadas</p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Nuestros Valores</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card
              title="Seguridad"
              description="Priorizamos la seguridad de nuestros viajeros en cada destino y experiencia."
            />

            <Card
              title="Integridad"
              description="Mantenemos altos estándares de ética y honestidad en todas nuestras operaciones."
            />

            <Card
              title="Compromiso"
              description="Nos comprometemos a ofrecer el mejor servicio y experiencia de viaje a nuestros clientes."
            />
          </div>
        </div>
      </section>

      {/* Contacto y Terminos */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

        <Card
            title="Contáctanos"
            description="Estamos aquí para ayudarte con cualquier pregunta o solicitud de información."
          />

        <Card
            title="Terminos y Condiciones"
            description="Consulta nuestros términos y condiciones para conocer las políticas de reserva, cancelación y uso de nuestros servicios."
        />

        </div>
      </section>
    </div>
  );
}
