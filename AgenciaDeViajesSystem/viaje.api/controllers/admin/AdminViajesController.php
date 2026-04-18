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
        Response::success(null, 'Estado actualizado');
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Viaje();

        if (!$model->findById($id)) {
            Response::error('Viaje no encontrado', 404);
        }

        $model->delete($id);
        Response::success(null, 'Viaje eliminado');
    }
}
