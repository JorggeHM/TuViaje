<?php

class Experiencia {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function list(int $minRating = 1): array {
        $stmt = $this->db->prepare(
            'SELECT e.*, u.name AS usuario_nombre
             FROM experiencias e
             JOIN usuarios u ON u.id = e.usuario_id
             WHERE e.rating >= ?
             ORDER BY e.fecha DESC'
        );
        $stmt->execute([$minRating]);
        return $stmt->fetchAll();
    }

    public function create(int $usuarioId, array $data): int {
        $stmt = $this->db->prepare(
            'INSERT INTO experiencias (usuario_id, destino, rating, texto, imagen) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $data['destino'], $data['rating'], $data['texto'], $data['imagen'] ?? null]);
        return (int) $this->db->lastInsertId();
    }

    public function incrementLike(int $id): bool {
        $stmt = $this->db->prepare('UPDATE experiencias SET likes = likes + 1 WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
