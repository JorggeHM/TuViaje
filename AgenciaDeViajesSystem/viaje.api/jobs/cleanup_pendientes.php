<?php
/**
 * cleanup_pendientes.php — Limpia reservas Pendientes abandonadas.
 *
 * Cancela toda reserva con estado=Pendiente cuya fecha_reserva sea más vieja
 * que el cutoff (default 30 min) y libera los cupos correspondientes.
 *
 * Stripe envía `checkout.session.expired` recién a las 24 horas, lo que
 * deja cupos retenidos durante demasiado tiempo si el usuario abandona
 * el checkout sin pagar. Este job acorta esa ventana.
 *
 * Uso:
 *   php jobs/cleanup_pendientes.php              # cutoff 30 min (default)
 *   php jobs/cleanup_pendientes.php --minutes=15 # cutoff personalizado
 *
 * Programación recomendada (cron Linux, cada 10 min):
 *   *\/10 * * * * /usr/bin/php /ruta/a/viaje.api/jobs/cleanup_pendientes.php
 *
 * En Windows usar Task Scheduler con acción:
 *   Program/script: C:\xampp\php\php.exe
 *   Arguments:      C:\ruta\a\viaje.api\jobs\cleanup_pendientes.php
 *   Trigger:        Repeat every 10 minutes
 */

declare(strict_types=1);

// ── Cargar variables de entorno desde .env ────────────────────────────────
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$key, $val] = array_map('trim', explode('=', $line, 2));
        if ($key !== '') putenv("$key=$val");
    }
}

// ── Bootstrap mínimo ───────────────────────────────────────────────────────
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/MaintenanceJobs.php';

// ── Parsear flags ──────────────────────────────────────────────────────────
$minutes = 30;
foreach ($argv as $arg) {
    if (preg_match('/^--minutes=(\d+)$/', $arg, $m)) {
        $minutes = (int) $m[1];
    }
}

// ── Ejecutar ───────────────────────────────────────────────────────────────
try {
    $r = MaintenanceJobs::cleanupPendingReservas($minutes);
    echo "[" . date('Y-m-d H:i:s') . "] cleanup_pendientes: "
       . "{$r['procesadas']} reserva(s) canceladas "
       . "(cutoff={$r['cutoff_minutes']}min, {$r['duracion_ms']}ms)\n";
    exit(0);
} catch (\Throwable $e) {
    fwrite(STDERR, "[" . date('Y-m-d H:i:s') . "] cleanup_pendientes ERROR: " . $e->getMessage() . "\n");
    exit(1);
}
