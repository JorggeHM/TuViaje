/**
 * auth.service.ts — Cliente HTTP de autenticación
 *
 * Solo expone métodos que hablan con la API. El estado del usuario y los
 * helpers reactivos (isAuthenticated, isAdmin, user) viven en AuthContext.
 *
 * Endpoints:
 *   POST /auth/login            → autentica y devuelve un token JWT
 *   POST /auth/register         → crea cuenta nueva
 *   GET  /auth/me               → datos del usuario autenticado
 *   POST /auth/logout           → invalida la sesión en el servidor
 *   POST /auth/forgot-password  → solicita link de reset por email
 *   POST /auth/reset-password   → restablece la contraseña con un token
 *
 * El token se persiste en localStorage['token'] (lo lee el interceptor
 * de Axios en client.ts para adjuntarlo a cada request).
 */
import client from '../api/client';

export interface LoginRequest {
    email: string;
    password: string;
}

class AuthService {

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
        // Best-effort: si el servidor falla igual cerramos sesión local
        try {
            await client.post('/api/auth/logout');
        } catch {
            // ignorado — el logout local debe completarse de todos modos
        }
        localStorage.removeItem('token');
    }

    static async forgotPassword(email: string) {
        const response = await client.post('/api/auth/forgot-password', { email });
        return response.data;
    }

    static async resetPassword(token: string, newPassword: string) {
        const response = await client.post('/api/auth/reset-password', {
            token,
            new_password: newPassword,
        });
        return response.data;
    }

    /** Sube una imagen como foto de perfil. Devuelve el usuario y rota el token. */
    static async subirAvatar(file: File) {
        const form = new FormData();
        form.append('imagen', file);
        // Pisamos el Content-Type heredado de la instancia (application/json) con
        // undefined para que axios + el navegador generen "multipart/form-data;
        // boundary=...". Si se setea manualmente sin boundary, PHP no parsea $_FILES.
        const response = await client.post('/api/auth/avatar', form, {
            headers: { 'Content-Type': undefined } as never,
        });
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data.data;
    }

    /** Elimina la foto de perfil actual. */
    static async eliminarAvatar() {
        const response = await client.delete('/api/auth/avatar');
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data.data;
    }
}

export default AuthService;
