<?php

class JWT {
    private static function base64url_encode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64url_decode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }

    public static function encode(array $payload): string {
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_TTL;

        $header  = self::base64url_encode(json_encode(['typ' => 'JWT', 'alg' => JWT_ALG]));
        $payload = self::base64url_encode(json_encode($payload));
        $sig     = self::base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

        return "$header.$payload.$sig";
    }

    public static function decode(string $token): array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new \Exception('Token inválido');
        }

        [$header, $payload, $sig] = $parts;

        $expected = self::base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
        if (!hash_equals($expected, $sig)) {
            throw new \Exception('Firma inválida');
        }

        $data = json_decode(self::base64url_decode($payload), true);

        if (!$data || !isset($data['exp']) || $data['exp'] < time()) {
            throw new \Exception('Token expirado');
        }

        return $data;
    }
}
