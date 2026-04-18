import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost/AgenciaDeViajesSystem/viaje.api';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Necesario para que el navegador envíe cookies de sesión
});

// ── Interceptor de solicitudes ────────────────────────────────────────────────
// Se ejecuta ANTES de cada petición HTTP.
// Si existe un token en localStorage, lo agrega al header Authorization.
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Interceptor de respuestas ─────────────────────────────────────────────────
// Si el servidor devuelve 401 Y la petición no tiene skipAuthRedirect: true,
// elimina el token y redirige al login. Usar skipAuthRedirect en llamadas
// opcionales (ej: Nav dropdown) para no expulsar al usuario por error.
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const skip = (error.config as { skipAuthRedirect?: boolean })?.skipAuthRedirect;
        if (error.response?.status === 401 && !skip) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
