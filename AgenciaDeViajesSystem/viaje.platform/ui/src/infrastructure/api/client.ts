/**
 * client.ts — Cliente HTTP centralizado (Axios)
 *
 * Configura una instancia de Axios que se usa en toda la aplicación
 * para comunicarse con la API backend.
 *
 * Características:
 * - Base URL apunta al API PHP en Apache (configurable vía variable de entorno)
 * - Envía cookies/sesiones automáticamente (withCredentials: true)
 * - Interceptor de REQUEST: adjunta el token JWT del localStorage en cada petición
 * - Interceptor de RESPONSE: si el servidor responde 401 (token expirado o inválido),
 *   limpia el token y redirige al usuario a /login automáticamente
 *
 * Uso:
 *   import client from '@/infrastructure/api/client';
 *   const data = await client.get('/viajes');
 *   const user = await client.post('/auth/login', { email, password });
 *
 * NOTA: Para peticiones de viajes en Destinos.tsx se usa fetch() directamente
 * con la URL del .env porque ese endpoint está en un servidor diferente.
 * Este cliente se usa principalmente para las rutas de autenticación.
 */
import axios from 'axios';

// URL base del API — puede sobreescribirse con la variable de entorno VITE_API_BASE_URL
const API_BASE_URL = 'http://localhost/agencia-viajes-api/api';

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
// Se ejecuta al recibir la respuesta del servidor.
// Si el servidor devuelve 401 (no autorizado), significa que el token expiró:
// elimina el token almacenado y redirige al login.
client.interceptors.response.use(
    (response) => response, // Respuesta exitosa: la deja pasar sin cambios
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
