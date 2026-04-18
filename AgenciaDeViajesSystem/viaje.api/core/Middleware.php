<?php

class Middleware {
    public static function auth(Request $request): void {
        $header = $request->getHeader('Authorization');
        if (!$header || !preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
            Response::error('Token requerido', 401);
        }

        try {
            $payload = JWT::decode($m[1]);
            $request->user = $payload;
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 401);
        }
    }

    public static function adminOnly(Request $request): void {
        self::auth($request);
        if (($request->user['rol'] ?? '') !== 'admin') {
            Response::error('Acceso denegado: se requiere rol administrador', 403);
        }
    }
}
