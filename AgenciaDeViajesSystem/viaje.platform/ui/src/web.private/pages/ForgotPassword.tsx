import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Plane, ArrowLeft } from "lucide-react";
import AuthService from "../../infrastructure/services/auth.service";

function ForgotPassword() {
  const [email,    setEmail]    = useState("");
  const [error,    setError]    = useState("");
  const [mensaje,  setMensaje]  = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const data = await AuthService.forgotPassword(email);
      setMensaje(data?.message ?? "Si el email está registrado, te enviamos un enlace para restablecer la contraseña.");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "No pudimos procesar la solicitud");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center bg-white px-6 py-14">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-center gap-2 mb-10">
          <Plane className="w-4 h-4 text-orange-500" />
          <span className="font-semibold tracking-tight text-base text-gray-900">TuViaje</span>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">¿Olvidaste tu contraseña?</h2>
          <p className="text-gray-500 text-sm mt-2">
            Ingresá tu email y te enviaremos un enlace para crear una nueva.
          </p>
        </div>

        {mensaje && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
            {mensaje}
          </div>
        )}

        {error && !mensaje && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
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
                disabled={!!mensaje}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-400 focus:outline-none transition text-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando || !!mensaje}
            className="w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cargando ? "Enviando..." : mensaje ? "Enlace enviado" : "Enviar enlace"}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
