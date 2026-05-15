<?php

class Favorito {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    /** Añade el viaje a favoritos del usuario. Idempotente: si ya existe, no falla. */
    public function add(int $usuarioId, int $viajeId): bool {
        $stmt = $this->db->prepare(
            'INSERT IGNORE INTO favoritos (usuario_id, viaje_id) VALUES (?, ?)'
        );
        $stmt->execute([$usuarioId, $viajeId]);
        return $stmt->rowCount() > 0;
    }

    public function remove(int $usuarioId, int $viajeId): bool {
        $stmt = $this->db->prepare(
            'DELETE FROM favoritos WHERE usuario_id = ? AND viaje_id = ?'
        );
        $stmt->execute([$usuarioId, $viajeId]);
        return $stmt->rowCount() > 0;
    }

    /** Lista los favoritos con datos completos del viaje, más recientes primero. */
    public function listByUsuario(int $usuarioId): array {
        $stmt = $this->db->prepare(
            'SELECT v.*, f.created_at AS favorited_at,
                    COALESCE(s.vendidos, 0) AS total_ventas
             FROM favoritos f
             JOIN viajes v ON v.id = f.viaje_id
             LEFT JOIN (
               SELECT viaje_id, COUNT(*) AS vendidos
               FROM ventas WHERE estado = "Confirmada"
               GROUP BY viaje_id
             ) s ON s.viaje_id = v.id
             WHERE f.usuario_id = ?
             ORDER BY f.created_at DESC'
        );
        $stmt->execute([$usuarioId]);
        return $stmt->fetchAll();
    }

    /** Devuelve solo los IDs de viaje favoritos del usuario (liviano para checks). */
    public function listIdsByUsuario(int $usuarioId): array {
        $stmt = $this->db->prepare('SELECT viaje_id FROM favoritos WHERE usuario_id = ?');
        $stmt->execute([$usuarioId]);
        return array_map('intval', array_column($stmt->fetchAll(), 'viaje_id'));
    }
}
