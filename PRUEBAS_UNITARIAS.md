# PRUEBAS UNITARIAS — TuGuía Completa

## Resumen
Este documento explica el propósito, la estructura y el flujo de trabajo de las pruebas unitarias, con instrucciones específicas para el repositorio `AgenciaDeViajesSystem`. Al final encontrarás ejemplos, buenas prácticas y pasos para convertir este Markdown a PDF.

## ¿Qué son las pruebas unitarias?
- Definición: pruebas automatizadas que verifican el comportamiento de unidades pequeñas e independientes de código (funciones, métodos, clases).
- Objetivo: detectar errores temprano, documentar el comportamiento esperado y permitir refactorizaciones seguras.

## Beneficios
- Feedback rápido durante el desarrollo.
- Facilitan refactorizaciones y mantenimiento.
- Documentan contratos de código.
- Mejoran la calidad y fiabilidad.

## Principios y prácticas clave
- Aislamiento: cada test debe ejecutarse sin dependencia externa (BD, red) — usa mocks/stubs.
- AAA: Arrange (preparar), Act (ejecutar), Assert (verificar).
- Nombres claros: `test_should_do_x_when_y()` o `deberia_hacer_x_si_y()`.
- Tests rápidos: deben ejecutarse rápidamente para fomentar su uso frecuente.
- Independencia: evitar orden-dependencias entre tests.

## Tipos de pruebas (breve)
- Unitarias: pequeñas y rápidas.
- Integración: varias unidades trabajando juntas.
- End-to-end: flujos completos desde la capa pública.

## Estructura recomendada de tests
- Carpeta dedicada: `tests/`.
- Un archivo por unidad o por clase.
- Fixtures para datos comunes.
- Helpers para tareas repetitivas.

## Mocks, stubs y fakes
- Mocks: verifican interacciones (llamadas, argumentos).
- Stubs: devuelven respuestas controladas.
- Fakes: implementaciones ligeras en memoria (ej. repositorios en memoria).
Usa estas técnicas para aislar lógica y evitar efectos secundarios.

## Herramientas comunes (PHP)
- PHPUnit: framework de pruebas más usado en PHP.
- Mockery: lib de mocks para PHP.
- Frameworks de CI: GitHub Actions, GitLab CI, etc.

## Qué usa este repositorio exactamente
Este repositorio no usa PHPUnit en los tests actuales. En cambio, el backend `viaje.api` incluye un runner casero mínimo en `tests/TestRunner.php`.

### El runner propio de `tests/TestRunner.php`
Este archivo define:
- `TestRunner::describe($name, $fn)` — agrupa un conjunto de tests.
- `TestRunner::it($desc, $fn)` — define un caso individual.
- `TestRunner::expect($actual)` — devuelve un objeto de aserciones.
- `expectFn($fn, $exceptionMsg)` — comprueba que una función lance excepción con mensaje esperado.

Ejemplo de estilo actual en el repo:

```php
TestRunner::describe('JWT::encode y JWT::decode', function () {
    TestRunner::it('encode genera un token con 3 partes separadas por punto', function () {
        $token = JWT::encode(['sub' => 1, 'email' => 'test@mail.com', 'rol' => 'usuario']);
        $parts = explode('.', $token);
        TestRunner::expect(count($parts))->toBe(3);
    });
});
```

### Estructura concreta de tests en `viaje.api`
- `tests/run_tests.php`: ejecuta todos los tests del backend.
- `tests/TestRunner.php`: implementación del runner y las expectativas.
- `tests/JWTTest.php`: pruebas del helper `helpers/JWT.php`.
- `tests/CuposLogicTest.php`: pruebas de lógica de cálculo de cupos y montos.
- `tests/MailerTest.php`: pruebas de generación de mails y comportamiento `send()`.
- `tests/StripeWebhookTest.php`: pruebas de verificación de firmas de Stripe.

## Ejemplos concretos del repo
### JWT
El helper `helpers/JWT.php` implementa JWT con:
- `encode()` que agrega `iat` y `exp`.
- `decode()` que valida formato, firma y expiración.

