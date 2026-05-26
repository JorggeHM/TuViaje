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

        $venta = self::resolveVenta($type, $object);
        if (!$venta) {
            // Evento sin venta asociada (otra integración o sesión desconocida) — ack y listo
            Response::success(null, 'ignored');
        }

        $ventaId = (int) $venta['id'];

        switch ($type) {
            case 'checkout.session.completed':
                self::confirmarVenta($venta, $ventaId);
                break;

            case 'checkout.session.expired':
            case 'checkout.session.async_payment_failed':
            case 'payment_intent.payment_failed':
                self::cancelarVenta($venta, $ventaId);
                break;
        }

        Response::success(null, 'ok');
    }

    private static function resolveVenta(string $type, array $object): ?array {
        $ventaModel = new Venta();

        if (str_starts_with($type, 'checkout.session.')) {
            $sessionId = (string) ($object['id'] ?? '');
            return $sessionId === '' ? null : $ventaModel->findByStripeSessionId($sessionId);
        }

        if (str_starts_with($type, 'payment_intent.')) {
            $ventaId = (int) ($object['metadata']['venta_id'] ?? 0);
            return $ventaId > 0 ? $ventaModel->findById($ventaId) : null;
        }

        return null;
    }

    private static function confirmarVenta(array $venta, int $ventaId): void {
        // La venta ya nace en Confirmada, así que aquí solo enviamos confirmación por email
        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById((int) $venta['usuario_id']);
        if ($usuario) {
            Mailer::sendVentaConfirmacion($usuario['name'], $usuario['email'], $venta);
        }
    }

    private static function cancelarVenta(array $venta, int $ventaId): void {
        if ($venta['estado'] === 'Cancelada') return; // Idempotente

        $ventaModel = new Venta();
        $ventaModel->updateEstado($ventaId, 'Cancelada');

        // Liberar cupos que estaban reservados para este checkout
        $personas   = (int) ($venta['personas'] ?? 1);
        $viajeModel = new Viaje();
        $viajeModel->incrementSeats((int) $venta['viaje_id'], $personas);
    }
}
