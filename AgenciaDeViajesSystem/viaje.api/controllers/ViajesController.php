<?php

class ViajesController {
    public static function index(Request $request): void {
        $model  = new Viaje();
        $viajes = $model->listActivos();
        Response::success($viajes);
    }

    public static function show(Request $request): void {
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Viaje();
        $viaje = $model->findById($id);

        if (!$viaje) {
            Response::error('Viaje no encontrado', 404);
        }

        Response::success($viaje);
    }
}
