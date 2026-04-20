import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User, Mail, Lock, Save, Loader2, CheckCircle2, MapPin,
  Calendar, Plane, ChevronLeft,
} from "lucide-react";
import AuthService from "../../infrastructure/services/auth.service";
import client from "../../infrastructure/api/client";

interface Reserva {
  id:          number;
  title:       string;
  destination: string;
  start_date:  string;
  monto:       number;
  estado:      string;
  imagen_url:  string;
}

const ESTADO_COLORES: Record<string, string> = {
  Pendiente:  "bg-amber-50 text-amber-700 border-amber-200",
  Confirmada: "bg-green-50 text-green-700 border-green-200",
  Cancelada:  "bg-red-50   text-red-700   border-red-200",
};

export default function Perfil() {
  const navigate = useNavigate();
  const user     = AuthService.getUser();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!AuthService.isAuthenticated()) navigate("/login");
  }, []);

  // ── Edición de datos ───────────────────────────────────────────
  const [nombre,       setNombre]       = useState(user?.name  ?? "");
  const [email,        setEmail]        = useState(user?.email ?? "");
  const [guardando,    setGuardando]    = useState(false);
  const [exitoPerfil,  setExitoPerfil]  = useState("");
  const [errorPerfil,  setErrorPerfil]  = useState("");

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPerfil("");
    setExitoPerfil("");
    setGuardando(true);
    try {
      const res = await client.put("/api/auth/perfil", { name: nombre, email });
      // Actualizar token con los nuevos datos
      if (res.data.data?.token) {
        localStorage.setItem("token", res.data.data.token);
      }
      setExitoPerfil("Perfil actualizado correctamente.");
    } catch (err: any) {
      setErrorPerfil(err.response?.data?.message ?? "Error al actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Cambio de contraseña ───────────────────────────────────────
  const [passActual,    setPassActual]    = useState("");
  const [passNueva,     setPassNueva]     = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [exitoPass,     setExitoPass]     = useState("");
  const [errorPass,     setErrorPass]     = useState("");

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPass("");
    setExitoPass("");

    if (passNueva !== passConfirmar) {
      setErrorPass("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passNueva.length < 6) {
      setErrorPass("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setGuardandoPass(true);
    try {
      await client.put("/api/auth/password", {
        current_password: passActual,
        new_password:     passNueva,
      });
      setExitoPass("Contraseña actualizada correctamente.");
      setPassActual("");
      setPassNueva("");
      setPassConfirmar("");
    } catch (err: any) {
      setErrorPass(err.response?.data?.message ?? "Error al cambiar la contraseña.");
    } finally {
      setGuardandoPass(false);
    }
  };

  // ── Mis reservas ───────────────────────────────────────────────
  const [reservas,        setReservas]        = useState<Reserva[]>([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);

  useEffect(() => {
    client.get("/api/auth/reservas")
      .then((res) => setReservas(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setCargandoReservas(false));
  }, []);

  if (!user) return null;

  const iniciales = user.name
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-500 px-6 py-10 text-white">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-orange-200 hover:text-white text-sm mb-6 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xl">
              {iniciales}
            </div>
            <div>
              <h1 className="text-2xl font-black">{user.name}</h1>
              <p className="text-orange-200 text-sm">{user.email}</p>
              {user.rol === "admin" && (
                <span className="inline-block mt-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Editar perfil ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" /> Datos personales
          </h2>

          {exitoPerfil && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />{exitoPerfil}
            </div>
          )}
          {errorPerfil && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {errorPerfil}
            </div>
          )}

          <form onSubmit={handleGuardarPerfil} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition disabled:opacity-60"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>

        {/* ── Cambiar contraseña ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" /> Cambiar contraseña
          </h2>

          {exitoPass && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />{exitoPass}
            </div>
          )}
          {errorPass && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {errorPass}
            </div>
          )}

          <form onSubmit={handleCambiarPassword} className="space-y-4">
            {[
              { label: "Contraseña actual",  value: passActual,    setter: setPassActual },
              { label: "Nueva contraseña",   value: passNueva,     setter: setPassNueva },
              { label: "Confirmar nueva",    value: passConfirmar, setter: setPassConfirmar },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={guardandoPass}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition disabled:opacity-60"
            >
              {guardandoPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {guardandoPass ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>

        {/* ── Mis reservas ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
            <Plane className="w-5 h-5 text-orange-500" /> Mis reservas
          </h2>

          {cargandoReservas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                Aún no tenés reservas.{" "}
                <a href="/destinos" className="text-orange-500 font-semibold hover:underline">
                  ¡Explorá destinos!
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservas.map((r) => (
                <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  {r.imagen_url ? (
                    <img src={r.imagen_url} alt={r.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-5 h-5 text-orange-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{r.destination}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{r.start_date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ESTADO_COLORES[r.estado] ?? ""}`}>
                      {r.estado}
                    </span>
                    <span className="text-sm font-black text-gray-700">${Number(r.monto).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
