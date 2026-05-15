import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, Plane, ArrowLeft } from "lucide-react";
import AuthService from "../../infrastructure/services/auth.service";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [error,     setError]     = useState("");
  const [exito,     setExito]     = useState("");
  const [cargando,  setCargando]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Enlace inválido");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    try {
      await AuthService.resetPassword(token, password);
      setExito("Tu contraseña fue restablecida. Te llevamos al login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "No pudimos restablecer la contraseña");
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
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Crear nueva contraseña</h2>
          <p className="text-gray-500 text-sm mt-2">Elegí una contraseña segura de al menos 6 caracteres.</p>
        </div>

        {exito && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
            {exito}
          </div>
        )}

        {error && !exito && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
              Nueva contraseña
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
                disabled={!!exito}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-400 focus:outline-none transition text-sm disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={!!exito}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-orange-400 focus:outline-none transition text-sm disabled:bg-gray-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando || !!exito}
            className="w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cargando ? "Guardando..." : exito ? "Redirigiendo..." : "Restablecer contraseña"}
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

export default ResetPassword;
