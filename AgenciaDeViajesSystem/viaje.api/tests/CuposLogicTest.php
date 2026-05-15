<?php

require_once __DIR__ . '/TestRunner.php';

/**
 * Tests de la lógica pura de negocio relacionada con cupos.
 * No requieren base de datos — se prueban las funciones de cálculo directamente.
 */

// ── Funciones extraídas de la lógica del controlador ──────────────────

function calcularMonto(float $precio, int $personas): float {
    return $precio * $personas;
}

function cuposSuficientes(int $disponibles, int $solicitados): bool {
    return $disponibles >= $solicitados;
}

function cuposTrasReserva(int $disponibles, int $solicitados): int {
    return $disponibles - $solicitados;
}

function cuposTrasCancel(int $disponibles, int $personasReservadas): int {
    return $disponibles + $personasReservadas;
}

function personasDesdeReserva(int $personas): int {
    // Con el nuevo campo 'personas', el cálculo es directo
    return $personas;
}

// ── Tests ──────────────────────────────────────────────────────────────

TestRunner::describe('Cálculo de monto de reserva', function () {

    TestRunner::it('precio × personas calcula el total correctamente', function () {
        TestRunner::expect(calcularMonto(300.00, 2))->toBe(600.00);
    });

    TestRunner::it('precio × 1 persona devuelve el precio unitario', function () {
        TestRunner::expect(calcularMonto(199.99, 1))->toBe(199.99);
    });

    TestRunner::it('precio × 5 personas es correcto', function () {
        TestRunner::expect(calcularMonto(150.00, 5))->toBe(750.00);
    });

    TestRunner::it('precio con decimales × personas no pierde precisión', function () {
        TestRunner::expect(calcularMonto(99.50, 4))->toBe(398.00);
    });
});

TestRunner::describe('Validación de cupos disponibles', function () {

    TestRunner::it('cupos suficientes → true cuando disponibles > solicitados', function () {
        TestRunner::expect(cuposSuficientes(10, 3))->toBeTrue();
    });

    TestRunner::it('cupos suficientes → true cuando disponibles === solicitados', function () {
        TestRunner::expect(cuposSuficientes(5, 5))->toBeTrue();
    });

    TestRunner::it('cupos insuficientes → false cuando disponibles < solicitados', function () {
        TestRunner::expect(cuposSuficientes(2, 3))->toBeFalse();
    });

    TestRunner::it('0 cupos disponibles → false para cualquier solicitud', function () {
        TestRunner::expect(cuposSuficientes(0, 1))->toBeFalse();
    });
});

TestRunner::describe('Decremento de cupos al crear reserva', function () {

    TestRunner::it('resta correctamente las personas reservadas', function () {
        TestRunner::expect(cuposTrasReserva(10, 3))->toBe(7);
    });

    TestRunner::it('reserva de todos los cupos deja 0', function () {
        TestRunner::expect(cuposTrasReserva(5, 5))->toBe(0);
    });

    TestRunner::it('reserva de 1 persona decrementa en 1', function () {
        TestRunner::expect(cuposTrasReserva(8, 1))->toBe(7);
    });
});

TestRunner::describe('Restauración de cupos al cancelar reserva', function () {

    TestRunner::it('suma correctamente las personas al cancelar', function () {
        TestRunner::expect(cuposTrasCancel(2, 3))->toBe(5);
    });

    TestRunner::it('cancelar cuando quedan 0 cupos restaura correctamente', function () {
        TestRunner::expect(cuposTrasCancel(0, 5))->toBe(5);
    });

    TestRunner::it('cancelar 1 persona añade 1 cupo', function () {
        TestRunner::expect(cuposTrasCancel(7, 1))->toBe(8);
    });
});

TestRunner::describe('Consistencia del campo personas en reserva', function () {

    TestRunner::it('personas almacenadas se recuperan directamente sin cálculo', function () {
        $personasGuardadas = 3;
        TestRunner::expect(personasDesdeReserva($personasGuardadas))->toBe(3);
    });

    TestRunner::it('1 persona reservada se restaura como 1 al cancelar', function () {
        $cuposIniciales = 9;
        $personas = 1;
        $cuposTrasReserva = cuposTrasReserva($cuposIniciales, $personas);
        $cuposRestaurados = cuposTrasCancel($cuposTrasReserva, personasDesdeReserva($personas));
        TestRunner::expect($cuposRestaurados)->toBe($cuposIniciales);
    });

    TestRunner::it('ciclo completo reserva + cancelación restaura cupos originales', function () {
        $cuposOriginales = 15;
        $personas = 4;

        $trasReserva  = cuposTrasReserva($cuposOriginales, $personas);
        $trasCancel   = cuposTrasCancel($trasReserva, $personas);

        TestRunner::expect($trasCancel)->toBe($cuposOriginales);
    });
});
