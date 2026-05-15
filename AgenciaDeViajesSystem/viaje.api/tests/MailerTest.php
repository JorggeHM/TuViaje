<?php

require_once __DIR__ . '/TestRunner.php';
require_once __DIR__ . '/../helpers/Mailer.php';

TestRunner::describe('Mailer::buildBienvenidaBody', function () {

    TestRunner::it('incluye el nombre del usuario en el saludo', function () {
        $body = Mailer::buildBienvenidaBody('María Pérez');
        TestRunner::expect($body)->toContain('Hola María Pérez');
    });

    TestRunner::it('incluye el mensaje de bienvenida clave', function () {
        $body = Mailer::buildBienvenidaBody('Juan');
        TestRunner::expect($body)->toContain('Gracias por registrarte');
        TestRunner::expect($body)->toContain('TuViaje');
    });

    TestRunner::it('usa "viajero" como fallback si el nombre está vacío', function () {
        $body = Mailer::buildBienvenidaBody('');
        TestRunner::expect($body)->toContain('Hola viajero');
    });

    TestRunner::it('usa "viajero" como fallback si el nombre es solo espacios', function () {
        $body = Mailer::buildBienvenidaBody('   ');
        TestRunner::expect($body)->toContain('Hola viajero');
    });

    TestRunner::it('incluye el enlace al frontend para explorar destinos', function () {
        $body = Mailer::buildBienvenidaBody('Ana');
        TestRunner::expect($body)->toContain('http://localhost:5173');
    });

    TestRunner::it('incluye la firma del equipo TuViaje', function () {
        $body = Mailer::buildBienvenidaBody('Pedro');
        TestRunner::expect($body)->toContain('El equipo de TuViaje');
    });

    TestRunner::it('incluye advertencia para usuarios que no se registraron', function () {
        $body = Mailer::buildBienvenidaBody('Luis');
        TestRunner::expect($body)->toContain('Si no fuiste vos');
    });
});

TestRunner::describe('Mailer::send — comportamiento best-effort', function () {

    TestRunner::it('send() existe como método público estático', function () {
        $ref = new ReflectionMethod('Mailer', 'send');
        TestRunner::expect($ref->isPublic())->toBeTrue();
        TestRunner::expect($ref->isStatic())->toBeTrue();
    });

    TestRunner::it('sendBienvenida() existe como método público estático', function () {
        $ref = new ReflectionMethod('Mailer', 'sendBienvenida');
        TestRunner::expect($ref->isPublic())->toBeTrue();
        TestRunner::expect($ref->isStatic())->toBeTrue();
    });

    TestRunner::it('send() con SMTP host inválido retorna false sin lanzar', function () {
        // Configurar SMTP con host inválido para forzar fallo
        putenv('SMTP_HOST=host-inexistente-12345.invalid');
        putenv('SMTP_PORT=587');
        putenv('SMTP_USER=');
        putenv('SMTP_PASS=');
        putenv('SMTP_SECURE=');

        $resultado = Mailer::send('test@example.com', 'Prueba', 'Cuerpo');
        TestRunner::expect($resultado)->toBeFalse();

        // Limpiar para no afectar otros tests
        putenv('SMTP_HOST=');
    });

    TestRunner::it('sendBienvenida() retorna bool siempre (no lanza)', function () {
        putenv('SMTP_HOST=');
        $resultado = Mailer::sendBienvenida('Test', 'test@example.com');
        // Puede ser true o false según entorno, lo importante es que no lance
        TestRunner::expect(is_bool($resultado))->toBeTrue();
    });
});
