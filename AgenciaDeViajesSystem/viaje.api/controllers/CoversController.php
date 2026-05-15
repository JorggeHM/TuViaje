<?php

class CoversController {

    /** Endpoint público: lista las imágenes visibles del header. */
    public static function index(Request $request): void {
        $model = new CoverImagen();
        Response::success($model->listVisibles());
    }
}
