import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock, Plane } from "lucide-react";
import Alpaka from "/src/assets/images/alpaca.png";
import AuthService from "../../infrastructure/services/auth.service";

function Register() {
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await AuthService.register(email, password, name);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error al registrarse");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-130px)]">

      {/* ── Panel izquierdo: formulario ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-14 md:order-1">
        <div className="w-full max-w-sm">

          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100">
              <Plane className="w-4 h-4 text-orange-600" />
            </span>
            <span className="font-black text-xl text-orange-600">TuViaje</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900">Crea tu cuenta</h2>
            <p className="text-gray-400 text-sm mt-1">Únete y empieza a explorar el mundo</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="nombre"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-900/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Registrando..." : "Registrarme ahora"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">o</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-600 font-bold text-sm hover:bg-orange-50 transition"
            >
              Ya tengo una cuenta
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Al registrarte, aceptas nuestros{" "}
            <a href="#" className="text-orange-500 hover:underline">Términos y Condiciones</a>
          </p>
        </div>
      </div>

      {/* ── Panel derecho: naranja ── */}
      <div className="hidden md:flex md:w-5/12 lg:w-2/5 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-bl from-orange-700 to-orange-500 px-10 py-16 md:order-2">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute top-1/2 -left-10 w-48 h-48 rounded-full bg-white/10" />

        <div className="relative z-10 text-center text-white flex flex-col items-center">
          <div className="mb-5 flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
            <Plane className="w-9 h-9 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-1">TuViaje</h1>
          <p className="text-orange-100 font-medium text-base mb-1">Empieza tu aventura hoy</p>
          <p className="text-orange-200 text-sm max-w-xs leading-relaxed">
            Regístrate gratis y accede a cientos de destinos increíbles con los mejores precios.
          </p>
          <div className="mt-8 space-y-3 text-left w-full max-w-xs">
            {[
              "Acceso a más de 250 destinos",
              "Precios exclusivos para miembros",
              "Soporte 24/7 en tu idioma",
              "Cancelación sin costo adicional",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-white text-xs font-bold">✓</span>
                <span className="text-orange-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <img src={Alpaka} alt="Mascota TuViaje" className="mx-auto h-44 object-contain drop-shadow-2xl" />
            <p className="text-orange-200 text-xs mt-2">Tu compañero de viaje te espera</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
