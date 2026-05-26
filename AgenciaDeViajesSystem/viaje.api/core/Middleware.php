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

        // Revalidación contra BD: el JWT puede seguir siendo válido 
        // pero la cuenta haber sido desactivada o eliminada por el admin desde su emisión.
        $usuario = (new Usuario())->findById((int) ($payload['sub'] ?? 0));
        if (!$usuario) {
            Response::error('La cuenta ya no existe', 401);
        }
        if (!$usuario['activo']) {
            // 401 (no 403) para que el interceptor del frontend cierre sesión y redirija al login.
            Response::error('Cuenta desactivada', 401);
        }
    }

    public static function adminOnly(Request $request): void {
        self::auth($request);
        if (($request->user['rol'] ?? '') !== 'admin') {
            Response::error('Acceso denegado: se requiere rol administrador', 403);
        }
    }
}
