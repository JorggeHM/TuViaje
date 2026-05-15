<?php

class AdminReservasController {

    public static function index(Request $request): void {
        Middleware::adminOnly($request);
        $filters = [
            'estado' => $_GET['estado'] ?? '',
            'q'      => $_GET['q'] ?? '',
        ];
        $model = new Reserva();
        Response::success($model->listAll($filters));
    }

    public static function updateEstado(Request $request): void {
        Middleware::adminOnly($request);

        $id     = (int) ($request->params['id'] ?? 0);
        $estado = trim($request->body['estado'] ?? '');

        $allowed = ['Pendiente', 'Confirmada', 'Cancelada'];
        if (!in_array($estado, $allowed, true)) {
            Response::error('Estado inválido. Debe ser: Pendiente, Confirmada o Cancelada');
        }

        $reservaModel = new Reserva();
        $reserva      = $reservaModel->findById($id);
        if (!$reserva) Response::error('Reserva no encontrada', 404);

        $estadoAnterior = $reserva['estado'];
        if ($estado === $estadoAnterior) {
            Response::success(null, 'La reserva ya estaba en ese estado');
        }

        $personas   = (int) ($reserva['personas'] ?? 1);
        $viajeId    = (int) $reserva['viaje_id'];
        $viajeModel = new Viaje();

        // Si pasa a cancelada → liberar cupos
        if ($estado === 'Cancelada' && $estadoAnterior !== 'Cancelada') {
            $viajeModel->incrementSeats($viajeId, $personas);
        }

        // Si sale de cancelada → re-tomar cupos (puede fallar si ya no hay disponibilidad)
        if ($estado !== 'Cancelada' && $estadoAnterior === 'Cancelada') {
            if (!$viajeModel->decrementSeats($viajeId, $personas)) {
                Response::error('No hay cupos suficientes para reactivar esta reserva', 409);
            }
        }

        $reservaModel->updateEstado($id, $estado);

        // Mantener la venta del par usuario+viaje en el mismo estado que la reserva
        // (simétrico al sync que ya hace AdminVentasController::updateEstado).
        $ventaModel = new Venta();
        $ventaModel->updateEstadoByPair(
            (int) $reserva['usuario_id'],
            $viajeId,
            $estado
        );

        Response::success(null, "Reserva actualizada a '$estado'");
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);

        $id           = (int) ($request->params['id'] ?? 0);
        $reservaModel = new Reserva();
        $reserva      = $reservaModel->findById($id);
        if (!$reserva) Response::error('Reserva no encontrada', 404);

        // Si la reserva no estaba cancelada, restaurar cupos antes de borrarla
        if ($reserva['estado'] !== 'Cancelada') {
            $personas   = (int) ($reserva['personas'] ?? 1);
            $viajeModel = new Viaje();
            $viajeModel->incrementSeats((int) $reserva['viaje_id'], $personas);
        }

        $reservaModel->delete($id);
        Response::success(null, 'Reserva eliminada');
    }
}
