<?php

/**
 * MaintenanceJobs — Tareas de mantenimiento reutilizables.
 *
 * Estos métodos se invocan tanto desde scripts CLI (jobs/*.php, vía cron)
 * como desde endpoints admin del backend. La lógica vive acá para no
 * duplicarla en ambos lugares.
 */
class MaintenanceJobs {

    /**
     * Cancela reservas con estado=Pendiente cuya fecha_reserva sea más vieja
     * que $minutes y libera los cupos asociados.
     *
     * Stripe envía checkout.session.expired recién a las 24 h, lo que deja
     * cupos retenidos por demasiado tiempo cuando el usuario abandona el
     * checkout. Este job acorta esa ventana.
     *
     * @return array{procesadas:int, cutoff_minutes:int, duracion_ms:int}
     */
    public static function cleanupPendingReservas(int $minutes = 30): array {
        if ($minutes < 1) {
            throw new \InvalidArgumentException('minutes debe ser >= 1');
        }

        $db    = Database::connect();
        $inicio = microtime(true);

        $db->beginTransaction();

        try {
            $stmt = $db->prepare(
                "SELECT id, viaje_id, personas
                 FROM reservas
                 WHERE estado = 'Pendiente'
                   AND fecha_reserva < (NOW() - INTERVAL ? MINUTE)
                 FOR UPDATE"
            );
            $stmt->execute([$minutes]);
            $reservas = $stmt->fetchAll();

            $procesadas = 0;
            if (!empty($reservas)) {
                $cancelStmt = $db->prepare("UPDATE reservas SET estado = 'Cancelada' WHERE id = ?");
                $seatStmt   = $db->prepare("UPDATE viajes SET available_seats = available_seats + ? WHERE id = ?");

                foreach ($reservas as $r) {
                    $cancelStmt->execute([(int) $r['id']]);
                    $seatStmt->execute([(int) $r['personas'], (int) $r['viaje_id']]);
                    $procesadas++;
                }
            }

            $db->commit();

            return [
                'procesadas'     => $procesadas,
                'cutoff_minutes' => $minutes,
                'duracion_ms'    => (int) round((microtime(true) - $inicio) * 1000),
            ];
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }
}
