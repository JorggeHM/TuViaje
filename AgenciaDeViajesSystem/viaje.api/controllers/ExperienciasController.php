<?php

class ExperienciasController {

    public static function index(Request $request): void {
        $minRating = (int) ($request->params['minRating'] ?? 1);
        if ($minRating < 1 || $minRating > 5) $minRating = 1;

        $model = new Experiencia();
        Response::success($model->list($minRating));
    }

    public static function store(Request $request): void {
        Middleware::auth($request);

        $destino = trim($request->body['destino'] ?? '');
        $rating  = (int) ($request->body['rating']  ?? 0);
        $texto   = trim($request->body['texto']   ?? '');
        $imagen  = trim($request->body['imagen']  ?? '') ?: null;

        if (!$destino)             Response::error('El destino es requerido');
        if ($rating < 1 || $rating > 5) Response::error('El rating debe estar entre 1 y 5');
        if (!$texto)               Response::error('El texto es requerido');

        $usuarioId = (int) $request->user['sub'];
        $model = new Experiencia();
        $id = $model->create($usuarioId, [
            'destino' => $destino,
            'rating'  => $rating,
            'texto'   => $texto,
            'imagen'  => $imagen,
        ]);

        $experiencias = $model->list(1);
        $nueva = array_values(array_filter($experiencias, fn($e) => (int)$e['id'] === $id))[0] ?? null;
        Response::success($nueva, 'Experiencia publicada', 201);
    }

    public static function like(Request $request): void {
        Middleware::auth($request);

        $id = (int) ($request->params['id'] ?? 0);
        if ($id <= 0) Response::error('ID inválido', 400);

        $model = new Experiencia();
        if (!$model->incrementLike($id)) Response::error('Experiencia no encontrada', 404);

        Response::success(null, 'Like registrado');
    }
}
