<?php

class Usuario {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('SELECT * FROM usuarios WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT id, name, email, rol, activo, created_at FROM usuarios WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(string $name, string $email, string $password, string $rol = 'usuario'): int {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('INSERT INTO usuarios (name, email, password, rol) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email, $hash, $rol]);
        return (int) $this->db->lastInsertId();
    }

    public function list(): array {
        $sql = 'SELECT u.id, u.name, u.email, u.rol, u.activo, u.created_at,
                       COUNT(v.id) AS total_compras
                FROM usuarios u
                LEFT JOIN ventas v ON v.usuario_id = u.id
                GROUP BY u.id
                ORDER BY u.created_at DESC';
        return $this->db->query($sql)->fetchAll();
    }

    public function toggleActivo(int $id): bool {
        $stmt = $this->db->prepare('UPDATE usuarios SET activo = NOT activo WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM usuarios WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
