import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock, Plane } from "lucide-react";
import { useAuth } from "../../infrastructure/auth/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
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
      await register(email, password, name);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error al registrarse");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50/40 px-6 py-14">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-orange-100 p-8 shadow-sm shadow-orange-500/5">

        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-500 text-white">
            <Plane className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold tracking-tight text-base text-gray-900">TuViaje</span>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Crea tu cuenta</h2>
          <p className="text-gray-500 text-sm mt-2">Únete y empieza a explorar el mundo</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-400 focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-400 focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-400 focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cargando ? "Registrando..." : "Registrarme"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">o</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition"
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
  );
}

export default Register;
