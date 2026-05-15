<?php

class Reserva {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function create(int $usuarioId, int $viajeId, float $monto, int $personas = 1): int {
        $stmt = $this->db->prepare(
            'INSERT INTO reservas (usuario_id, viaje_id, monto, personas) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $viajeId, $monto, $personas]);
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

    public function findLastByUsuarioViaje(int $usuarioId, int $viajeId): ?array {
        $stmt = $this->db->prepare(
            'SELECT * FROM reservas WHERE usuario_id = ? AND viaje_id = ?
             ORDER BY fecha_reserva DESC LIMIT 1'
        );
        $stmt->execute([$usuarioId, $viajeId]);
        return $stmt->fetch() ?: null;
    }

    public function updateEstadoByVenta(int $usuarioId, int $viajeId, string $estado): void {
        $stmt = $this->db->prepare(
            'UPDATE reservas SET estado = ? WHERE usuario_id = ? AND viaje_id = ? AND estado != "Cancelada"'
        );
        $stmt->execute([$estado, $usuarioId, $viajeId]);
    }

    /** Reservas no canceladas de un usuario — usado para liberar cupos antes de eliminar la cuenta. */
    public function listActivasByUsuario(int $usuarioId): array {
        $stmt = $this->db->prepare(
            "SELECT id, viaje_id, personas, estado, stripe_session_id
             FROM reservas
             WHERE usuario_id = ? AND estado != 'Cancelada'"
        );
        $stmt->execute([$usuarioId]);
        return $stmt->fetchAll();
    }

    /** Reservas Pendientes de un viaje — usado al finalizar el viaje para limpiarlas. */
    public function listPendientesByViaje(int $viajeId): array {
        $stmt = $this->db->prepare(
            "SELECT id, usuario_id FROM reservas WHERE viaje_id = ? AND estado = 'Pendiente'"
        );
        $stmt->execute([$viajeId]);
        return $stmt->fetchAll();
    }

    /** Reservas pagadas vía Stripe y aún activas de un viaje — usado para refundar antes de eliminarlo. */
    public function listActivasConStripeByViaje(int $viajeId): array {
        $stmt = $this->db->prepare(
            "SELECT id, usuario_id, personas, estado, stripe_session_id
             FROM reservas
             WHERE viaje_id = ? AND estado != 'Cancelada'
               AND stripe_session_id IS NOT NULL AND stripe_session_id != ''"
        );
        $stmt->execute([$viajeId]);
        return $stmt->fetchAll();
    }

    /** Lista TODAS las reservas con datos del usuario y viaje — solo admin. */
    public function listAll(array $filters = []): array {
        $sql = 'SELECT r.*, u.name AS usuario_nombre, u.email AS usuario_email,
                       v.title AS viaje_titulo, v.destination AS viaje_destino,
                       v.start_date, v.imagen_url
                FROM reservas r
                JOIN usuarios u ON u.id = r.usuario_id
                JOIN viajes   v ON v.id = r.viaje_id
                WHERE 1=1';
        $params = [];

        if (!empty($filters['estado'])) {
            $sql    .= ' AND r.estado = ?';
            $params[] = $filters['estado'];
        }
        if (!empty($filters['q'])) {
            $sql    .= ' AND (u.name LIKE ? OR u.email LIKE ? OR v.title LIKE ? OR v.destination LIKE ?)';
            $like    = '%' . $filters['q'] . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $sql .= ' ORDER BY r.fecha_reserva DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM reservas WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function setStripeSession(int $id, string $sessionId): bool {
        $stmt = $this->db->prepare('UPDATE reservas SET stripe_session_id = ? WHERE id = ?');
        $stmt->execute([$sessionId, $id]);
        return $stmt->rowCount() > 0;
    }

    /** Devuelve solo {id, estado} — para consultas públicas tras la redirección de Stripe. */
    public function findStatusBySessionId(string $sessionId): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, estado FROM reservas WHERE stripe_session_id = ? LIMIT 1'
        );
        $stmt->execute([$sessionId]);
        return $stmt->fetch() ?: null;
    }

    public function findByStripeSessionId(string $sessionId): ?array {
        $stmt = $this->db->prepare(
            'SELECT r.*, v.title, v.destination, v.start_date, v.end_date, v.imagen_url
             FROM reservas r
             JOIN viajes v ON v.id = r.viaje_id
             WHERE r.stripe_session_id = ? LIMIT 1'
        );
        $stmt->execute([$sessionId]);
        return $stmt->fetch() ?: null;
    }
}
