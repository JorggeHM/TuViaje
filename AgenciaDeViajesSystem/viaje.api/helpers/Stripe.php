<?php

/**
 * Stripe — Cliente mínimo para Checkout.
 *
 * Usa cURL contra la API REST de Stripe directamente — sin SDK ni
 * dependencias de Composer. Cubre los flujos que usa la app: crear
 * sesiones de Checkout, recuperar sesiones, crear reembolsos y verificar
 * firmas de webhooks entrantes.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  CONFIGURACIÓN — DÓNDE VA LA API KEY                                │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  Ambas variables se cargan desde viaje.api/.env                     │
 * │                                                                     │
 * │    STRIPE_SECRET_KEY=sk_test_...    ← dashboard.stripe.com/apikeys  │
 * │    STRIPE_WEBHOOK_SECRET=whsec_...  ← lo imprime `stripe listen`    │
 * │                                                                     │
 * │  Si STRIPE_SECRET_KEY está vacío, este helper LANZA RuntimeException│
 * │  al primer uso. Ver instrucciones detalladas en .env.example y      │
 * │  AgenciaDeViajesSystem/stripe.md                                    │
 * └─────────────────────────────────────────────────────────────────────┘
 */
class Stripe {

    private const API_BASE = 'https://api.stripe.com/v1';

    /**
     * Crea una sesión de Checkout y devuelve el array de respuesta.
     * @throws \RuntimeException si la API responde con error.
     */
    public static function createCheckoutSession(array $params): array {
        return self::request('POST', '/checkout/sessions', $params);
    }

    /**
     * Obtiene una sesión de Checkout por ID. Útil para resolver el
     * `payment_intent` asociado antes de crear un refund.
     */
    public static function retrieveCheckoutSession(string $sessionId): array {
        return self::request('GET', '/checkout/sessions/' . urlencode($sessionId));
    }

    /**
     * Crea un reembolso total sobre un payment_intent.
     * Para refunds parciales pasar `amount` (en centavos) en $extras.
     */
    public static function createRefund(string $paymentIntentId, array $extras = []): array {
        return self::request('POST', '/refunds', array_merge(
            ['payment_intent' => $paymentIntentId],
            $extras
        ));
    }

    /**
     * Wrapper común para llamadas a la API REST de Stripe.
     * @throws \RuntimeException si la API responde con error o falla cURL.
     */
    private static function request(string $method, string $path, array $params = []): array {
        $sk = (string) (getenv('STRIPE_SECRET_KEY') ?: '');
        if ($sk === '') {
            throw new \RuntimeException('STRIPE_SECRET_KEY no está configurado en el .env');
        }

        $ch = curl_init(self::API_BASE . $path);
        $opts = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD        => $sk . ':',
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_CUSTOMREQUEST  => $method,
        ];

        if ($method !== 'GET' && !empty($params)) {
            $opts[CURLOPT_HTTPHEADER] = ['Content-Type: application/x-www-form-urlencoded'];
            $opts[CURLOPT_POSTFIELDS] = self::flatten($params);
        }

        curl_setopt_array($ch, $opts);

        $body   = curl_exec($ch);
        $errno  = curl_errno($ch);
        $err    = curl_error($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($errno !== 0) {
            throw new \RuntimeException('cURL falló: ' . $err);
        }

        $data = json_decode($body ?: '', true);
        if ($status >= 400 || !is_array($data)) {
            $msg = $data['error']['message'] ?? ('Stripe HTTP ' . $status);
            throw new \RuntimeException('Stripe: ' . $msg);
        }

        return $data;
    }

    /**
     * Verifica el header `Stripe-Signature` contra el cuerpo crudo recibido.
     * Acepta una tolerancia temporal por defecto de 5 minutos.
     */
    public static function verifyWebhookSignature(string $rawBody, string $signatureHeader, int $tolerance = 300): bool {
        $secret = (string) (getenv('STRIPE_WEBHOOK_SECRET') ?: '');
        if ($secret === '' || $signatureHeader === '') return false;

        $parts = [];
        foreach (explode(',', $signatureHeader) as $kv) {
            $kv = trim($kv);
            if (!str_contains($kv, '=')) continue;
            [$k, $v] = explode('=', $kv, 2);
            $parts[$k][] = $v;
        }

        $timestamp = $parts['t'][0] ?? null;
        $sigs      = $parts['v1'] ?? [];
        if (!$timestamp || empty($sigs)) return false;

        if (abs(time() - (int) $timestamp) > $tolerance) return false;

        $signedPayload = $timestamp . '.' . $rawBody;
        $expected      = hash_hmac('sha256', $signedPayload, $secret);

        foreach ($sigs as $sig) {
            if (hash_equals($expected, $sig)) return true;
        }
        return false;
    }

    /**
     * Aplana arrays anidados al formato form-encoded que usa Stripe
     * (line_items[0][price_data][...]=valor).
     */
    private static function flatten(array $params, string $prefix = ''): string {
        $pairs = [];
        foreach ($params as $key => $value) {
            $name = $prefix === '' ? (string) $key : $prefix . '[' . $key . ']';
            if (is_array($value)) {
                $pairs[] = self::flatten($value, $name);
            } else {
                if (is_bool($value)) $value = $value ? 'true' : 'false';
                $pairs[] = urlencode($name) . '=' . urlencode((string) $value);
            }
        }
        return implode('&', $pairs);
    }
}
