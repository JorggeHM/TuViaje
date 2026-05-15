import client from '../api/client';
import type { Viaje } from './viajes.service';

export interface ViajeFavorito extends Viaje {
    favorited_at: string;
}

class FavoritosService {

    /** Lista los viajes favoritos del usuario con datos completos. */
    static async listar(): Promise<ViajeFavorito[]> {
        const res = await client.get('/api/favoritos');
        return res.data.data ?? [];
    }

    /** Lista solo los IDs — útil para checks rápidos al renderizar. */
    static async listarIds(): Promise<number[]> {
        const res = await client.get('/api/favoritos/ids');
        return res.data.data ?? [];
    }

    static async agregar(viajeId: number) {
        const res = await client.post('/api/favoritos', { viaje_id: viajeId });
        return res.data;
    }

    static async eliminar(viajeId: number) {
        const res = await client.delete(`/api/favoritos/${viajeId}`);
        return res.data;
    }
}

export default FavoritosService;
