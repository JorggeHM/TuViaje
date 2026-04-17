/**
 * Login.tsx — Página de inicio de sesión (ruta: /login)
 *
 * Diseño split-screen:
 *   - Panel izquierdo (naranja, solo desktop): logo, estadísticas, alpaca mascota
 *   - Panel derecho (blanco): formulario de login
 *
 * El formulario actualmente solo tiene estructura visual (e.preventDefault()).
 * Para conectarlo al backend, usar AuthService.login(email, password)
 * definido en infrastructure/services/auth.service.ts.
 *
 * Conexión con el backend:
 *   POST /auth/login → devuelve { token, user }
 *   El token se guarda en localStorage mediante AuthService.login()
 *   El interceptor de Axios lo adjunta automáticamente en peticiones futuras
 *
 * Navegación relacionada:
 *   "Crear una cuenta" → /register
 *   "¿Olvidaste tu contraseña?" → (pendiente de implementar)
 */
import { Mail, Lock, Plane } from "lucide-react";
import Alpaka from "/src/assets/images/alpaca.png";

function Login() {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-130px)]">

      {/* ── Panel izquierdo: naranja ── */}
      <div className="hidden md:flex md:w-5/12 lg:w-2/5 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-700 to-orange-500 px-10 py-16">

        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute top-1/2 -right-10 w-48 h-48 rounded-full bg-white/10" />

        {/* Contenido */}
        <div className="relative z-10 text-center text-white flex flex-col items-center">

          {/* Ícono de avión */}
          <div className="mb-5 flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
            <Plane className="w-9 h-9 text-white" strokeWidth={1.8} />
          </div>

          <h1 className="text-4xl font-black tracking-tight mb-1">TuViaje</h1>
          <p className="text-orange-100 font-medium text-base mb-1">Descubre el mundo con nosotros</p>
          <p className="text-orange-200 text-sm max-w-xs leading-relaxed">
            Más de 250 destinos disponibles para que vivas la aventura de tu vida.
          </p>

          {/* Estadísticas */}
          <div className="mt-8 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black">250+</p>
              <p className="text-orange-200 text-xs mt-0.5">Destinos</p>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-black">1.5K+</p>
              <p className="text-orange-200 text-xs mt-0.5">Viajeros</p>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-black">45+</p>
              <p className="text-orange-200 text-xs mt-0.5">Ciudades</p>
            </div>
          </div>

          {/* Mascota */}
          <div className="mt-10">
            <img
              src={Alpaka}
              alt="Mascota TuViaje"
              className="mx-auto h-44 object-contain drop-shadow-2xl"
            />
            <p className="text-orange-200 text-xs mt-2">Tu compañero de viaje te espera</p>
          </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-14">
        <div className="w-full max-w-sm">

          {/* Logo visible solo en mobile */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100">
              <Plane className="w-4 h-4 text-orange-600" />
            </span>
            <span className="font-black text-xl text-orange-600">TuViaje</span>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900">Bienvenido de vuelta</h2>
            <p className="text-gray-400 text-sm mt-1">Inicia sesión para continuar tu aventura</p>
          </div>

          {/* Formulario */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-orange-500 hover:text-orange-600 font-medium transition">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-900/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Iniciar sesión
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">o</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = "/register")}
              className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-600 font-bold text-sm hover:bg-orange-50 transition"
            >
              Crear una cuenta
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Al continuar, aceptas nuestros{" "}
            <a href="#" className="text-orange-500 hover:underline">
              Términos y Condiciones
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
