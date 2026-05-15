<?php

class Viaje {
    private PDO $db;

    /** Campos JSON que se serializan al escribir y deserializan al leer. */
    private const JSON_FIELDS = ['incluidos', 'galeria', 'garantias'];

    public function __construct() {
        $this->db = Database::connect();
    }

    public function listActivos(): array {
        $sql = "SELECT v.*, COALESCE(s.vendidos, 0) AS total_ventas
                FROM viajes v
                LEFT JOIN (
                  SELECT viaje_id, COUNT(*) AS vendidos
                  FROM ventas WHERE estado = 'Confirmada'
                  GROUP BY viaje_id
                ) s ON s.viaje_id = v.id
                WHERE v.estado = 'Activo'
                ORDER BY v.start_date ASC";
        return array_map([$this, 'decodeJsonFields'], $this->db->query($sql)->fetchAll());
    }

    public function listAll(): array {
        $sql = "SELECT v.*, COUNT(vt.id) AS total_ventas
                FROM viajes v
                LEFT JOIN ventas vt ON vt.viaje_id = v.id AND vt.estado = 'Confirmada'
                GROUP BY v.id
                ORDER BY v.created_at DESC";
        return array_map([$this, 'decodeJsonFields'], $this->db->query($sql)->fetchAll());
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT v.*, COALESCE(s.vendidos, 0) AS total_ventas
             FROM viajes v
             LEFT JOIN (
               SELECT viaje_id, COUNT(*) AS vendidos
               FROM ventas WHERE estado = \'Confirmada\'
               GROUP BY viaje_id
             ) s ON s.viaje_id = v.id
             WHERE v.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->decodeJsonFields($row) : null;
    }

    public function decrementSeats(int $id, int $cantidad): bool {
        $stmt = $this->db->prepare(
            "UPDATE viajes SET available_seats = available_seats - ?
             WHERE id = ? AND estado = 'Activo' AND available_seats >= ?"
        );
        $stmt->execute([$cantidad, $id, $cantidad]);
        return $stmt->rowCount() > 0;
    }

    public function incrementSeats(int $id, int $cantidad): void {
        $stmt = $this->db->prepare(
            'UPDATE viajes SET available_seats = available_seats + ? WHERE id = ?'
        );
        $stmt->execute([$cantidad, $id]);
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            'INSERT INTO viajes (title, description, destination, price, available_seats,
             start_date, end_date, duracion_dias, rating, imagen_url, incluidos, galeria, garantias, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['title'], $data['description'] ?? null, $data['destination'],
            $data['price'], $data['available_seats'], $data['start_date'], $data['end_date'],
            $data['duracion_dias'] ?? 0, $data['rating'] ?? 0, $data['imagen_url'] ?? null,
            $this->encodeJson($data['incluidos'] ?? null),
            $this->encodeJson($data['galeria']   ?? null),
            $this->encodeJson($data['garantias'] ?? null),
            $data['estado'] ?? 'Activo',
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $values = [];
        $allowed = ['title','description','destination','price','available_seats',
                    'start_date','end_date','duracion_dias','rating','imagen_url',
                    'incluidos','galeria','garantias','estado'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = in_array($field, self::JSON_FIELDS, true)
                    ? $this->encodeJson($data[$field])
                    : $data[$field];
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

    private function decodeJsonFields(array $row): array {
        foreach (self::JSON_FIELDS as $f) {
            if (array_key_exists($f, $row) && is_string($row[$f])) {
                $decoded = json_decode($row[$f], true);
                $row[$f] = is_array($decoded) ? $decoded : null;
            }
        }
        return $row;
    }

    private function encodeJson(mixed $value): ?string {
        if ($value === null) return null;
        if (is_string($value)) {
            // Aceptar JSON ya serializado o devolver null si no es válido.
            $decoded = json_decode($value, true);
            return is_array($decoded) ? json_encode($decoded, JSON_UNESCAPED_UNICODE) : null;
        }
        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }
        return null;
    }
}
