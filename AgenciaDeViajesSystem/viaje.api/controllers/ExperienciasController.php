<?php

class ExperienciasController {

    public static function index(Request $request): void {
        $minRating = (int) ($_GET['minRating'] ?? $request->params['minRating'] ?? 1);
        if ($minRating < 1 || $minRating > 5) $minRating = 1;

        $model = new Experiencia();
        Response::success($model->list($minRating));
    }

    public static function store(Request $request): void {
        Middleware::auth($request);

        // Soporta JSON (sin imagen) y multipart/form-data (con imagen)
        $isMultipart = !empty($_FILES) || str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');

        $destino = trim($isMultipart ? ($_POST['destino'] ?? '') : ($request->body['destino'] ?? ''));
        $rating  = (int) ($isMultipart ? ($_POST['rating']  ?? 0) : ($request->body['rating']  ?? 0));
        $texto   = trim($isMultipart ? ($_POST['texto']   ?? '') : ($request->body['texto']   ?? ''));

        if (!$destino)                  Response::error('El destino es requerido');
        if ($rating < 1 || $rating > 5) Response::error('El rating debe estar entre 1 y 5');
        if (!$texto)                    Response::error('El texto es requerido');

        $imagenUrl = null;

        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] !== UPLOAD_ERR_NO_FILE) {
            $file  = $_FILES['imagen'];

            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::error('Error al subir la imagen. Intenta de nuevo.');
            }

            $maxBytes = 5 * 1024 * 1024; // 5 MB
            if ($file['size'] > $maxBytes) {
                Response::error('La imagen no puede superar 5 MB.');
            }

            $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            if (!in_array($ext, $allowed, true)) {
                Response::error('Solo se permiten imágenes JPG, PNG o WEBP.');
            }

            // Verificar que sea realmente una imagen
            if (!getimagesize($file['tmp_name'])) {
                Response::error('El archivo no es una imagen válida.');
            }

            $uploadDir = __DIR__ . '/../uploads/experiencias/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $filename = uniqid('exp_', true) . '.' . $ext;
            if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                Response::error('No se pudo guardar la imagen en el servidor.');
            }

            $protocol  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host      = $_SERVER['HTTP_HOST'];
            $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
            $imagenUrl = "$protocol://$host$scriptDir/uploads/experiencias/$filename";
        }

        $usuarioId = (int) $request->user['sub'];
        $model = new Experiencia();
        $id = $model->create($usuarioId, [
            'destino' => $destino,
            'rating'  => $rating,
            'texto'   => $texto,
            'imagen'  => $imagenUrl,
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
