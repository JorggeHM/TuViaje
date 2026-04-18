import client from '../api/client';

export interface Reserva {
    id: number;
    viaje_id: number;
    usuario_id: number;
    monto: number;
    estado: 'Pendiente' | 'Confirmada' | 'Cancelada';
    fecha_reserva: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    imagen_url: string;
}

class ReservasService {
    static async crear(viajeId: number, personas: number): Promise<Reserva> {
        const res = await client.post('/api/reservas', { viaje_id: viajeId, personas });
        return res.data.data;
    }

    static async misReservas(): Promise<Reserva[]> {
        const res = await client.get('/api/auth/reservas');
        return res.data.data ?? [];
    }

    static async cancelar(id: number): Promise<void> {
        await client.patch(`/api/reservas/${id}`);
    }
}

export default ReservasService;
