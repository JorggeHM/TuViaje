<?php

class StripeWebhookController {

    public static function handle(Request $request): void {
        $rawBody    = file_get_contents('php://input') ?: '';
        $sigHeader  = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

        if (!Stripe::verifyWebhookSignature($rawBody, $sigHeader)) {
            error_log('[Stripe Webhook] Firma inválida o ausente');
            Response::error('Firma inválida', 400);
        }

        $event = json_decode($rawBody, true);
        if (!is_array($event)) Response::error('Payload inválido', 400);

        $type   = (string) ($event['type'] ?? '');
        $object = $event['data']['object'] ?? [];

        $reserva = self::resolveReserva($type, $object);
        if (!$reserva) {
            // Evento sin reserva asociada (otra integración o sesión desconocida) — ack y listo
            Response::success(null, 'ignored');
        }

        $reservaId = (int) $reserva['id'];

        switch ($type) {
            case 'checkout.session.completed':
                self::confirmarReserva($reserva, $reservaId);
                break;

            case 'checkout.session.expired':
            case 'checkout.session.async_payment_failed':
            case 'payment_intent.payment_failed':
                self::cancelarReserva($reserva, $reservaId);
                break;
        }

        Response::success(null, 'ok');
    }

    /**
     * Resuelve la reserva referenciada por el evento, según el tipo:
     * - Eventos de checkout.session.* viajan con la session entera; usamos su `id`.
     * - payment_intent.* viajan con el payment_intent; usamos `metadata.reserva_id`
     *   que seteamos en ReservasController::store al crear la session.
     */
    private static function resolveReserva(string $type, array $object): ?array {
        $reservaModel = new Reserva();

        if (str_starts_with($type, 'checkout.session.')) {
            $sessionId = (string) ($object['id'] ?? '');
            return $sessionId === '' ? null : $reservaModel->findByStripeSessionId($sessionId);
        }

        if (str_starts_with($type, 'payment_intent.')) {
            $reservaId = (int) ($object['metadata']['reserva_id'] ?? 0);
            return $reservaId > 0 ? $reservaModel->findById($reservaId) : null;
        }

        return null;
    }

    private static function confirmarReserva(array $reserva, int $reservaId): void {
        if ($reserva['estado'] === 'Confirmada') return; // Idempotente: ya confirmada

        $reservaModel = new Reserva();
        $reservaModel->updateEstado($reservaId, 'Confirmada');

        // Crear la venta vinculada (la antes-única-fuente de "ventas confirmadas")
        $ventaModel = new Venta();
        $ventaId    = $ventaModel->create(
            (int) $reserva['usuario_id'],
            (int) $reserva['viaje_id'],
            (float) $reserva['monto']
        );
        $ventaModel->updateEstado($ventaId, 'Confirmada');

        // Email best-effort
        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById((int) $reserva['usuario_id']);
        if ($usuario) {
            Mailer::sendReservaConfirmacion($usuario['name'], $usuario['email'], $reserva);
        }
    }

    private static function cancelarReserva(array $reserva, int $reservaId): void {
        if ($reserva['estado'] === 'Cancelada') return; // Idempotente

        $reservaModel = new Reserva();
        $reservaModel->updateEstado($reservaId, 'Cancelada');

        // Liberar cupos que estaban reservados para este checkout
        $personas   = (int) ($reserva['personas'] ?? 1);
        $viajeModel = new Viaje();
        $viajeModel->incrementSeats((int) $reserva['viaje_id'], $personas);
    }
}
