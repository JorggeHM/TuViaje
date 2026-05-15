<?php

class AdminExperienciasController {

    public static function index(Request $request): void {
        Middleware::adminOnly($request);
        $model = new Experiencia();
        Response::success($model->listAll());
    }

    public static function toggleVisible(Request $request): void {
        Middleware::adminOnly($request);
        $id = (int) ($request->params['id'] ?? 0);

        $model = new Experiencia();
        $exp   = $model->findById($id);
        if (!$exp) Response::error('Experiencia no encontrada', 404);

        $nuevoEstado = ((int) $exp['visible']) === 1 ? false : true;
        $model->setVisible($id, $nuevoEstado);

        Response::success(
            ['visible' => $nuevoEstado ? 1 : 0],
            $nuevoEstado ? 'Experiencia visible' : 'Experiencia oculta'
        );
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);
        $id = (int) ($request->params['id'] ?? 0);

        $model = new Experiencia();
        $exp   = $model->findById($id);
        if (!$exp) Response::error('Experiencia no encontrada', 404);

        // Borrado best-effort de la imagen subida al servidor (si aplica)
        if (!empty($exp['imagen'])) {
            $filename = basename(parse_url($exp['imagen'], PHP_URL_PATH) ?? '');
            $path     = __DIR__ . '/../../uploads/experiencias/' . $filename;
            if ($filename !== '' && is_file($path)) {
                @unlink($path);
            }
        }

        $model->delete($id);
        Response::success(null, 'Experiencia eliminada');
    }
}
