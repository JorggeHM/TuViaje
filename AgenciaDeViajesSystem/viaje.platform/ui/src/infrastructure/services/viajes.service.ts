import client from '../api/client';

export interface Garantia {
    titulo: string;
    desc:   string;
    icon:   string;
}

export interface Viaje {
    id: number;
    title: string;
    description: string;
    destination: string;
    price: number;
    available_seats: number;
    total_ventas?: number;
    start_date: string;
    end_date: string;
    duracion_dias: number;
    rating: number;
    imagen_url: string;
    incluidos?: string[]   | null;
    galeria?:   string[]   | null;
    garantias?: Garantia[] | null;
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
