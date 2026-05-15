/**
 * AuthContext — Estado global de autenticación.
 *
 * Mantiene en memoria el usuario decodificado del JWT y expone las
 * acciones que pueden modificarlo (login, register, logout, updateUser).
 * Los componentes consumen este contexto vía el hook `useAuth()`, evitando
 * leer y decodificar localStorage en cada render.
 *
 * El token sigue persistiéndose en localStorage (lo lee el interceptor de
 * Axios para adjuntarlo a cada request). Esta capa solo cachea el USUARIO.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AuthService from "../services/auth.service";

export interface User {
  id:          number;
  email:       string;
  name:        string;
  rol:         "usuario" | "admin";
  avatar_url?: string | null;
}

interface AuthContextValue {
  user:            User | null;
  isAuthenticated: boolean;
  isAdmin:         boolean;
  login:    (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout:   () => Promise<void>;
  /** Actualiza al usuario en memoria (p. ej. tras editar perfil). */
  updateUser: (partial: Partial<User>) => void;
  /** Re-decodifica el JWT actual (útil tras update de perfil que reemite token). */
  refreshFromToken: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Decodifica el payload del JWT sin validar firma.
 * Devuelve null si el token no existe o está malformado.
 */
function parseUserFromToken(token: string | null): User | null {
  if (!token) return null;
  try {
    const segment = token.split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(token.split(".")[1].length / 4) * 4, "=");
    const payload = JSON.parse(atob(segment));
    return {
      id:         payload.sub,
      email:      payload.email,
      name:       payload.name,
      rol:        payload.rol ?? "usuario",
      avatar_url: payload.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial: leer localStorage UNA sola vez al montar.
  const [user, setUser] = useState<User | null>(() =>
    parseUserFromToken(localStorage.getItem("token"))
  );

  const refreshFromToken = useCallback(() => {
    setUser(parseUserFromToken(localStorage.getItem("token")));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await AuthService.login(email, password);
    const next = parseUserFromToken(localStorage.getItem("token"));
    setUser(next);
    if (!next) throw new Error("No se pudo decodificar el token recibido");
    return next;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    await AuthService.register(email, password, name);
    const next = parseUserFromToken(localStorage.getItem("token"));
    setUser(next);
    if (!next) throw new Error("No se pudo decodificar el token recibido");
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin:         user?.rol === "admin",
    login,
    register,
    logout,
    updateUser,
    refreshFromToken,
  }), [user, login, register, logout, updateUser, refreshFromToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  return ctx;
}
