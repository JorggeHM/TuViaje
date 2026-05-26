<?php

class CoversController {

    public static function index(Request $request): void {
        $model = new CoverImagen();
        Response::success($model->listVisibles());
    }
}
