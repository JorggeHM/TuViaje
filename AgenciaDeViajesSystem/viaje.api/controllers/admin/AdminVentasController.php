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

    public static function updateEstado(Request $request): void {
        Middleware::adminOnly($request);

        $id     = (int) ($request->params['id'] ?? 0);
        $estado = trim($request->body['estado'] ?? '');

        $allowed = ['Pendiente', 'Confirmada', 'Cancelada'];
        if (!in_array($estado, $allowed, true)) {
            Response::error('Estado inválido. Debe ser: Pendiente, Confirmada o Cancelada');
        }

        $ventaModel   = new Venta();
        $reservaModel = new Reserva();

        $venta = $ventaModel->findById($id);
        if (!$venta) Response::error('Venta no encontrada', 404);

        $ventaModel->updateEstado($id, $estado);

        // Sincronizar el estado de la reserva correspondiente
        $reservaModel->updateEstadoByVenta(
            (int) $venta['usuario_id'],
            (int) $venta['viaje_id'],
            $estado
        );

        Response::success(null, "Venta actualizada a '$estado'");
    }
}
