<?php

class AdminCoversController {

    public static function index(Request $request): void {
        Middleware::adminOnly($request);
        $model = new CoverImagen();
        Response::success($model->listAll());
    }

    /**
     * Sube una imagen al header principal.
     * Acepta multipart con campo `imagen` o JSON con `{ url }` (URL externa).
     */
    public static function store(Request $request): void {
        Middleware::adminOnly($request);

        $isMultipart = !empty($_FILES) || str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');
        $orden       = (int) ($isMultipart ? ($_POST['orden'] ?? 0) : ($request->body['orden'] ?? 0));
        $urlExterna  = trim($isMultipart ? ($_POST['url'] ?? '') : ($request->body['url'] ?? ''));
        $finalUrl    = null;

        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] !== UPLOAD_ERR_NO_FILE) {
            $finalUrl = self::handleUpload($_FILES['imagen']);
        } elseif ($urlExterna !== '') {
            if (!filter_var($urlExterna, FILTER_VALIDATE_URL)) {
                Response::error('La URL externa no es válida');
            }
            $finalUrl = $urlExterna;
        } else {
            Response::error('Subí un archivo o pasá una URL externa');
        }

        $model = new CoverImagen();
        $id    = $model->create($finalUrl, $orden);
        $cover = $model->findById($id);

        Response::success($cover, 'Imagen agregada al header', 201);
    }

    public static function toggleVisible(Request $request): void {
        Middleware::adminOnly($request);
        $id = (int) ($request->params['id'] ?? 0);

        $model = new CoverImagen();
        $cover = $model->findById($id);
        if (!$cover) Response::error('Imagen no encontrada', 404);

        $nuevo = ((int) $cover['visible']) === 1 ? false : true;
        $model->setVisible($id, $nuevo);

        Response::success(
            ['visible' => $nuevo ? 1 : 0],
            $nuevo ? 'Imagen visible en el header' : 'Imagen oculta'
        );
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);
        $id = (int) ($request->params['id'] ?? 0);

        $model = new CoverImagen();
        $cover = $model->findById($id);
        if (!$cover) Response::error('Imagen no encontrada', 404);

        // Borrado best-effort del archivo físico si fue subido al servidor
        if (!empty($cover['url'])) {
            $filename = basename(parse_url($cover['url'], PHP_URL_PATH) ?? '');
            $path     = __DIR__ . '/../../uploads/covers/' . $filename;
            if ($filename !== '' && is_file($path)) {
                @unlink($path);
            }
        }

        $model->delete($id);
        Response::success(null, 'Imagen eliminada');
    }

    /**
     * Valida y mueve la imagen subida a uploads/covers/. Retorna la URL pública.
     * Aborta con Response::error si algo falla.
     */
    private static function handleUpload(array $file): string {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Error al subir la imagen. Intentá de nuevo.');
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

        if (!getimagesize($file['tmp_name'])) {
            Response::error('El archivo no es una imagen válida.');
        }

        $uploadDir = __DIR__ . '/../../uploads/covers/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = uniqid('cover_', true) . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            Response::error('No se pudo guardar la imagen en el servidor.');
        }

        $protocol  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host      = $_SERVER['HTTP_HOST'];
        $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        return "$protocol://$host$scriptDir/uploads/covers/$filename";
    }
}
