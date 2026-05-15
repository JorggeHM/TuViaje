<?php

require_once __DIR__ . '/TestRunner.php';
require_once __DIR__ . '/../helpers/Stripe.php';

/**
 * Tests de Stripe::verifyWebhookSignature.
 *
 * El webhook de Stripe es la única forma en que se confirman pagos en el
 * sistema (ver StripeWebhookController). Si la verificación HMAC se rompe
 * silenciosamente, un atacante podría forjar `checkout.session.completed`
 * y conseguir reservas confirmadas sin pagar — o peor, refunds gratis.
 *
 * Estos tests cubren el helper en aislamiento. No tocan BD ni HTTP real.
 */

const TEST_SECRET = 'whsec_test_secret_para_unit_tests_12345';

/** Genera un header Stripe-Signature válido para el payload + secret dados. */
function makeSignatureHeader(string $payload, string $secret, ?int $timestamp = null): string {
    $timestamp ??= time();
    $signedPayload = $timestamp . '.' . $payload;
    $sig           = hash_hmac('sha256', $signedPayload, $secret);
    return "t={$timestamp},v1={$sig}";
}

TestRunner::describe('Stripe::verifyWebhookSignature', function () {

    TestRunner::it('acepta una firma válida con el secret correcto', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload = '{"id":"evt_test","type":"checkout.session.completed"}';
        $header  = makeSignatureHeader($payload, TEST_SECRET);

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeTrue();
    });

    TestRunner::it('rechaza cuando el header está vacío', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload = '{"id":"evt_test"}';

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, ''))->toBeFalse();
    });

    TestRunner::it('rechaza cuando el STRIPE_WEBHOOK_SECRET no está configurado', function () {
        putenv('STRIPE_WEBHOOK_SECRET=');
        $payload = '{"id":"evt_test"}';
        $header  = makeSignatureHeader($payload, TEST_SECRET);

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeFalse();
    });

    TestRunner::it('rechaza cuando la firma v1 fue alterada', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload = '{"id":"evt_test"}';
        $timestamp = time();
        $header    = "t={$timestamp},v1=firma_falsa_no_es_un_hmac_valido_de_64_chars_123456789012345678";

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeFalse();
    });

    TestRunner::it('rechaza cuando el body fue modificado después de firmar', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payloadOriginal = '{"id":"evt_test","amount":100}';
        $header          = makeSignatureHeader($payloadOriginal, TEST_SECRET);

        // Atacante intenta inyectar otro monto manteniendo la firma original
        $payloadModificado = '{"id":"evt_test","amount":999999}';
        TestRunner::expect(Stripe::verifyWebhookSignature($payloadModificado, $header))->toBeFalse();
    });

    TestRunner::it('rechaza cuando el timestamp está fuera de la tolerancia', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload = '{"id":"evt_test"}';
        // 1 hora atrás (default tolerance es 5 min)
        $header  = makeSignatureHeader($payload, TEST_SECRET, time() - 3600);

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeFalse();
    });

    TestRunner::it('rechaza cuando el secret de firma es distinto al esperado', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload = '{"id":"evt_test"}';
        // Firmado con OTRO secret — debe fallar
        $header  = makeSignatureHeader($payload, 'whsec_otro_secret_distinto');

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeFalse();
    });

    TestRunner::it('acepta si una de varias firmas v1 es válida (rotación de secret)', function () {
        // Durante una migración Stripe puede enviar múltiples firmas v1.
        // Si al menos una matchea, el evento es válido.
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload   = '{"id":"evt_test"}';
        $timestamp = time();
        $signed    = $timestamp . '.' . $payload;
        $sigValida = hash_hmac('sha256', $signed, TEST_SECRET);
        $sigFalsa  = str_repeat('a', 64);
        $header    = "t={$timestamp},v1={$sigFalsa},v1={$sigValida}";

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeTrue();
    });

    TestRunner::it('rechaza si el header no incluye timestamp', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload = '{"id":"evt_test"}';
        $sig     = hash_hmac('sha256', time() . '.' . $payload, TEST_SECRET);
        $header  = "v1={$sig}";  // sin "t="

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeFalse();
    });

    TestRunner::it('rechaza si el header no incluye firma v1', function () {
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload   = '{"id":"evt_test"}';
        $timestamp = time();
        $header    = "t={$timestamp}";  // sin "v1="

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeFalse();
    });

    TestRunner::it('tolera un timestamp ligeramente futuro dentro del margen', function () {
        // Reloj del servidor desincronizado por unos segundos hacia atrás — debe seguir aceptando
        putenv('STRIPE_WEBHOOK_SECRET=' . TEST_SECRET);
        $payload = '{"id":"evt_test"}';
        $header  = makeSignatureHeader($payload, TEST_SECRET, time() + 30);

        TestRunner::expect(Stripe::verifyWebhookSignature($payload, $header))->toBeTrue();
    });
});
