<?php

class AdminUsuariosController {
    public static function index(Request $request): void {
        Middleware::adminOnly($request);
        $model = new Usuario();
        Response::success($model->list());
    }

    public static function toggleEstado(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Usuario();

        if (!$model->findById($id)) {
            Response::error('Usuario no encontrado', 404);
        }

        $model->toggleActivo($id);
        Response::success(null, 'Estado actualizado');
    }

    public static function destroy(Request $request): void {
        Middleware::adminOnly($request);
        $id    = (int) ($request->params['id'] ?? 0);
        $model = new Usuario();

        if (!$model->findById($id)) {
            Response::error('Usuario no encontrado', 404);
        }

        $model->delete($id);
        Response::success(null, 'Usuario eliminado');
    }
}
