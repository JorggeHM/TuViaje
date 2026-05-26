<?php

class AdminMaintenanceController {

    /**
     * POST /api/admin/maintenance/cleanup-pendientes
     * Body opcional: { "minutes": 30 }
     *
     * Dispara manualmente la limpieza de reservas Pendientes viejas.
     * El mismo job corre automáticamente vía cron (ver jobs/cleanup_pendientes.php).
     */
    public static function cleanupPendientes(Request $request): void {
        Middleware::adminOnly($request);

        $minutes = (int) ($request->body['minutes'] ?? 30);
        if ($minutes < 1 || $minutes > 1440) {
            Response::error('El parámetro minutes debe estar entre 1 y 1440 (24 h)');
        }

        try {
            $resultado = MaintenanceJobs::cleanupPendingReservas($minutes);
            Response::success($resultado, "Cleanup completado: {$resultado['procesadas']} reserva(s) canceladas");
        } catch (\Throwable $e) {
            Response::error('Error al ejecutar cleanup: ' . $e->getMessage(), 500);
        }
    }

    public static function deletePendingReservations(Request $request): void {
        Middleware::adminOnly($request);

        try {
            $resultado = MaintenanceJobs::deleteAllPendingReservas();
            Response::success($resultado, "Eliminadas {$resultado['procesadas']} reserva(s) pendientes");
        } catch (\Throwable $e) {
            Response::error('Error al eliminar reservas pendientes: ' . $e->getMessage(), 500);
        }
    }
}
