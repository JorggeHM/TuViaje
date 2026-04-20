<?php

class AuthController {
    public static function login(Request $request): void {
        $email    = trim($request->body['email'] ?? '');
        $password = $request->body['password'] ?? '';

        if (!$email || !$password) {
            Response::error('Email y contraseña requeridos');
        }

        $model   = new Usuario();
        $usuario = $model->findByEmail($email);

        if (!$usuario || !password_verify($password, $usuario['password'])) {
            Response::error('Credenciales incorrectas', 401);
        }

        if (!$usuario['activo']) {
            Response::error('Cuenta desactivada', 403);
        }

        $token = JWT::encode([
            'sub'   => $usuario['id'],
            'email' => $usuario['email'],
            'name'  => $usuario['name'],
            'rol'   => $usuario['rol'],
        ]);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'    => $usuario['id'],
                'name'  => $usuario['name'],
                'email' => $usuario['email'],
                'rol'   => $usuario['rol'],
            ],
        ], 'Login exitoso');
    }

    public static function register(Request $request): void {
        $name     = trim($request->body['name'] ?? '');
        $email    = trim($request->body['email'] ?? '');
        $password = $request->body['password'] ?? '';

        if (!$name || !$email || !$password) {
            Response::error('Nombre, email y contraseña requeridos');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido');
        }

        if (strlen($password) < 6) {
            Response::error('La contraseña debe tener al menos 6 caracteres');
        }

        $model = new Usuario();

        if ($model->findByEmail($email)) {
            Response::error('El email ya está registrado', 409);
        }

        $id      = $model->create($name, $email, $password);
        $usuario = $model->findById($id);

        $token = JWT::encode([
            'sub'   => $usuario['id'],
            'email' => $usuario['email'],
            'name'  => $usuario['name'],
            'rol'   => $usuario['rol'],
        ]);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'    => $usuario['id'],
                'name'  => $usuario['name'],
                'email' => $usuario['email'],
                'rol'   => $usuario['rol'],
            ],
        ], 'Registro exitoso', 201);
    }

    public static function me(Request $request): void {
        Middleware::auth($request);
        $model   = new Usuario();
        $usuario = $model->findById($request->user['sub']);

        if (!$usuario) {
            Response::error('Usuario no encontrado', 404);
        }

        Response::success($usuario);
    }

    public static function logout(Request $request): void {
        Response::success(null, 'Sesión cerrada');
    }

    public static function updateProfile(Request $request): void {
        Middleware::auth($request);

        $id    = (int) $request->user['sub'];
        $name  = trim($request->body['name']  ?? '');
        $email = trim($request->body['email'] ?? '');

        if (!$name || !$email) {
            Response::error('Nombre y email son requeridos');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido');
        }

        $model = new Usuario();

        // Verificar que el email no esté en uso por otro usuario
        $existing = $model->findByEmail($email);
        if ($existing && (int)$existing['id'] !== $id) {
            Response::error('El email ya está en uso por otra cuenta', 409);
        }

        $model->update($id, $name, $email);
        $usuario = $model->findById($id);

        // Re-emitir token con los datos actualizados
        $token = JWT::encode([
            'sub'   => $usuario['id'],
            'email' => $usuario['email'],
            'name'  => $usuario['name'],
            'rol'   => $usuario['rol'],
        ]);

        Response::success(['token' => $token, 'user' => $usuario], 'Perfil actualizado');
    }

    public static function updatePassword(Request $request): void {
        Middleware::auth($request);

        $id      = (int) $request->user['sub'];
        $current = $request->body['current_password'] ?? '';
        $new     = $request->body['new_password']     ?? '';

        if (!$current || !$new) {
            Response::error('Se requieren la contraseña actual y la nueva');
        }

        if (strlen($new) < 6) {
            Response::error('La nueva contraseña debe tener al menos 6 caracteres');
        }

        $model       = new Usuario();
        $currentHash = $model->findPasswordById($id);

        if (!$currentHash || !password_verify($current, $currentHash)) {
            Response::error('La contraseña actual es incorrecta', 401);
        }

        $model->updatePassword($id, $new);
        Response::success(null, 'Contraseña actualizada correctamente');
    }
}
