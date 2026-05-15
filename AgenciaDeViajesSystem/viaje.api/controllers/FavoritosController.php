<?php

class FavoritosController {

    public static function index(Request $request): void {
        Middleware::auth($request);
        $usuarioId = (int) $request->user['sub'];

        $model = new Favorito();
        Response::success($model->listByUsuario($usuarioId));
    }

    public static function ids(Request $request): void {
        Middleware::auth($request);
        $usuarioId = (int) $request->user['sub'];

        $model = new Favorito();
        Response::success($model->listIdsByUsuario($usuarioId));
    }

    public static function store(Request $request): void {
        Middleware::auth($request);
        $usuarioId = (int) $request->user['sub'];
        $viajeId   = (int) ($request->body['viaje_id'] ?? 0);

        if ($viajeId <= 0) Response::error('viaje_id requerido');

        $viajeModel = new Viaje();
        if (!$viajeModel->findById($viajeId)) {
            Response::error('Viaje no encontrado', 404);
        }

        $model = new Favorito();
        $added = $model->add($usuarioId, $viajeId);

        Response::success(
            ['viaje_id' => $viajeId],
            $added ? 'Agregado a favoritos' : 'Ya estaba en favoritos',
            201
        );
    }

    public static function destroy(Request $request): void {
        Middleware::auth($request);
        $usuarioId = (int) $request->user['sub'];
        $viajeId   = (int) ($request->params['viajeId'] ?? 0);

        if ($viajeId <= 0) Response::error('viaje_id inválido');

        $model = new Favorito();
        $model->remove($usuarioId, $viajeId);

        Response::success(null, 'Eliminado de favoritos');
    }
}
