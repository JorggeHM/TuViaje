<?php

/**
 * run_tests.php — Ejecuta todos los tests del backend.
 * Uso: php tests/run_tests.php
 */

echo "\033[1m=== TuViaje — Tests Unitarios Backend ===\033[0m\n";

require_once __DIR__ . '/JWTTest.php';
require_once __DIR__ . '/CuposLogicTest.php';
require_once __DIR__ . '/MailerTest.php';
require_once __DIR__ . '/StripeWebhookTest.php';

TestRunner::summary();
