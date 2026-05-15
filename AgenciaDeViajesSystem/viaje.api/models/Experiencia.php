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
             WHERE e.rating >= ? AND e.visible = 1
             ORDER BY e.fecha DESC'
        );
        $stmt->execute([$minRating]);
        return $stmt->fetchAll();
    }

    /** Lista TODAS las experiencias (incl. ocultas) con datos del autor — solo admin. */
    public function listAll(): array {
        $sql = 'SELECT e.*, u.name AS usuario_nombre, u.email AS usuario_email
                FROM experiencias e
                JOIN usuarios u ON u.id = e.usuario_id
                ORDER BY e.fecha DESC';
        return $this->db->query($sql)->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM experiencias WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(int $usuarioId, array $data): int {
        $stmt = $this->db->prepare(
            'INSERT INTO experiencias (usuario_id, destino, rating, texto, imagen) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $data['destino'], $data['rating'], $data['texto'], $data['imagen'] ?? null]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $values = [];
        $allowed = ['destino', 'rating', 'texto', 'imagen'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $values[] = $id;
        $stmt = $this->db->prepare('UPDATE experiencias SET ' . implode(', ', $fields) . ' WHERE id = ?');
        $stmt->execute($values);
        return $stmt->rowCount() > 0;
    }

    public function incrementLike(int $id): bool {
        $stmt = $this->db->prepare('UPDATE experiencias SET likes = likes + 1 WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function setVisible(int $id, bool $visible): bool {
        $stmt = $this->db->prepare('UPDATE experiencias SET visible = ? WHERE id = ?');
        $stmt->execute([$visible ? 1 : 0, $id]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM experiencias WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
