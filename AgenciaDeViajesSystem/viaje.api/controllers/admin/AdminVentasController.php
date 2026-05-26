<?php

class AdminVentasController {
    public static function index(Request $request): void {
        Middleware::adminOnly($request);
        $filters = [
            'estado' => $_GET['estado'] ?? '',
            'q'      => $_GET['q'] ?? '',
        ];
        $model = new Venta();
        Response::success($model->list($filters));
    }

    public static function stats(Request $request): void {
        Middleware::adminOnly($request);
        $model = new Venta();
        Response::success($model->stats());
    }

    /**
     * POST /api/admin/ventas/{id}/refund
     *
     * Reembolsa una venta Confirmada vía Stripe, marca la venta y su reserva
     * como Cancelada, y libera los cupos del viaje. Si el refund falla en
     * Stripe se aborta todo: no se toca BD.
     */
    public static function refund(Request $request): void {
        Middleware::adminOnly($request);

        $id = (int) ($request->params['id'] ?? 0);
        if ($id <= 0) Response::error('ID inválido', 400);

        $ventaModel = new Venta();
        $venta      = $ventaModel->findById($id);
        if (!$venta) Response::error('Venta no encontrada', 404);

        if ($venta['estado'] !== 'Confirmada') {
            Response::error('Solo se pueden reembolsar ventas en estado Confirmada', 409);
        }

        // Localizar la reserva pagada asociada (la última no cancelada del par usuario+viaje).
        $reservaModel = new Reserva();
        $reserva = $reservaModel->findLastByUsuarioViaje(
            (int) $venta['usuario_id'],
            (int) $venta['viaje_id']
        );

        if (!$reserva || $reserva['estado'] === 'Cancelada') {
            Response::error('No se encontró una reserva activa para esta venta', 409);
        }

        $sessionId = (string) ($reserva['stripe_session_id'] ?? '');
        if ($sessionId === '') {
            Response::error('La reserva no tiene sesión de Stripe asociada — refund manual desde el dashboard', 409);
        }

        // 1) Pedir refund a Stripe ANTES de tocar BD.
        try {
            $session         = Stripe::retrieveCheckoutSession($sessionId);
            $paymentIntentId = (string) ($session['payment_intent'] ?? '');
            if ($paymentIntentId === '') {
                Response::error('No se pudo identificar el pago asociado en Stripe', 502);
            }
            Stripe::createRefund($paymentIntentId);
        } catch (\Throwable $e) {
            Response::error('No se pudo procesar el reembolso: ' . $e->getMessage(), 502);
        }

        // 2) Sincronizar estado local.
        $ventaModel->updateEstado($id, 'Cancelada');
        $reservaModel->updateEstado((int) $reserva['id'], 'Cancelada');

        $viajeModel = new Viaje();
        $viajeModel->incrementSeats(
            (int) $reserva['viaje_id'],
            (int) ($reserva['personas'] ?? 1)
        );

        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById((int) $venta['usuario_id']);
        if ($usuario) {
            Mailer::sendReembolsoProcesado(
                $usuario['name'],
                $usuario['email'],
                $reserva
            );
        }

        $id     = (int) ($request->params['id'] ?? 0);
        $estado = trim($request->body['estado'] ?? '');

        $allowed = ['Pendiente', 'Confirmada', 'Cancelada'];
        if (!in_array($estado, $allowed, true)) {
            Response::error('Estado inválido. Debe ser: Pendiente, Confirmada o Cancelada');
        }

        $ventaModel   = new Venta();
        $reservaModel = new Reserva();
        $viajeModel   = new Viaje();

        $venta = $ventaModel->findById($id);
        if (!$venta) Response::error('Venta no encontrada', 404);

        $estadoAnterior = $venta['estado'];

        // Obtener personas antes de modificar la reserva
        $reserva  = $reservaModel->findLastByUsuarioViaje(
            (int) $venta['usuario_id'],
            (int) $venta['viaje_id']
        );
        $personas = $reserva ? (int) ($reserva['personas'] ?? 1) : 1;

        $ventaModel->updateEstado($id, $estado);

        $reservaModel->updateEstadoByVenta(
            (int) $venta['usuario_id'],
            (int) $venta['viaje_id'],
            $estado
        );

        // Sincronizar cupos según la transición de estado
        if ($estado === 'Cancelada' && $estadoAnterior !== 'Cancelada') {
            $viajeModel->incrementSeats((int) $venta['viaje_id'], $personas);
        } elseif ($estado !== 'Cancelada' && $estadoAnterior === 'Cancelada') {
            $viajeModel->decrementSeats((int) $venta['viaje_id'], $personas);
        }

        Response::success(null, "Venta actualizada a '$estado'");
    }
}
