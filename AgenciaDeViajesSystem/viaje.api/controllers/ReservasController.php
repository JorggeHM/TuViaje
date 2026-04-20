<?php

class ReservasController {

    public static function store(Request $request): void {
        Middleware::auth($request);

        $viajeId  = (int)   ($request->body['viaje_id']  ?? 0);
        $personas = (int)   ($request->body['personas']  ?? 1);

        if ($viajeId <= 0)  Response::error('viaje_id requerido');
        if ($personas < 1)  Response::error('personas debe ser al menos 1');

        $viajeModel = new Viaje();
        $viaje = $viajeModel->findById($viajeId);

        if (!$viaje)                               Response::error('Viaje no encontrado', 404);
        if ($viaje['estado'] !== 'Activo')         Response::error('El viaje no está disponible');
        if ($viaje['available_seats'] < $personas) Response::error('No hay suficientes cupos disponibles');

        $monto       = (float) $viaje['price'] * $personas;
        $usuarioId   = (int) $request->user['sub'];

        $reservaModel = new Reserva();
        $ventaModel   = new Venta();

        $reservaId = $reservaModel->create($usuarioId, $viajeId, $monto);
        $reservaModel->updateEstado($reservaId, 'Confirmada');

        $ventaId = $ventaModel->create($usuarioId, $viajeId, $monto);
        $ventaModel->updateEstado($ventaId, 'Confirmada');

        $nuevosAsientos = $viaje['available_seats'] - $personas;
        $viajeModel->update($viajeId, ['available_seats' => $nuevosAsientos]);

        $reserva = $reservaModel->findById($reservaId);
        Response::success($reserva, 'Reserva creada exitosamente', 201);
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

        if (!$reserva)                             Response::error('Reserva no encontrada', 404);
        if ((int) $reserva['usuario_id'] !== $usuarioId) Response::error('No autorizado', 403);
        if ($reserva['estado'] === 'Cancelada')    Response::error('La reserva ya está cancelada');

        $model->updateEstado($id, 'Cancelada');

        $viajeModel = new Viaje();
        $viaje = $viajeModel->findById((int) $reserva['viaje_id']);
        if ($viaje) {
            $personas = (int) round($reserva['monto'] / $viaje['price']);
            $viajeModel->update((int) $reserva['viaje_id'], [
                'available_seats' => $viaje['available_seats'] + $personas,
            ]);
        }

        Response::success(null, 'Reserva cancelada');
    }
}
