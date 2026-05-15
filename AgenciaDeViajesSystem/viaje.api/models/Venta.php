<?php

class Venta {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function create(int $usuarioId, int $viajeId, float $monto): int {
        $stmt = $this->db->prepare(
            'INSERT INTO ventas (usuario_id, viaje_id, monto, estado) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $viajeId, $monto, 'Pendiente']);
        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM ventas WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function updateEstado(int $id, string $estado): bool {
        $stmt = $this->db->prepare('UPDATE ventas SET estado = ? WHERE id = ?');
        $stmt->execute([$estado, $id]);
        return $stmt->rowCount() > 0;
    }

    /** Sincroniza el estado de la venta cuando se cambia el de su reserva (par usuario+viaje). */
    public function updateEstadoByPair(int $usuarioId, int $viajeId, string $estado): void {
        $stmt = $this->db->prepare(
            'UPDATE ventas SET estado = ? WHERE usuario_id = ? AND viaje_id = ? AND estado != "Cancelada"'
        );
        $stmt->execute([$estado, $usuarioId, $viajeId]);
    }

    /** Última venta NO cancelada para un par usuario+viaje. Útil al refundar. */
    public function findActiveByUsuarioViaje(int $usuarioId, int $viajeId): ?array {
        $stmt = $this->db->prepare(
            "SELECT * FROM ventas
             WHERE usuario_id = ? AND viaje_id = ? AND estado != 'Cancelada'
             ORDER BY fecha DESC LIMIT 1"
        );
        $stmt->execute([$usuarioId, $viajeId]);
        return $stmt->fetch() ?: null;
    }

    public function list(array $filters = []): array {
        $sql    = 'SELECT vt.*, u.name AS usuario_nombre, u.email AS usuario_email,
                          vi.title AS viaje_titulo, vi.destination AS viaje_destino
                   FROM ventas vt
                   JOIN usuarios u  ON u.id  = vt.usuario_id
                   JOIN viajes   vi ON vi.id = vt.viaje_id
                   WHERE 1=1';
        $params = [];

        if (!empty($filters['estado'])) {
            $sql    .= ' AND vt.estado = ?';
            $params[] = $filters['estado'];
        }
        if (!empty($filters['q'])) {
            $sql    .= ' AND (u.name LIKE ? OR vi.destination LIKE ?)';
            $like    = '%' . $filters['q'] . '%';
            $params[] = $like;
            $params[] = $like;
        }

        $sql .= ' ORDER BY vt.fecha DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function stats(): array {
        $totals = $this->db->query(
            "SELECT COUNT(*) AS total,
                    SUM(CASE WHEN estado='Confirmada' THEN monto ELSE 0 END) AS ingresos,
                    SUM(CASE WHEN estado='Confirmada' THEN 1 ELSE 0 END)     AS confirmadas,
                    SUM(CASE WHEN estado='Pendiente'  THEN 1 ELSE 0 END)     AS pendientes,
                    SUM(CASE WHEN estado='Cancelada'  THEN 1 ELSE 0 END)     AS canceladas
             FROM ventas"
        )->fetch();

        $topDestinos = $this->db->query(
            "SELECT vi.destination AS destino, COUNT(*) AS ventas, SUM(vt.monto) AS total
             FROM ventas vt
             JOIN viajes vi ON vi.id = vt.viaje_id
             WHERE vt.estado = 'Confirmada'
             GROUP BY vi.destination
             ORDER BY ventas DESC
             LIMIT 5"
        )->fetchAll();

        return array_merge($totals, ['top_destinos' => $topDestinos]);
    }
}
