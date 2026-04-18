<?php

class Response {
    public static function success(mixed $data = null, string $message = 'OK', int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'data' => $data, 'message' => $message]);
        exit;
    }

    public static function error(string $message, int $code = 400): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'data' => null, 'message' => $message]);
        exit;
    }
}
