import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReservasService, { type Reserva } from '../infrastructure/services/reservas.service';

// Mock del cliente Axios — evita peticiones HTTP reales en tests
vi.mock('../infrastructure/api/client', () => ({
  default: {
    post:  vi.fn(),
    get:   vi.fn(),
    patch: vi.fn(),
  },
}));

import client from '../infrastructure/api/client';

const mockClient = client as unknown as {
  post:  ReturnType<typeof vi.fn>;
  get:   ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const reservaMock: Reserva = {
  id: 1, viaje_id: 10, usuario_id: 5, monto: 600,
  estado: 'Confirmada', fecha_reserva: '2026-04-21T10:00:00',
  title: 'París Express', destination: 'París',
  start_date: '2026-06-01', end_date: '2026-06-08', imagen_url: 'https://img.com/paris.jpg',
};

describe('ReservasService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── crear ────────────────────────────────────────────────────────

  it('crear → hace POST /api/reservas y devuelve la URL de Stripe Checkout', async () => {
    const checkoutMock = { reserva_id: 42, url: 'https://checkout.stripe.com/c/pay/cs_test_xyz' };
    mockClient.post.mockResolvedValueOnce({ data: { data: checkoutMock } });

    const resultado = await ReservasService.crear(10, 2);

    expect(mockClient.post).toHaveBeenCalledOnce();
    expect(mockClient.post).toHaveBeenCalledWith('/api/reservas', { viaje_id: 10, personas: 2 });
    expect(resultado).toEqual(checkoutMock);
  });

  it('crear → propaga el error si el servidor responde con error', async () => {
    mockClient.post.mockRejectedValueOnce({ response: { data: { message: 'No hay cupos' } } });

    await expect(ReservasService.crear(10, 5)).rejects.toMatchObject({
      response: { data: { message: 'No hay cupos' } },
    });
  });

  // ── misReservas ──────────────────────────────────────────────────

  it('misReservas → hace GET /api/auth/reservas y devuelve el array', async () => {
    mockClient.get.mockResolvedValueOnce({ data: { data: [reservaMock] } });

    const lista = await ReservasService.misReservas();

    expect(mockClient.get).toHaveBeenCalledWith('/api/auth/reservas');
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe(1);
  });

  it('misReservas → devuelve [] si la API responde con data null', async () => {
    mockClient.get.mockResolvedValueOnce({ data: { data: null } });

    const lista = await ReservasService.misReservas();

    expect(lista).toEqual([]);
  });

  // ── cancelar ─────────────────────────────────────────────────────

  it('cancelar → hace PATCH /api/reservas/{id}', async () => {
    mockClient.patch.mockResolvedValueOnce({ data: {} });

    await ReservasService.cancelar(7);

    expect(mockClient.patch).toHaveBeenCalledWith('/api/reservas/7');
  });

  it('cancelar → propaga el error si el servidor responde con error', async () => {
    mockClient.patch.mockRejectedValueOnce({ response: { status: 403 } });

    await expect(ReservasService.cancelar(99)).rejects.toMatchObject({
      response: { status: 403 },
    });
  });
});
