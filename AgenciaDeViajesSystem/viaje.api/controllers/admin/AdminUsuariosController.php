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

        // El CASCADE en FK borra reservas/ventas, pero no devuelve cupos al viaje.
        // Liberamos manualmente las plazas de cada reserva activa antes de eliminar.
        $reservaModel = new Reserva();
        $viajeModel   = new Viaje();
        $reservasPagadas = 0;
        foreach ($reservaModel->listActivasByUsuario($id) as $reserva) {
            $viajeModel->incrementSeats(
                (int) $reserva['viaje_id'],
                (int) ($reserva['personas'] ?? 1)
            );
            if (!empty($reserva['stripe_session_id'])) {
                $reservasPagadas++;
            }
        }

        $model->delete($id);

        $msg = 'Usuario eliminado';
        if ($reservasPagadas > 0) {
            $msg .= " — atención: $reservasPagadas reserva(s) con pago Stripe activo se perdieron sin refund automático. Refundá manualmente desde el dashboard de Stripe.";
        }
        Response::success(null, $msg);
    }
}