Tests relevantes:
- `encode` debe producir un token con 3 partes (`header.payload.signature`).
- `decode` debe devolver el payload original.
- `decode` debe incluir `iat` y `exp`.
- `exp` debe ser aproximadamente `iat + JWT_TTL`.
- `decode` debe fallar con token malformado.
- `decode` debe fallar si la firma o el payload son alterados.

Fragmento real:

```php
TestRunner::it('decode lanza excepción con token malformado', function () {
    expectFn(fn() => JWT::decode('token.invalido'), 'Token inválido');
});
```

### Lógica de cupos y montos
El archivo `tests/CuposLogicTest.php` prueba funciones de negocio puras, sin base de datos.
Funciones objeto de test:
- `calcularMonto($precio, $personas)`.
- `cuposSuficientes($disponibles, $solicitados)`.
- `cuposTrasReserva($disponibles, $solicitados)`.
- `cuposTrasCancel($disponibles, $personasReservadas)`.
- `personasDesdeReserva($personas)`.

Ejemplos de casos:
- `calcularMonto(300.00, 2)` debe ser `600.00`.
- `cuposSuficientes(5, 5)` debe ser `true`.
- `cuposTrasReserva(10, 3)` debe ser `7`.
- `cuposTrasCancel(2, 3)` debe ser `5`.
- Una reserva + cancelación completa debe restaurar los cupos originales.

Fragmento real:

```php
TestRunner::it('ciclo completo reserva + cancelación restaura cupos originales', function () {
    $cuposOriginales = 15;
    $personas = 4;
    $trasReserva  = cuposTrasReserva($cuposOriginales, $personas);
    $trasCancel   = cuposTrasCancel($trasReserva, $personas);
    TestRunner::expect($trasCancel)->toBe($cuposOriginales);
});
```

### Mailer
`helpers/Mailer.php` construye correos de texto plano y envía por SMTP o `mail()` nativo.
Pruebas enfocadas en:
- `buildBienvenidaBody()` debe incluir el nombre y el enlace a frontend.
- debe usar "viajero" cuando el nombre es vacío o solo espacios.
- `send()` debe existir y devolver `false` en lugar de lanzar excepción cuando SMTP no funciona.
- `sendBienvenida()` debe retornar un booleano siempre.

Ejemplo de test:

```php
TestRunner::it('send() con SMTP host inválido retorna false sin lanzar', function () {
    putenv('SMTP_HOST=host-inexistente-12345.invalid');
    $resultado = Mailer::send('test@example.com', 'Prueba', 'Cuerpo');
    TestRunner::expect($resultado)->toBeFalse();
    putenv('SMTP_HOST=');
});
```

### Stripe Webhooks
`helpers/Stripe.php` implementa verificación de la firma `Stripe-Signature`.
Tests clave del webhook:
- acepta firma válida generada con el `STRIPE_WEBHOOK_SECRET` esperado.
- rechaza headers vacíos o sin `t=` / sin `v1=`.
- rechaza firmas alteradas o bodies modificados.
- rechaza tiempos fuera de tolerancia (por ejemplo, 1 hora atrás).
- acepta si al menos una firma válida aparece entre varias firmas v1.

Ejemplo real:

```php
TestRunner::it('rechaza cuando el body fue modificado después de firmar', function () {
    putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
    $payloadOriginal = '{"id":"evt_test","amount":100}';
    $header = makeSignatureHeader($payloadOriginal, TEST_SECRET);
    $payloadModificado = '{"id":"evt_test","amount":999999}';
    TestRunner::expect(Stripe::verifyWebhookSignature($payloadModificado, $header))->toBeFalse();
});
```

### Cómo leer la cobertura del tester propio
- Cada `describe()` agrupa un área del sistema.
- Cada `it()` es un comportamiento esperado.
- Las aserciones más usadas son `toBe()`, `toEqual()`, `toBeTrue()`, `toBeFalse()` y `toContain()`.
- `expectFn()` ayuda a verificar que un bloque de código lance excepción con el mensaje esperado.

