<?php

class Request {
    public string $method;
    public string $path;
    public array  $params = [];
    public array  $body   = [];
    public array  $user   = [];

    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'];

        $uri        = $_SERVER['REQUEST_URI'];
        $scriptDir  = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        $path       = parse_url($uri, PHP_URL_PATH);
        $this->path = '/' . ltrim(substr($path, strlen($scriptDir)), '/');

        $raw = file_get_contents('php://input');
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->body = $decoded ?? [];
            }
        }
    }

    public function getHeader(string $name): ?string {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        if (isset($_SERVER[$key])) {
            return $_SERVER[$key];
        }
        // Apache en XAMPP puede descartar Authorization de $_SERVER;
        // getallheaders() lo recupera correctamente.
        if (function_exists('getallheaders')) {
            $all = array_change_key_case(getallheaders(), CASE_LOWER);
            return $all[strtolower($name)] ?? null;
        }
        return null;
    }
}
