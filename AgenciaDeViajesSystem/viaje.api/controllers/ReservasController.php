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

        // Decremento en reserva los cupos mientras dure el checkout
        if (!$viajeModel->decrementSeats($viajeId, $personas)) {
            Response::error('No hay cupos suficientes. Otro usuario los tomó en este momento.', 409);
        }

        $monto     = (float) $viaje['price'] * $personas;
        $usuarioId = (int) $request->user['sub'];

        $reservaModel = new Reserva();
        $reservaId    = $reservaModel->create($usuarioId, $viajeId, $monto, $personas);
        // La reserva nace en Pendiente. Solo pasa a Confirmada cuando el webhook
        // de Stripe nos avisa que el pago se completó.

        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById($usuarioId);

        $appUrl = (string) (getenv('APP_URL') ?: 'http://localhost:5173');

        try {
            $session = Stripe::createCheckoutSession([
                'mode'        => 'payment',
                'success_url' => "$appUrl/pago/exito?session_id={CHECKOUT_SESSION_ID}",
                'cancel_url'  => "$appUrl/pago/cancelado?session_id={CHECKOUT_SESSION_ID}",
                'customer_email'        => $usuario['email'] ?? null,
                'client_reference_id'   => (string) $reservaId,
                'metadata'              => ['reserva_id' => (string) $reservaId],
                'payment_intent_data'   => ['metadata' => ['reserva_id' => (string) $reservaId]],
                'line_items'            => [[
                    'quantity'   => $personas,
                    'price_data' => [
                        'currency'     => 'mxn',
                        'unit_amount'  => (int) round((float) $viaje['price'] * 100),
                        'product_data' => [
                            'name'        => $viaje['title'],
                            'description' => 'Reserva TuViaje · ' . ($viaje['destination'] ?? ''),
                        ],
                    ],
                ]],
            ]);
        } catch (\Throwable $e) {
            // Rollback: liberar cupos y eliminar la reserva fantasma
            $viajeModel->incrementSeats($viajeId, $personas);
            $reservaModel->delete($reservaId);
            Response::error('No pudimos iniciar el pago: ' . $e->getMessage(), 502);
        }

        $reservaModel->setStripeSession($reservaId, (string) ($session['id'] ?? ''));

        Response::success([
            'reserva_id' => $reservaId,
            'url'        => $session['url'] ?? null,
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

        $reserva = (new Reserva())->findStatusBySessionId($sessionId);
        if (!$reserva) {
            Response::error('Reserva no encontrada', 404);
        }

        Response::success([
            'reserva_id' => (int) $reserva['id'],
            'estado'     => (string) $reserva['estado'],
        ]);
    }

    public static function misReservas(Request $request): void {
        Middleware::auth($request);
        $usuarioId = (int) $request->user['sub'];
        $model = new Reserva();
        Response::success($model->listByUsuario($usuarioId));
    }

    public static function cancel(Request $request): void {
        Middleware::auth($request);
        $id        = (int) ($request->params['id'] ?? 0);
        $usuarioId = (int) $request->user['sub'];

        $model   = new Reserva();
        $reserva = $model->findById($id);

        if (!$reserva)                                    Response::error('Reserva no encontrada', 404);
        if ((int) $reserva['usuario_id'] !== $usuarioId) Response::error('No autorizado', 403);
        if ($reserva['estado'] === 'Cancelada')           Response::error('La reserva ya está cancelada');

        // Si la reserva ya fue pagada (Confirmada), hay que reembolsar al cliente
        // ANTES de marcarla como cancelada localmente. Si el refund falla, la
        // operación entera aborta para mantener consistencia con Stripe.
        if ($reserva['estado'] === 'Confirmada') {
            $sessionId = (string) ($reserva['stripe_session_id'] ?? '');
            if ($sessionId === '') {
                Response::error('No se puede reembolsar: la reserva no tiene sesión de Stripe asociada. Contactá a soporte.', 409);
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

            // Cancelar la Venta asociada (la fuente de ingresos confirmados).
            $ventaModel = new Venta();
            $venta = $ventaModel->findActiveByUsuarioViaje($usuarioId, (int) $reserva['viaje_id']);
            if ($venta) {
                $ventaModel->updateEstado((int) $venta['id'], 'Cancelada');
            }
        }

        $model->updateEstado($id, 'Cancelada');

        $personas   = (int) ($reserva['personas'] ?? 1);
        $viajeModel = new Viaje();
        $viajeModel->incrementSeats((int) $reserva['viaje_id'], $personas);

        // Best-effort: notificar al usuario
        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById($usuarioId);
        if ($usuario) {
            Mailer::sendReservaCancelacion($usuario['name'], $usuario['email'], $reserva);
        }

        Response::success(null, 'Reserva cancelada');
    }
}
