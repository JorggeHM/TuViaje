<?php

class AdminViajesController {
    public static function index(Request $request): void {
        Middleware::adminOnly($request);
        $model  = new Viaje();
        Response::success($model->listAll());
    }

    public static function store(Request $request): void {
        Middleware::adminOnly($request);
        $required = ['title', 'destination', 'price', 'available_seats', 'start_date', 'end_date'];
        foreach ($required as $field) {
            if (empty($request->body[$field])) {
                Response::error("Campo requerido: $field");
            }
        }

        $model = new Viaje();
        $id    = $model->create($request->body);
        $viaje = $model->findById($id);

        Response::success($viaje, 'Viaje creado', 201);
    }

    public static function update(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Viaje();

        if (!$model->findById($id)) {
            Response::error('Viaje no encontrado', 404);
        }

        $model->update($id, $request->body);
        Response::success($model->findById($id), 'Viaje actualizado');
    }

    public static function finalizar(Request $request): void {
        Middleware::adminOnly($request);
        $id     = (int) ($request->params['id'] ?? 0);
        $estado = $request->body['estado'] ?? 'Finalizado';
        $model  = new Viaje();

        if (!$model->findById($id)) {
            Response::error('Viaje no encontrado', 404);
        }

        $model->setState($id, $estado);

        // Al finalizar, las reservas Pendientes ya no tienen sentido (el viaje pasó):
        // se cancelan y se sincronizan las ventas asociadas. Las Confirmadas se respetan
        // porque representan ventas exitosas / pasajeros que ya viajaron.
        $canceladas = 0;
        if ($estado === 'Finalizado') {
            $reservaModel = new Reserva();
            $ventaModel   = new Venta();
            foreach ($reservaModel->listPendientesByViaje($id) as $reserva) {
                $reservaModel->updateEstado((int) $reserva['id'], 'Cancelada');
                $ventaModel->updateEstadoByPair(
                    (int) $reserva['usuario_id'],
                    $id,
                    'Cancelada'
                );
                $canceladas++;
            }
        }

        $msg = 'Estado actualizado';
        if ($canceladas > 0) {
            $msg .= " — $canceladas reserva(s) pendiente(s) cancelada(s) automáticamente";
        }
        Response::success(null, $msg);
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Viaje();

        if (!$model->findById($id)) {
            Response::error('Viaje no encontrado', 404);
        }

        // Antes de borrar (CASCADE eliminará ventas+reservas), procesar refund Stripe
        // de las reservas pagadas. Si alguno falla, abortamos: mejor dejar el viaje
        // intacto que perder un pago sin reembolso.
        $reservaModel    = new Reserva();
        $reservasPagadas = $reservaModel->listActivasConStripeByViaje($id);
        $fallidas        = [];

        foreach ($reservasPagadas as $reserva) {
            $sessionId = (string) $reserva['stripe_session_id'];
            try {
                $session = Stripe::retrieveCheckoutSession($sessionId);
                $pi      = (string) ($session['payment_intent'] ?? '');
                if ($pi === '') {
                    $fallidas[] = (int) $reserva['id'];
                    continue;
                }
                Stripe::createRefund($pi);
            } catch (\Throwable $e) {
                $fallidas[] = (int) $reserva['id'];
            }
        }

        if (!empty($fallidas)) {
            Response::error(
                'No se pudo refundar la(s) reserva(s) ' . implode(', ', $fallidas)
                . '. Cancelá esas ventas manualmente antes de eliminar el viaje.',
                502
            );
        }

        $model->delete($id);

        $msg = count($reservasPagadas) > 0
            ? 'Viaje eliminado — ' . count($reservasPagadas) . ' pago(s) reembolsado(s) vía Stripe'
            : 'Viaje eliminado';
        Response::success(null, $msg);
    }
}
