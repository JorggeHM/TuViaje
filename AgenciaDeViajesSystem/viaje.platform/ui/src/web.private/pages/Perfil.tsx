import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  User, Mail, Lock, Save, Loader2, CheckCircle2, MapPin,
  Calendar, Plane, ChevronLeft, Heart, X, Star, Camera, Trash2,
} from "lucide-react";
import { useAuth } from "../../infrastructure/auth/AuthContext";
import AuthService from "../../infrastructure/services/auth.service";
import FavoritosService, { type ViajeFavorito } from "../../infrastructure/services/favoritos.service";
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
  Pendiente:  "text-amber-700 border-amber-200",
  Confirmada: "text-green-700 border-green-200",
  Cancelada:  "text-red-700   border-red-200",
};

export default function Perfil() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshFromToken } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

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
      if (res.data.data?.token) {
        localStorage.setItem("token", res.data.data.token);
        refreshFromToken();
      }
      setExitoPerfil("Perfil actualizado correctamente.");
    } catch (err: any) {
      setErrorPerfil(err.response?.data?.message ?? "Error al actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

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

  const [reservas,        setReservas]        = useState<Reserva[]>([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);

  useEffect(() => {
    client.get("/api/auth/reservas")
      .then((res) => setReservas(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setCargandoReservas(false));
  }, []);

  const [favoritos,        setFavoritos]        = useState<ViajeFavorito[]>([]);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(true);

  useEffect(() => {
    FavoritosService.listar()
      .then(setFavoritos)
      .catch(() => {})
      .finally(() => setCargandoFavoritos(false));
  }, []);

  const handleQuitarFavorito = async (viajeId: number) => {
    const previo = favoritos;
    setFavoritos((prev) => prev.filter((f) => f.id !== viajeId));
    try {
      await FavoritosService.eliminar(viajeId);
    } catch {
      setFavoritos(previo);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [errorAvatar,    setErrorAvatar]    = useState("");

  const handleSeleccionarFoto = () => fileInputRef.current?.click();

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErrorAvatar("");
    setSubiendoAvatar(true);
    try {
      await AuthService.subirAvatar(file);
      refreshFromToken();
    } catch (err: any) {
      setErrorAvatar(err.response?.data?.message ?? "No se pudo subir la imagen.");
    } finally {
      setSubiendoAvatar(false);
    }
  };

  const handleEliminarFoto = async () => {
    setErrorAvatar("");
    setSubiendoAvatar(true);
    try {
      await AuthService.eliminarAvatar();
      refreshFromToken();
    } catch (err: any) {
      setErrorAvatar(err.response?.data?.message ?? "No se pudo eliminar la imagen.");
    } finally {
      setSubiendoAvatar(false);
    }
  };

  if (!user) return null;

  const iniciales = user.name
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-gradient-to-b from-orange-50/40 to-white min-h-screen pb-16">

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/40 border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-500 hover:text-orange-600 text-sm mb-6 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover shadow-md shadow-orange-500/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium text-lg shadow-md shadow-orange-500/20">
                {iniciales}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.rol === "admin" && (
                <span className="inline-block mt-1 text-[10px] border border-orange-200 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Foto de perfil */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-5 flex items-center gap-2 tracking-tight">
            <Camera className="w-4 h-4 text-orange-500" strokeWidth={1.5} /> Foto de perfil
          </h2>

          {errorAvatar && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {errorAvatar}
            </div>
          )}

          <div className="flex items-center gap-5">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border border-orange-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium text-2xl">
                {iniciales}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleArchivo}
              />
              <button
                type="button"
                onClick={handleSeleccionarFoto}
                disabled={subiendoAvatar}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition disabled:opacity-60"
              >
                {subiendoAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {user.avatar_url ? "Cambiar foto" : "Subir foto"}
              </button>
              {user.avatar_url && (
                <button
                  type="button"
                  onClick={handleEliminarFoto}
                  disabled={subiendoAvatar}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              )}
              <p className="basis-full text-xs text-gray-400 mt-1">
                Formatos JPG, PNG o WEBP. Tamaño máximo 3 MB.
              </p>
            </div>
          </div>
        </div>

        {/* Datos personales */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-5 flex items-center gap-2 tracking-tight">
            <User className="w-4 h-4 text-orange-500" strokeWidth={1.5} /> Datos personales
          </h2>

          {exitoPerfil && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4" />{exitoPerfil}
            </div>
          )}
          {errorPerfil && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {errorPerfil}
            </div>
          )}

          <form onSubmit={handleGuardarPerfil} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:border-orange-400 focus:outline-none transition text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:border-orange-400 focus:outline-none transition text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition disabled:opacity-60"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-5 flex items-center gap-2 tracking-tight">
            <Lock className="w-4 h-4 text-orange-500" strokeWidth={1.5} /> Cambiar contraseña
          </h2>

          {exitoPass && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4" />{exitoPass}
            </div>
          )}
          {errorPass && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
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
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:border-orange-400 focus:outline-none transition text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={guardandoPass}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition disabled:opacity-60"
            >
              {guardandoPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {guardandoPass ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>

        {/* Mis favoritos */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-5 flex items-center gap-2 tracking-tight">
            <Heart className="w-4 h-4 text-orange-500" strokeWidth={1.5} /> Mis favoritos
            {favoritos.length > 0 && (
              <span className="text-xs text-gray-500 border border-gray-200 rounded-full px-2 py-0.5">
                {favoritos.length}
              </span>
            )}
          </h2>

          {cargandoFavoritos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : favoritos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                Aún no marcaste ningún viaje como favorito.{" "}
                <a href="/destinos" className="text-orange-500 hover:underline">
                  Descubrí destinos
                </a>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favoritos.map((f) => (
                <div
                  key={f.id}
                  className="group relative flex items-center gap-3 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition cursor-pointer"
                  onClick={() => navigate(`/viaje/${f.id}`)}
                >
                  {f.imagen_url ? (
                    <img src={f.imagen_url} alt={f.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{f.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{f.destination}
                    </p>
                    <p className="text-xs flex items-center gap-2 mt-1">
                      <span className="font-semibold text-gray-900">${Number(f.price).toLocaleString()}</span>
                      <span className="flex items-center gap-0.5 text-gray-400">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(f.rating).toFixed(1)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuitarFavorito(f.id);
                    }}
                    title="Quitar de favoritos"
                    className="flex-shrink-0 w-7 h-7 rounded-full text-gray-400 hover:text-red-500 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mis reservas */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-5 flex items-center gap-2 tracking-tight">
            <Plane className="w-4 h-4 text-orange-500" strokeWidth={1.5} /> Mis reservas
          </h2>

          {cargandoReservas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                Aún no tenés reservas.{" "}
                <a href="/destinos" className="text-orange-500 hover:underline">
                  Explorá destinos
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {reservas.map((r) => (
                <div key={r.id} className="flex items-center gap-3 border border-gray-100 hover:border-gray-200 rounded-lg p-3 transition">
                  {r.imagen_url ? (
                    <img src={r.imagen_url} alt={r.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{r.destination}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{r.start_date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${ESTADO_COLORES[r.estado] ?? ""}`}>
                      {r.estado}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">${Number(r.monto).toLocaleString()}</span>
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
