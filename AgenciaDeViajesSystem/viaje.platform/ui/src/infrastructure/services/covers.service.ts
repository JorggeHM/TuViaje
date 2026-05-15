import client from '../api/client';

export interface CoverImagen {
    id:         number;
    url:        string;
    orden:      number;
    visible:    number;
    created_at: string;
}

class CoversService {

    /** Lista las imágenes visibles del header (endpoint público). */
    static async listarPublicas(): Promise<CoverImagen[]> {
        const res = await client.get('/api/covers', { skipAuthRedirect: true } as object);
        return res.data.data ?? [];
    }

    /** Lista TODAS las imágenes (admin, requiere rol admin). */
    static async listarTodas(): Promise<CoverImagen[]> {
        const res = await client.get('/api/admin/covers');
        return res.data.data ?? [];
    }

    /** Sube una imagen como archivo. */
    static async subirArchivo(file: File, orden = 0): Promise<CoverImagen> {
        const form = new FormData();
        form.append('imagen', file);
        form.append('orden',  String(orden));
        const res = await client.post('/api/admin/covers', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    }

    /** Agrega una imagen a partir de una URL externa. */
    static async agregarPorUrl(url: string, orden = 0): Promise<CoverImagen> {
        const res = await client.post('/api/admin/covers', { url, orden });
        return res.data.data;
    }

    static async toggleVisible(id: number) {
        const res = await client.patch(`/api/admin/covers/${id}/visible`);
        return res.data;
    }

    static async eliminar(id: number) {
        const res = await client.delete(`/api/admin/covers/${id}`);
        return res.data;
    }
}

export default CoversService;
