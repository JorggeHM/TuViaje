<?php

/**
 * TestRunner.php — Runner de tests unitarios para el backend PHP.
 * Uso: php tests/TestRunner.php
 * No requiere PHPUnit ni Composer.
 */

class TestRunner {
    private static int $passed  = 0;
    private static int $failed  = 0;
    private static array $errors = [];
    private static string $suite = '';

    public static function describe(string $name, callable $fn): void {
        self::$suite = $name;
        echo "\n\033[1m{$name}\033[0m\n";
        $fn();
    }

    public static function it(string $desc, callable $fn): void {
        try {
            $fn();
            self::$passed++;
            echo "  \033[32m✓\033[0m {$desc}\n";
        } catch (\Throwable $e) {
            self::$failed++;
            self::$errors[] = "[" . self::$suite . "] {$desc}: " . $e->getMessage();
            echo "  \033[31m✗\033[0m {$desc}\n";
            echo "    \033[33m→ " . $e->getMessage() . "\033[0m\n";
        }
    }

    public static function expect(mixed $actual): Expectation {
        return new Expectation($actual);
    }

    public static function summary(): void {
        $total = self::$passed + self::$failed;
        echo "\n";
        echo str_repeat('─', 50) . "\n";
        if (self::$failed === 0) {
            echo "\033[32m✓ Todos los tests pasaron ({$total}/{$total})\033[0m\n";
        } else {
            echo "\033[31m✗ {$total} tests, " . self::$failed . " fallaron\033[0m\n";
            foreach (self::$errors as $err) {
                echo "  \033[31m• {$err}\033[0m\n";
            }
        }
        echo str_repeat('─', 50) . "\n";
        exit(self::$failed > 0 ? 1 : 0);
    }
}

class Expectation {
    public function __construct(private mixed $actual) {}

    public function toBe(mixed $expected): void {
        if ($this->actual !== $expected) {
            throw new \Exception("Esperaba " . json_encode($expected) . ", obtuvo " . json_encode($this->actual));
        }
    }

    public function toEqual(mixed $expected): void {
        if ($this->actual != $expected) {
            throw new \Exception("Esperaba " . json_encode($expected) . ", obtuvo " . json_encode($this->actual));
        }
    }

    public function toBeTrue(): void  { $this->toBe(true); }
    public function toBeFalse(): void { $this->toBe(false); }
    public function toBeNull(): void  { $this->toBe(null); }

    public function toContain(string $needle): void {
        if (strpos((string) $this->actual, $needle) === false) {
            throw new \Exception("Esperaba que '{$this->actual}' contuviera '{$needle}'");
        }
    }

    public function toThrow(string $messageContains = ''): void {
        throw new \Exception("toThrow debe usarse con un callable, no con un valor");
    }

    public function toBeGreaterThan(mixed $expected): void {
        if (!($this->actual > $expected)) {
            throw new \Exception("Esperaba que {$this->actual} fuera mayor que {$expected}");
        }
    }

    public function toBeLessThanOrEqual(mixed $expected): void {
        if (!($this->actual <= $expected)) {
            throw new \Exception("Esperaba que {$this->actual} fuera ≤ {$expected}");
        }
    }
}

function expectFn(callable $fn, string $exceptionMsg = ''): void {
    try {
        $fn();
        throw new \Exception("Se esperaba una excepción pero no se lanzó ninguna");
    } catch (\Exception $e) {
        if ($e->getMessage() === "Se esperaba una excepción pero no se lanzó ninguna") {
            throw $e;
        }
        if ($exceptionMsg !== '' && strpos($e->getMessage(), $exceptionMsg) === false) {
            throw new \Exception("Excepción lanzada pero mensaje incorrecto. Esperaba '{$exceptionMsg}', obtuvo '{$e->getMessage()}'");
        }
    }
}