## Recomendaciones prácticas en el repo
- Usa este mismo estilo cuando agregues tests nuevos: `describe` + `it` + `expect`.
- Para lógica pura, haz tests directos de funciones como en `CuposLogicTest.php`.
- Para helpers de validación / firma, prueba casos felices y casos rotos (inputs mal formados, secrets incorrectos, tiempos inválidos).
- Para funciones que dependen de entorno, usa `putenv()` dentro del test para simular condiciones.

## Interpretación de resultados
- Verde / OK: los tests pasaron.
- Fallos: revisar el stack trace y el assertion message.
- Errores fatales: revisar excepciones y dependencia faltante.
- `TestRunner::summary()` en este repo ofrece un conteo de tests ejecutados, fallidos y errores; lee la salida para identificar tests que corregir.

Ejemplos de comandos:

- Ejecutar desde la raíz del proyecto (Windows PowerShell):

```powershell
cd AgenciaDeViajesSystem\viaje.api
php tests\run_tests.php
```

- Ejecutar directamente (ruta relativa desde la raíz):

```powershell
php AgenciaDeViajesSystem\viaje.api\tests\run_tests.php
```

Este `run_tests.php` incluye/require los archivos de test y luego muestra un resumen mediante `TestRunner::summary()`.

Si el proyecto tiene `phpunit` configurado, se puede ejecutar (si está instalado) con:

```powershell
cd AgenciaDeViajesSystem\viaje.api
# si composer y phpunit están disponibles
./vendor/bin/phpunit --testdox
```

## Interpretación de resultados
- Verde / OK: los tests pasaron.
- Fallos: revisar el stack trace y el assertion message.
- Errores fatales: revisar excepciones y dependencia faltante.
- `TestRunner::summary()` en este repo ofrece un conteo de tests ejecutados, fallidos y errores; lee la salida para identificar tests que corregir.

## Buenas prácticas y checklist antes de abrir PR
- Todos los tests existentes pasan en tu entorno.
- Añade tests para nuevos bugs/funcionalidades.
- Evita dependencias externas; si las necesitas, documenta y usa CI con servicios mock o contenedores.
- Mantén tests rápidos (< 1s por test idealmente).
- Usa nombres descriptivos y añade comentarios cuando el comportamiento esperado no sea obvio.

## Ejemplo mínimo de test (estilo PHPUnit)
```php
<?php
use PHPUnit\Framework\TestCase;
class CalculadoraTest extends TestCase {
    public function testSumaBasica() {
        // Arrange
        $calc = new Calculadora();
        // Act
        $res = $calc->sumar(2,3);
        // Assert
        $this->assertEquals(5, $res);
    }
}
```

## Integración con CI (sugerencia)
- Añadir un workflow en GitHub Actions o job en GitLab CI que:
  - Instale dependencias (`composer install`).
  - Ejecute `php -v` para verificar versión.
  - Corra `php tests/run_tests.php` o `vendor/bin/phpunit`.
  - Publique artefactos o reportes de cobertura si aplica.

## Convertir este Markdown a PDF
Opciones simples:
- Pandoc (recomendado si quieres control):

```bash
# Instalar pandoc (si no está instalado)
# En Windows: choco install pandoc  (o descargar instalador)

# Convertir
pandoc PRUEBAS_UNITARIAS.md -o PRUEBAS_UNITARIAS.pdf --pdf-engine=xelatex
```

- Usar VS Code: abrir el `.md` y usar la extensión "Markdown PDF" o imprimir a PDF desde la vista previa.
- GitHub Actions: usar una acción que convierta MD a PDF y guarde artefacto.

## Siguientes pasos sugeridos
- Revisar y complementar con ejemplos concretos extraídos de los tests de `AgenciaDeViajesSystem`.
- Generar el PDF con `pandoc` o desde VS Code.

---

Si quieres, puedo ahora:
- Generar el PDF automáticamente aquí usando `pandoc` (si confirmas que tienes LaTeX/pandoc disponible), o
- Añadir más ejemplos extraídos directamente de los archivos de `tests/` del repo.
