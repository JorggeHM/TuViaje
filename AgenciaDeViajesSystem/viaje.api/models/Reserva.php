<?php

class Reserva {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function create(int $usuarioId, int $viajeId, float $monto): int {
        $stmt = $this->db->prepare(
            'INSERT INTO reservas (usuario_id, viaje_id, monto) VALUES (?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $viajeId, $monto]);
        return (int) $this->db->lastInsertId();
    }

    public function listByUsuario(int $usuarioId): array {
        $stmt = $this->db->prepare(
            'SELECT r.*, v.title, v.destination, v.start_date, v.end_date, v.imagen_url
             FROM reservas r
             JOIN viajes v ON v.id = r.viaje_id
             WHERE r.usuario_id = ?
             ORDER BY r.fecha_reserva DESC'
        );
        $stmt->execute([$usuarioId]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT r.*, v.title, v.destination, v.start_date, v.end_date, v.imagen_url
             FROM reservas r
             JOIN viajes v ON v.id = r.viaje_id
             WHERE r.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function updateEstado(int $id, string $estado): bool {
        $stmt = $this->db->prepare('UPDATE reservas SET estado = ? WHERE id = ?');
        $stmt->execute([$estado, $id]);
        return $stmt->rowCount() > 0;
    }
}
