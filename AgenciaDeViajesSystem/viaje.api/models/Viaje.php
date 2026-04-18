<?php

class Viaje {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function listActivos(): array {
        return $this->db->query("SELECT * FROM viajes WHERE estado = 'Activo' ORDER BY start_date ASC")->fetchAll();
    }

    public function listAll(): array {
        $sql = 'SELECT v.*, COUNT(vt.id) AS total_ventas
                FROM viajes v
                LEFT JOIN ventas vt ON vt.viaje_id = v.id
                GROUP BY v.id
                ORDER BY v.created_at DESC';
        return $this->db->query($sql)->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM viajes WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            'INSERT INTO viajes (title, description, destination, price, available_seats,
             start_date, end_date, duracion_dias, rating, imagen_url, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['title'], $data['description'] ?? null, $data['destination'],
            $data['price'], $data['available_seats'], $data['start_date'], $data['end_date'],
            $data['duracion_dias'] ?? 0, $data['rating'] ?? 0, $data['imagen_url'] ?? null,
            $data['estado'] ?? 'Activo',
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $values = [];
        $allowed = ['title','description','destination','price','available_seats',
                    'start_date','end_date','duracion_dias','rating','imagen_url','estado'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $values[] = $id;
        $stmt = $this->db->prepare('UPDATE viajes SET ' . implode(', ', $fields) . ' WHERE id = ?');
        $stmt->execute($values);
        return $stmt->rowCount() > 0;
    }

    public function setState(int $id, string $estado): bool {
        $stmt = $this->db->prepare('UPDATE viajes SET estado = ? WHERE id = ?');
        $stmt->execute([$estado, $id]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM viajes WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
