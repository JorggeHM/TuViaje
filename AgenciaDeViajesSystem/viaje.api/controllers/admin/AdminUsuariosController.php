<?php

class AdminUsuariosController {
    public static function index(Request $request): void {
        Middleware::adminOnly($request);
        $model = new Usuario();
        Response::success($model->list());
    }

    public static function toggleEstado(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Usuario();

        if (!$model->findById($id)) {
            Response::error('Usuario no encontrado', 404);
        }

        $model->toggleActivo($id);
        Response::success(null, 'Estado actualizado');
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Usuario();

        if (!$model->findById($id)) {
            Response::error('Usuario no encontrado', 404);
        }

        // El CASCADE en FK borra ventas, pero no devuelve cupos al viaje.
        // Liberamos manualmente las plazas de cada venta activa antes de eliminar.
        $ventaModel = new Venta();
        $viajeModel   = new Viaje();
        $ventasPagadas = 0;
        foreach ($ventaModel->listActivasByUsuario($id) as $venta) {
            $viajeModel->incrementSeats(
                (int) $venta['viaje_id'],
                (int) ($venta['personas'] ?? 1)
            );
            if (!empty($venta['stripe_session_id'])) {
                $ventasPagadas++;
            }
        }

        $model->delete($id);

        $msg = 'Usuario eliminado';
        if ($ventasPagadas > 0) {
            $msg .= " — atención: $ventasPagadas venta(s) con pago Stripe activo se perdieron sin refund automático. Refundá manualmente desde el dashboard de Stripe.";
        }
        Response::success(null, $msg);
    }
}
