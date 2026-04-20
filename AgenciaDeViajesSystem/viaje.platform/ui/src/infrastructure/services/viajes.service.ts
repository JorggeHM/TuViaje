import client from '../api/client';

export interface Viaje {
    id: number;
    title: string;
    description: string;
    destination: string;
    price: number;
    available_seats: number;
    start_date: string;
    end_date: string;
    duracion_dias: number;
    rating: number;
    imagen_url: string;
    estado: string;
}

class ViajesService {
    static async listar(): Promise<Viaje[]> {
        const res = await client.get('/api/viajes');
        return res.data.data ?? [];
    }

    static async obtener(id: number): Promise<Viaje> {
        const res = await client.get(`/api/viajes/${id}`);
        return res.data.data;
    }
}

export default ViajesService;
