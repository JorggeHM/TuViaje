function SobreNosotros() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 text-center mb-12">
          Sobre Nosotros
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Sobre Nosotros */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">¿Quiénes somos?</h2>
            <p className="text-slate-600 leading-relaxed">
              TuViaje es una agencia de viajes especializada en experiencias únicas y memorables.
              Desde 2010, hemos ayudado a miles de viajeros a descubrir los destinos más
              fascinantes del mundo. Nuestro equipo de expertos en viajes se dedica a crear
              itinerarios personalizados que se adaptan a tus necesidades y presupuesto,
              asegurando que cada viaje sea inolvidable.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">Contacto</h2>
            <div className="space-y-3 text-slate-600">
              <p>
                <strong>Dirección:</strong> Calle Principal 123, Ciudad Turística, País
              </p>
              <p>
                <strong>Teléfono:</strong> +1 (555) 123-4567
              </p>
              <p>
                <strong>Email:</strong> info@tuViaje.com
              </p>
              <p>
                <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Política de Privacidad */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">Política de Privacidad</h2>
            <p className="text-slate-600 leading-relaxed">
              En TuViaje, valoramos tu privacidad y nos comprometemos a proteger tu información
              personal. Recopilamos datos únicamente para mejorar nuestros servicios y procesar
              tus reservas. Nunca compartimos tu información con terceros sin tu consentimiento
              explícito. Utilizamos medidas de seguridad avanzadas para proteger tus datos y
              cumplimos con todas las regulaciones de protección de datos aplicables.
            </p>
          </div>

          {/* Términos y Condiciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">Términos y Condiciones</h2>
            <p className="text-slate-600 leading-relaxed">
              Al utilizar nuestros servicios, aceptas estos términos y condiciones. Nos reservamos
              el derecho de modificar precios y disponibilidad sin previo aviso. Las cancelaciones
              deben realizarse con al menos 48 horas de anticipación. TuViaje no se hace responsable
              por cambios en itinerarios debido a condiciones climáticas o eventos imprevistos.
              Todos los pagos son procesados de manera segura y son reembolsables según nuestra
              política de cancelación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SobreNosotros