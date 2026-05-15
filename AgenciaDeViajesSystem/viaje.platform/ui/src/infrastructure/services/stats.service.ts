import client from '../api/client';

export interface StatsPublicas {
    viajes_realizados: number;
    personas_viajeras: number;
    ciudades_visitadas: number;
    satisfaccion: number;
}

export const formatearMiles = (n: number): string => {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return n.toString();
};

class StatsService {
    static async obtener(): Promise<StatsPublicas> {
        const res = await client.get('/api/stats');
        return res.data.data;
    }
}

export default StatsService;
