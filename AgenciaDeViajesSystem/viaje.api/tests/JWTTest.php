<?php

require_once __DIR__ . '/TestRunner.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../helpers/JWT.php';

use function TestRunner as TR;

TestRunner::describe('JWT::encode y JWT::decode', function () {

    TestRunner::it('encode genera un token con 3 partes separadas por punto', function () {
        $token = JWT::encode(['sub' => 1, 'email' => 'test@mail.com', 'rol' => 'usuario']);
        $parts = explode('.', $token);
        TestRunner::expect(count($parts))->toBe(3);
    });

    TestRunner::it('decode devuelve el payload original correctamente', function () {
        $token   = JWT::encode(['sub' => 42, 'email' => 'x@x.com', 'name' => 'Juan', 'rol' => 'admin']);
        $payload = JWT::decode($token);
        TestRunner::expect($payload['sub'])->toBe(42);
        TestRunner::expect($payload['email'])->toBe('x@x.com');
        TestRunner::expect($payload['name'])->toBe('Juan');
        TestRunner::expect($payload['rol'])->toBe('admin');
    });

    TestRunner::it('decode incluye iat y exp en el payload', function () {
        $before = time();
        $token   = JWT::encode(['sub' => 1]);
        $payload = JWT::decode($token);
        TestRunner::expect(isset($payload['iat']))->toBeTrue();
        TestRunner::expect(isset($payload['exp']))->toBeTrue();
        TestRunner::expect($payload['exp'])->toBeGreaterThan($before);
    });

    TestRunner::it('exp es aproximadamente iat + JWT_TTL', function () {
        $token   = JWT::encode(['sub' => 1]);
        $payload = JWT::decode($token);
        $diff    = $payload['exp'] - $payload['iat'];
        // Tolerancia de 2 segundos por ejecución
        TestRunner::expect(abs($diff - JWT_TTL))->toBeLessThanOrEqual(2);
    });

    TestRunner::it('decode lanza excepción con token malformado', function () {
        expectFn(fn() => JWT::decode('token.invalido'), 'Token inválido');
    });

    TestRunner::it('decode lanza excepción si la firma fue alterada', function () {
        $token = JWT::encode(['sub' => 1]);
        $parts = explode('.', $token);
        $parts[2] = 'firma_falsa_1234';
        $tampered = implode('.', $parts);
        expectFn(fn() => JWT::decode($tampered), 'Firma inválida');
    });

    TestRunner::it('decode lanza excepción si el payload fue alterado', function () {
        $token = JWT::encode(['sub' => 1, 'rol' => 'usuario']);
        $parts = explode('.', $token);
        // Modificar el payload para escalar privilegios
        $malicious = base64_encode(json_encode(['sub' => 1, 'rol' => 'admin', 'iat' => time(), 'exp' => time() + 3600]));
        $malicious = rtrim(strtr($malicious, '+/', '-_'), '=');
        $parts[1]  = $malicious;
        $tampered  = implode('.', $parts);
        expectFn(fn() => JWT::decode($tampered), 'Firma inválida');
    });

    TestRunner::it('encode con distintos payloads genera tokens distintos', function () {
        $t1 = JWT::encode(['sub' => 1]);
        $t2 = JWT::encode(['sub' => 2]);
        TestRunner::expect($t1 !== $t2)->toBeTrue();
    });
});
