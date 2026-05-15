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
            'sub'        => $usuario['id'],
            'email'      => $usuario['email'],
            'name'       => $usuario['name'],
            'rol'        => $usuario['rol'],
            'avatar_url' => $usuario['avatar_url'] ?? null,
        ]);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'         => $usuario['id'],
                'name'       => $usuario['name'],
                'email'      => $usuario['email'],
                'rol'        => $usuario['rol'],
                'avatar_url' => $usuario['avatar_url'] ?? null,
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

        // Best-effort: el fallo del email no debe bloquear el registro
        Mailer::sendBienvenida($usuario['name'], $usuario['email']);

        $token = JWT::encode([
            'sub'        => $usuario['id'],
            'email'      => $usuario['email'],
            'name'       => $usuario['name'],
            'rol'        => $usuario['rol'],
            'avatar_url' => $usuario['avatar_url'] ?? null,
        ]);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'         => $usuario['id'],
                'name'       => $usuario['name'],
                'email'      => $usuario['email'],
                'rol'        => $usuario['rol'],
                'avatar_url' => $usuario['avatar_url'] ?? null,
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
            'sub'        => $usuario['id'],
            'email'      => $usuario['email'],
            'name'       => $usuario['name'],
            'rol'        => $usuario['rol'],
            'avatar_url' => $usuario['avatar_url'] ?? null,
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

    /**
     * Solicita un enlace de restablecimiento. Por seguridad responde 200
     * incluso cuando el email no existe, para no revelar usuarios.
     */
    public static function forgotPassword(Request $request): void {
        $email = trim($request->body['email'] ?? '');
        $genericOk = 'Si el email está registrado, te enviamos un enlace para restablecer la contraseña.';

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido');
        }

        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findByEmail($email);

        if (!$usuario || !$usuario['activo']) {
            Response::success(null, $genericOk);
        }

        $token     = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $resetModel = new PasswordReset();
        $resetModel->invalidateAllForUser((int) $usuario['id']);
        $resetModel->create((int) $usuario['id'], $tokenHash, 3600);

        Mailer::sendPasswordReset($usuario['name'], $usuario['email'], $token);

        Response::success(null, $genericOk);
    }

    public static function resetPassword(Request $request): void {
        $token = (string) ($request->body['token']        ?? '');
        $new   = (string) ($request->body['new_password'] ?? '');

        if (!$token)            Response::error('Token requerido');
        if (strlen($new) < 6)   Response::error('La nueva contraseña debe tener al menos 6 caracteres');

        $tokenHash = hash('sha256', $token);

        $resetModel = new PasswordReset();
        $row        = $resetModel->findValidByTokenHash($tokenHash);

        if (!$row) Response::error('El enlace es inválido o expiró', 400);

        $usuarioModel = new Usuario();
        $usuario      = $usuarioModel->findById((int) $row['usuario_id']);

        if (!$usuario || !$usuario['activo']) {
            Response::error('No es posible restablecer la contraseña para esta cuenta', 400);
        }

        $usuarioModel->updatePassword((int) $usuario['id'], $new);
        $resetModel->markUsed((int) $row['id']);

        Response::success(null, 'Contraseña restablecida correctamente');
    }

    /**
     * Actualiza la foto de perfil del usuario autenticado.
     * Acepta multipart con campo `imagen` o JSON con `{ avatar_url }` (URL externa).
     */
    public static function updateAvatar(Request $request): void {
        Middleware::auth($request);
        $id = (int) $request->user['sub'];

        $isMultipart = !empty($_FILES) || str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');
        $urlExterna  = trim($isMultipart ? ($_POST['avatar_url'] ?? '') : ($request->body['avatar_url'] ?? ''));
        $finalUrl    = null;

        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] !== UPLOAD_ERR_NO_FILE) {
            $finalUrl = self::handleAvatarUpload($_FILES['imagen']);
        } elseif ($urlExterna !== '') {
            if (!filter_var($urlExterna, FILTER_VALIDATE_URL)) {
                Response::error('La URL no es válida');
            }
            $finalUrl = $urlExterna;
        } else {
            Response::error('Subí una imagen o pasá una URL');
        }

        $model = new Usuario();

        // Si el avatar anterior fue subido al servidor, lo borramos para no acumular basura
        $anterior = $model->findById($id);
        self::cleanupOldAvatar($anterior['avatar_url'] ?? null);

        $model->updateAvatar($id, $finalUrl);
        $usuario = $model->findById($id);

        // Re-emitir token para que el front lo tenga al refrescar
        $token = JWT::encode([
            'sub'        => $usuario['id'],
            'email'      => $usuario['email'],
            'name'       => $usuario['name'],
            'rol'        => $usuario['rol'],
            'avatar_url' => $usuario['avatar_url'] ?? null,
        ]);

        Response::success(['token' => $token, 'user' => $usuario], 'Foto de perfil actualizada');
    }

    /**
     * Elimina la foto de perfil del usuario autenticado.
     * Si el avatar estaba alojado en el servidor, borra también el archivo físico.
     */
    public static function removeAvatar(Request $request): void {
        Middleware::auth($request);
        $id = (int) $request->user['sub'];

        $model    = new Usuario();
        $anterior = $model->findById($id);
        self::cleanupOldAvatar($anterior['avatar_url'] ?? null);

        $model->updateAvatar($id, null);
        $usuario = $model->findById($id);

        $token = JWT::encode([
            'sub'        => $usuario['id'],
            'email'      => $usuario['email'],
            'name'       => $usuario['name'],
            'rol'        => $usuario['rol'],
            'avatar_url' => null,
        ]);

        Response::success(['token' => $token, 'user' => $usuario], 'Foto de perfil eliminada');
    }

    /**
     * Valida y mueve el avatar subido a uploads/avatars/. Retorna la URL pública.
     * Aborta con Response::error si algo falla.
     */
    private static function handleAvatarUpload(array $file): string {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Error al subir la imagen. Intentá de nuevo.');
        }

        $maxBytes = 3 * 1024 * 1024; // 3 MB
        if ($file['size'] > $maxBytes) {
            Response::error('La imagen no puede superar 3 MB.');
        }

        $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($ext, $allowed, true)) {
            Response::error('Solo se permiten imágenes JPG, PNG o WEBP.');
        }

        if (!getimagesize($file['tmp_name'])) {
            Response::error('El archivo no es una imagen válida.');
        }

        $uploadDir = __DIR__ . '/../uploads/avatars/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = uniqid('avatar_', true) . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            Response::error('No se pudo guardar la imagen en el servidor.');
        }

        $protocol  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host      = $_SERVER['HTTP_HOST'];
        $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        return "$protocol://$host$scriptDir/uploads/avatars/$filename";
    }

    /**
     * Borra de forma best-effort el archivo físico del avatar anterior, solo si
     * vivía en uploads/avatars/. URLs externas no se tocan.
     */
    private static function cleanupOldAvatar(?string $url): void {
        if (!$url) return;
        $path = parse_url($url, PHP_URL_PATH) ?? '';
        if (!str_contains($path, '/uploads/avatars/')) return;
        $filename = basename($path);
        $absolute = __DIR__ . '/../uploads/avatars/' . $filename;
        if ($filename !== '' && is_file($absolute)) {
            @unlink($absolute);
        }
    }
}
