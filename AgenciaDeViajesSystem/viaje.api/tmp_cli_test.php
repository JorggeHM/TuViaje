<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI']    = '/api/viajes';
$_SERVER['SCRIPT_NAME']    = '/index.php';

require __DIR__ . '/index.php';
