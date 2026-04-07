import client from '../../infrastructure/api/client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
}

class AuthService {
    static async login(email: string, password: string) {
        const response = await client.post('/auth/login', {
            email,
            password
        });
        
        if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        
        return response.data.data;
    }

    static async register(email: string, password: string, name: string) {
        const response = await client.post('/auth/register', {
            email,
            password,
            name
        });
        return response.data.data;
    }

    static async getCurrentUser() {
        const response = await client.get('/auth/me');
        return response.data.data;
    }

    static async logout() {
        await client.post('/auth/logout');
        localStorage.removeItem('token');
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }
}

export default AuthService;