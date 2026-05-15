import client from '../api/client';

export interface Experiencia {
    id:             number;
    usuario_id:     number;
    usuario_nombre: string;
    destino:        string;
    rating:         number;
    texto:          string;
    fecha:          string;
    likes:          number;
    imagen:         string | null;
}

export interface ActualizarExperiencia {
    destino?: string;
    rating?:  number;
    texto?:   string;
}

class ExperienciasService {

    static async listar(minRating: number = 1): Promise<Experiencia[]> {
        const res = await client.get(`/api/experiencias?minRating=${minRating}`, { skipAuthRedirect: true } as object);
        return res.data.data ?? [];
    }

    static async actualizar(id: number, data: ActualizarExperiencia): Promise<Experiencia> {
        const res = await client.put(`/api/experiencias/${id}`, data);
        return res.data.data;
    }

    static async eliminar(id: number): Promise<void> {
        await client.delete(`/api/experiencias/${id}`);
    }

    static async like(id: number): Promise<void> {
        await client.patch(`/api/experiencias/${id}/like`);
    }
}

export default ExperienciasService;
