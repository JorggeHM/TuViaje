<?php

class ReservasController {

    public static function store(Request $request): void {
        Middleware::auth($request);

        $viajeId  = (int) ($request->body['viaje_id']  ?? 0);
        $personas = (int) ($request->body['personas']  ?? 1);

        if ($viajeId <= 0) Response::error('viaje_id requerido');
        if ($personas < 1) Response::error('personas debe ser al menos 1');

        $viajeModel = new Viaje();
        $viaje = $viajeModel->findById($viajeId);

        if (!$viaje)                       Response::error('Viaje no encontrado', 404);
        if ($viaje['estado'] !== 'Activo') Response::error('El viaje no está disponible');
        if ($viaje['available_seats'] < $personas) Response::error('No hay suficientes cupos disponibles');

        // Decremento en venta los cupos mientras dure el checkout
        if (!$viajeModel->decrementSeats($viajeId, $personas)) {
            Response::error('No hay cupos suficientes. Otro usuario los tomó en este momento.', 409);
        }

        $monto     = (float) $viaje['price'] * $personas;
        $usuarioId = (int) $request->user['sub'];

        $ventaModel = new Venta();
        $ventaId    = $ventaModel->create($usuarioId, $viajeId, $monto, $personas);
        // La venta nace en Confirmada automáticamente y se vincula con Stripe a través del webhook

        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById($usuarioId);

        $appUrl = (string) (getenv('APP_URL') ?: 'http://localhost:5173');

        try {
            $session = Stripe::createCheckoutSession([
                'mode'        => 'payment',
                'success_url' => "$appUrl/pago/exito?session_id={CHECKOUT_SESSION_ID}",
                'cancel_url'  => "$appUrl/pago/cancelado?session_id={CHECKOUT_SESSION_ID}",
                'customer_email'        => $usuario['email'] ?? null,
                'client_reference_id'   => (string) $ventaId,
                'metadata'              => ['venta_id' => (string) $ventaId],
                'payment_intent_data'   => ['metadata' => ['venta_id' => (string) $ventaId]],
                'line_items'            => [[
                    'quantity'   => $personas,
                    'price_data' => [
                        'currency'     => 'mxn',
                        'unit_amount'  => (int) round((float) $viaje['price'] * 100),
                        'product_data' => [
                            'name'        => $viaje['title'],
                            'description' => 'TuViaje · ' . ($viaje['destination'] ?? ''),
                        ],
                    ],
                ]],
            ]);
        } catch (\Throwable $e) {
            // Rollback: liberar cupos y eliminar la venta fantasma
            $viajeModel->incrementSeats($viajeId, $personas);
            $ventaModel->delete($ventaId);
            Response::error('No pudimos iniciar el pago: ' . $e->getMessage(), 502);
        }

        $ventaModel->setStripeSession($ventaId, (string) ($session['id'] ?? ''));

        Response::success([
            'venta_id'  => $ventaId,
            'url'       => $session['url'] ?? null,
        ], 'Sesión de pago creada', 201);
    }

    /**
     * GET /api/reservas/status?session_id=cs_xxx
     *
     * Endpoint PÚBLICO (sin auth). Devuelve solo {id, estado} de la reserva
     * asociada a una Checkout Session de Stripe. Usado por /pago/exito y
     * /pago/cancelado para confirmar el estado real antes de mostrar el
     * mensaje al usuario (evita decir "éxito" mientras el webhook todavía
     * no llegó al backend).
     *
     * No revela datos sensibles: solo id y estado, ya que el session_id
     * solo lo conoce el cliente que recién pasó por Stripe.
     */
    public static function status(Request $request): void {
        $sessionId = trim($_GET['session_id'] ?? '');
        if ($sessionId === '') Response::error('session_id requerido', 400);

        $venta = (new Venta())->findStatusBySessionId($sessionId);
        if (!$venta) {
            Response::error('Venta no encontrada', 404);
        }

        Response::success([
            'venta_id' => (int) $venta['id'],
            'estado'   => (string) $venta['estado'],
        ]);
    }

    public static function misReservas(Request $request): void {
        Middleware::auth($request);
        $usuarioId = (int) $request->user['sub'];
        $model = new Venta();
        $ventas = $model->list(['usuario_id' => $usuarioId]);
        Response::success($ventas);
    }

    public static function cancel(Request $request): void {
        Middleware::auth($request);
        $id        = (int) ($request->params['id'] ?? 0);
        $usuarioId = (int) $request->user['sub'];

        $model = new Venta();
        $venta = $model->findById($id);

        if (!$venta)                                  Response::error('Venta no encontrada', 404);
        if ((int) $venta['usuario_id'] !== $usuarioId) Response::error('No autorizado', 403);
        if ($venta['estado'] === 'Cancelada')         Response::error('La venta ya está cancelada');

        // Si la venta ya fue pagada (Confirmada), hay que reembolsar al cliente
        // ANTES de marcarla como cancelada localmente. Si el refund falla, la
        // operación entera aborta para mantener consistencia con Stripe.
        if ($venta['estado'] === 'Confirmada') {
            $sessionId = (string) ($venta['stripe_session_id'] ?? '');
            if ($sessionId === '') {
                Response::error('No se puede reembolsar: la venta no tiene sesión de Stripe asociada. Contactá a soporte.', 409);
            }
            try {
                $session         = Stripe::retrieveCheckoutSession($sessionId);
                $paymentIntentId = (string) ($session['payment_intent'] ?? '');
                if ($paymentIntentId === '') {
                    Response::error('No se pudo identificar el pago a reembolsar. Contactá a soporte.', 502);
                }
                Stripe::createRefund($paymentIntentId);
            } catch (\Throwable $e) {
                Response::error('No se pudo procesar el reembolso: ' . $e->getMessage(), 502);
            }
        }

        $model->updateEstado($id, 'Cancelada');

        $personas   = (int) ($venta['personas'] ?? 1);
        $viajeModel = new Viaje();
        $viajeModel->incrementSeats((int) $venta['viaje_id'], $personas);

        // Best-effort: notificar al usuario
        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById($usuarioId);
        if ($usuario) {
            Mailer::sendVentaCancelacion($usuario['name'], $usuario['email'], $venta);
        }

        Response::success(null, 'Venta cancelada');
    }
}
