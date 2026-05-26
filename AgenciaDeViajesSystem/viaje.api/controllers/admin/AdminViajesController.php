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
            $value = $request->body[$field] ?? null;
            if ($value === null || $value === '' || (is_numeric($value) && $value < 0)) {
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
        Response::success(null, 'Estado actualizado');
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Viaje();

        if (!$model->findById($id)) {
            Response::error('Viaje no encontrado', 404);
        }

        // Antes de borrar (CASCADE eliminará ventas), procesar refund Stripe
        // de las ventas pagadas. Si alguno falla, abortamos: mejor dejar el viaje
        // intacto que perder un pago sin reembolso.
        $ventaModel  = new Venta();
        $ventasPagadas = $ventaModel->listActivasConStripeByViaje($id);
        $fallidas      = [];

        foreach ($ventasPagadas as $venta) {
            $sessionId = (string) $venta['stripe_session_id'];
            try {
                $session = Stripe::retrieveCheckoutSession($sessionId);
                $pi      = (string) ($session['payment_intent'] ?? '');
                if ($pi === '') {
                    $fallidas[] = (int) $venta['id'];
                    continue;
                }
                Stripe::createRefund($pi);
            } catch (\Throwable $e) {
                $fallidas[] = (int) $venta['id'];
            }
        }

        if (!empty($fallidas)) {
            Response::error(
                'No se pudo refundar la(s) venta(s) ' . implode(', ', $fallidas)
                . '. Cancelá esas ventas manualmente antes de eliminar el viaje.',
                502
            );
        }

        $model->delete($id);

        $msg = count($ventasPagadas) > 0
            ? 'Viaje eliminado — ' . count($ventasPagadas) . ' pago(s) reembolsado(s) vía Stripe'
            : 'Viaje eliminado';
        Response::success(null, $msg);
    }
}
