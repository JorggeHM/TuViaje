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
}
