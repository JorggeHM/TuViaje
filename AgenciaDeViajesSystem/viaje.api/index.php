<?php
declare(strict_types=1);

// ── CORS ─────────────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: http://localhost:5173');
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
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Middleware.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/models/Usuario.php';
require_once __DIR__ . '/models/Viaje.php';
require_once __DIR__ . '/models/Venta.php';
require_once __DIR__ . '/models/Reserva.php';
require_once __DIR__ . '/models/Experiencia.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ViajesController.php';
require_once __DIR__ . '/controllers/ReservasController.php';
require_once __DIR__ . '/controllers/ExperienciasController.php';
require_once __DIR__ . '/controllers/admin/AdminViajesController.php';
require_once __DIR__ . '/controllers/admin/AdminUsuariosController.php';
require_once __DIR__ . '/controllers/admin/AdminVentasController.php';

// ── Rutas ─────────────────────────────────────────────────────────────────────
$router  = new Router();
$request = new Request();

// Auth
$router->post('/api/auth/login',    [AuthController::class, 'login']);
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->get( '/api/auth/me',       [AuthController::class, 'me']);
$router->post('/api/auth/logout',   [AuthController::class, 'logout']);

// Viajes públicos
$router->get('/api/viajes',      [ViajesController::class, 'index']);
$router->get('/api/viajes/{id}', [ViajesController::class, 'show']);

// Reservas
$router->post( '/api/reservas',          [ReservasController::class, 'store']);
$router->get(  '/api/auth/reservas',     [ReservasController::class, 'misReservas']);
$router->patch('/api/reservas/{id}',     [ReservasController::class, 'cancel']);

// Experiencias
$router->get(  '/api/experiencias',          [ExperienciasController::class, 'index']);
$router->post( '/api/experiencias',          [ExperienciasController::class, 'store']);
$router->patch('/api/experiencias/{id}/like',[ExperienciasController::class, 'like']);

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
$router->get('/api/admin/ventas',       [AdminVentasController::class, 'index']);
$router->get('/api/admin/ventas/stats', [AdminVentasController::class, 'stats']);

// ── Dispatch ──────────────────────────────────────────────────────────────────
try {
    $router->dispatch($request);
} catch (\Throwable $e) {
    Response::error('Error interno del servidor: ' . $e->getMessage(), 500);
}
