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

export interface CheckoutResponse {
    reserva_id: number;
    url:        string;
}

export interface ReservaStatus {
    reserva_id: number;
    estado:     'Pendiente' | 'Confirmada' | 'Cancelada';
}

class ReservasService {
    /**
     * Crea una reserva en estado Pendiente y devuelve la URL de Stripe Checkout.
     * El caller debe redirigir el navegador a esa URL: la reserva se confirmará
     * (o cancelará) cuando Stripe envíe el webhook al backend.
     */
    static async crear(viajeId: number, personas: number): Promise<CheckoutResponse> {
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

    /**
     * Consulta el estado real de una reserva por su session_id de Stripe.
     * Público (sin auth). Usado por las páginas /pago/exito y /pago/cancelado
     * para hacer polling hasta que el webhook procese el evento.
     */
    static async estadoPorSesion(sessionId: string): Promise<ReservaStatus> {
        const res = await client.get(
            `/api/reservas/status?session_id=${encodeURIComponent(sessionId)}`,
            { skipAuthRedirect: true } as object,
        );
        return res.data.data;
    }
}

export default ReservasService;
