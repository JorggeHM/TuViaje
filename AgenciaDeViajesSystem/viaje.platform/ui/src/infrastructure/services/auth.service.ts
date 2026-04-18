/**
 * auth.service.ts — Servicio de autenticación
 *
 * Centraliza toda la lógica relacionada con el login, registro y
 * gestión de sesión del usuario. Usa el cliente Axios configurado
 * en infrastructure/api/client.ts.
 *
 * Endpoints que consume:
 *   POST /auth/login    → autentica y devuelve un token JWT
 *   POST /auth/register → crea una nueva cuenta
 *   GET  /auth/me       → devuelve los datos del usuario autenticado
 *   POST /auth/logout   → invalida la sesión en el servidor
 *
 * El token JWT se guarda en localStorage con la clave 'token'.
 * El interceptor de Axios en client.ts lo adjunta automáticamente
 * a cada petición HTTP posterior.
 *
 * Uso desde un componente:
 *   import AuthService from '@/infrastructure/services/auth.service';
 *   await AuthService.login('user@mail.com', '123456');
 *   const estaLogueado = AuthService.isAuthenticated();
 */
import client from '../../infrastructure/api/client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    rol: 'usuario' | 'admin';
}

class AuthService {

    /**
     * Autentica al usuario con email y contraseña.
     * Si el servidor devuelve un token, lo guarda en localStorage.
     * El token es luego adjuntado automáticamente por el interceptor de Axios.
     */
    static async login(email: string, password: string) {
        const response = await client.post('/api/auth/login', { email, password });

        if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
        }

        return response.data.data;
    }

    static async register(email: string, password: string, name: string) {
        const response = await client.post('/api/auth/register', { email, password, name });

        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }

        return response.data.data;
    }

    static async getCurrentUser() {
        const response = await client.get('/api/auth/me');
        return response.data.data;
    }

    static async logout() {
        await client.post('/api/auth/logout');
        localStorage.removeItem('token');
    }

    /** Devuelve el token JWT almacenado en localStorage, o null si no existe. */
    static getToken() {
        return localStorage.getItem('token');
    }

    /** Devuelve true si hay un token guardado (el usuario está "logueado"). */
    static isAuthenticated() {
        return !!this.getToken();
    }

    /** Decodifica el payload del JWT y lo devuelve, sin validar firma. */
    static getUser(): User | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            // JWT usa base64url (sin padding =). atob() requiere base64 estándar.
            const segment = token.split('.')[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/')
                .padEnd(Math.ceil(token.split('.')[1].length / 4) * 4, '=');
            const payload = JSON.parse(atob(segment));
            return {
                id:    payload.sub,
                email: payload.email,
                name:  payload.name,
                rol:   payload.rol ?? 'usuario',
            };
        } catch {
            return null;
        }
    }

    /** Devuelve true si el usuario autenticado tiene rol admin. */
    static isAdmin() {
        return this.getUser()?.rol === 'admin';
    }
}

export default AuthService;
