<?php
declare(strict_types=1);

// ── Cargar variables de entorno desde .env ────────────────────────────────────
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$key, $val] = array_map('trim', explode('=', $line, 2));
        if ($key !== '') putenv("$key=$val");
    }
}

// ── CORS ─────────────────────────────────────────────────────────────────────
$corsOrigin = getenv('CORS_ORIGIN') ?: 'http://localhost:5173';
header("Access-Control-Allow-Origin: $corsOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Autoload ──────────────────────────────────────────────────────────────────
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/helpers/JWT.php';
require_once __DIR__ . '/helpers/Mailer.php';
require_once __DIR__ . '/helpers/Stripe.php';
require_once __DIR__ . '/helpers/MaintenanceJobs.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Middleware.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/models/Usuario.php';
require_once __DIR__ . '/models/Viaje.php';
require_once __DIR__ . '/models/Venta.php';
require_once __DIR__ . '/models/Reserva.php';
require_once __DIR__ . '/models/Experiencia.php';
require_once __DIR__ . '/models/PasswordReset.php';
require_once __DIR__ . '/models/Favorito.php';
require_once __DIR__ . '/models/CoverImagen.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ViajesController.php';
require_once __DIR__ . '/controllers/ReservasController.php';
require_once __DIR__ . '/controllers/ExperienciasController.php';
require_once __DIR__ . '/controllers/StatsController.php';
require_once __DIR__ . '/controllers/FavoritosController.php';
require_once __DIR__ . '/controllers/StripeWebhookController.php';
require_once __DIR__ . '/controllers/CoversController.php';
require_once __DIR__ . '/controllers/admin/AdminViajesController.php';
require_once __DIR__ . '/controllers/admin/AdminUsuariosController.php';
require_once __DIR__ . '/controllers/admin/AdminVentasController.php';
require_once __DIR__ . '/controllers/admin/AdminExperienciasController.php';
require_once __DIR__ . '/controllers/admin/AdminCoversController.php';
require_once __DIR__ . '/controllers/admin/AdminMaintenanceController.php';

// ── Rutas ─────────────────────────────────────────────────────────────────────
$router  = new Router();
$request = new Request();

// Auth
$router->post('/api/auth/login',    [AuthController::class, 'login']);
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->get( '/api/auth/me',       [AuthController::class, 'me']);
$router->post('/api/auth/logout',   [AuthController::class, 'logout']);

// Perfil de usuario
$router->put(   '/api/auth/perfil',   [AuthController::class, 'updateProfile']);
$router->put(   '/api/auth/password', [AuthController::class, 'updatePassword']);
$router->post(  '/api/auth/avatar',   [AuthController::class, 'updateAvatar']);
$router->delete('/api/auth/avatar',   [AuthController::class, 'removeAvatar']);

// Recuperación de contraseña (público)
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/api/auth/reset-password',  [AuthController::class, 'resetPassword']);

// Viajes públicos
$router->get('/api/viajes',      [ViajesController::class, 'index']);
$router->get('/api/viajes/{id}', [ViajesController::class, 'show']);

// Estadísticas públicas
$router->get('/api/stats', [StatsController::class, 'index']);

// Imágenes del header (público)
$router->get('/api/covers', [CoversController::class, 'index']);

// Webhook Stripe (sin auth — verificación por firma HMAC)
$router->post('/api/stripe/webhook', [StripeWebhookController::class, 'handle']);

// Reservas/Ventas (endpoint público para status de checkout)
$router->post( '/api/ventas',          [ReservasController::class, 'store']);
$router->get(  '/api/ventas/status',   [ReservasController::class, 'status']);
$router->get(  '/api/auth/ventas',     [ReservasController::class, 'misReservas']);
$router->patch('/api/ventas/{id}',     [ReservasController::class, 'cancel']);

// Favoritos
$router->get(   '/api/favoritos',              [FavoritosController::class, 'index']);
$router->get(   '/api/favoritos/ids',          [FavoritosController::class, 'ids']);
$router->post(  '/api/favoritos',              [FavoritosController::class, 'store']);
$router->delete('/api/favoritos/{viajeId}',    [FavoritosController::class, 'destroy']);

// Experiencias
$router->get(   '/api/experiencias',           [ExperienciasController::class, 'index']);
$router->post(  '/api/experiencias',           [ExperienciasController::class, 'store']);
$router->put(   '/api/experiencias/{id}',      [ExperienciasController::class, 'update']);
$router->delete('/api/experiencias/{id}',      [ExperienciasController::class, 'destroy']);
$router->patch( '/api/experiencias/{id}/like', [ExperienciasController::class, 'like']);

// Admin — viajes
$router->get(   '/api/admin/viajes',               [AdminViajesController::class, 'index']);
$router->post(  '/api/admin/viajes',               [AdminViajesController::class, 'store']);
$router->put(   '/api/admin/viajes/{id}',          [AdminViajesController::class, 'update']);
$router->patch( '/api/admin/viajes/{id}/finalizar',[AdminViajesController::class, 'finalizar']);
$router->delete('/api/admin/viajes/{id}',          [AdminViajesController::class, 'destroy']);

// Admin — usuarios
$router->get(   '/api/admin/usuarios',            [AdminUsuariosController::class, 'index']);
$router->patch( '/api/admin/usuarios/{id}/estado',[AdminUsuariosController::class, 'toggleEstado']);
$router->delete('/api/admin/usuarios/{id}',       [AdminUsuariosController::class, 'destroy']);

// Admin — ventas
$router->get(  '/api/admin/ventas',              [AdminVentasController::class, 'index']);
$router->get(  '/api/admin/ventas/stats',        [AdminVentasController::class, 'stats']);
$router->patch('/api/admin/ventas/{id}/estado',  [AdminVentasController::class, 'updateEstado']);
$router->post( '/api/admin/ventas/{id}/refund',  [AdminVentasController::class, 'refund']);

// Admin — experiencias
$router->get(   '/api/admin/experiencias',                [AdminExperienciasController::class, 'index']);
$router->patch( '/api/admin/experiencias/{id}/visible',   [AdminExperienciasController::class, 'toggleVisible']);
$router->delete('/api/admin/experiencias/{id}',           [AdminExperienciasController::class, 'destroy']);

// Admin — imágenes del header
$router->get(   '/api/admin/covers',                      [AdminCoversController::class, 'index']);
$router->post(  '/api/admin/covers',                      [AdminCoversController::class, 'store']);
$router->patch( '/api/admin/covers/{id}/visible',         [AdminCoversController::class, 'toggleVisible']);
$router->delete('/api/admin/covers/{id}',                 [AdminCoversController::class, 'destroy']);

// Admin — mantenimiento
$router->post('/api/admin/maintenance/cleanup-pendientes', [AdminMaintenanceController::class, 'cleanupPendientes']);
$router->delete('/api/admin/maintenance/pending-reservas', [AdminMaintenanceController::class, 'deletePendingReservations']);

try {
    $router->dispatch($request);
} catch (\Throwable $e) {
    Response::error('Error interno del servidor: ' . $e->getMessage(), 500);
}
