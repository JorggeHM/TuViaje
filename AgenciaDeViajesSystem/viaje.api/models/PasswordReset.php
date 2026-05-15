<?php

class PasswordReset {
    private PDO $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function create(int $usuarioId, string $tokenHash, int $ttlSeconds = 3600): int {
        $expires = date('Y-m-d H:i:s', time() + $ttlSeconds);
        $stmt = $this->db->prepare(
            'INSERT INTO password_resets (usuario_id, token_hash, expires_at) VALUES (?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $tokenHash, $expires]);
        return (int) $this->db->lastInsertId();
    }

    public function findValidByTokenHash(string $tokenHash): ?array {
        $stmt = $this->db->prepare(
            'SELECT * FROM password_resets
             WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
             LIMIT 1'
        );
        $stmt->execute([$tokenHash]);
        return $stmt->fetch() ?: null;
    }

    public function markUsed(int $id): bool {
        $stmt = $this->db->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function invalidateAllForUser(int $usuarioId): void {
        $stmt = $this->db->prepare(
            'UPDATE password_resets SET used_at = NOW()
             WHERE usuario_id = ? AND used_at IS NULL'
        );
        $stmt->execute([$usuarioId]);
    }
}
