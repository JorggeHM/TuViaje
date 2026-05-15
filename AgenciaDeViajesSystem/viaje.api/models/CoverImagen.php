<?php

class CoverImagen {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    /** Lista las imágenes visibles para el público, ordenadas. */
    public function listVisibles(): array {
        $sql = 'SELECT * FROM cover_imagenes
                WHERE visible = 1
                ORDER BY orden ASC, created_at DESC';
        return $this->db->query($sql)->fetchAll();
    }

    /** Lista todas (incluso ocultas) para el admin. */
    public function listAll(): array {
        $sql = 'SELECT * FROM cover_imagenes
                ORDER BY orden ASC, created_at DESC';
        return $this->db->query($sql)->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM cover_imagenes WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(string $url, int $orden = 0): int {
        $stmt = $this->db->prepare('INSERT INTO cover_imagenes (url, orden) VALUES (?, ?)');
        $stmt->execute([$url, $orden]);
        return (int) $this->db->lastInsertId();
    }

    public function setVisible(int $id, bool $visible): bool {
        $stmt = $this->db->prepare('UPDATE cover_imagenes SET visible = ? WHERE id = ?');
        $stmt->execute([$visible ? 1 : 0, $id]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM cover_imagenes WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
