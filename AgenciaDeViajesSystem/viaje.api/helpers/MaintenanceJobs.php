<?php

class MaintenanceJobs {
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

    public static function deleteAllPendingReservas(): array {
        $db     = Database::connect();
        $inicio = microtime(true);

        $db->beginTransaction();

        try {
            $stmt = $db->prepare(
                "SELECT id, viaje_id, personas
                 FROM reservas
                 WHERE estado = 'Pendiente'
                 FOR UPDATE"
            );
            $stmt->execute();
            $reservas = $stmt->fetchAll();

            $procesadas = 0;
            if (!empty($reservas)) {
                $seatStmt   = $db->prepare("UPDATE viajes SET available_seats = available_seats + ? WHERE id = ?");
                $deleteStmt = $db->prepare("DELETE FROM reservas WHERE id = ?");

                foreach ($reservas as $r) {
                    $seatStmt->execute([(int) $r['personas'], (int) $r['viaje_id']]);
                    $deleteStmt->execute([(int) $r['id']]);
                    $procesadas++;
                }
            }

            $db->commit();

            return [
                'procesadas'  => $procesadas,
                'duracion_ms' => (int) round((microtime(true) - $inicio) * 1000),
            ];
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }
}
