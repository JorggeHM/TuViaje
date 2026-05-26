<?php

class Router {
    private array $routes = [];

    public function get(string $path, mixed $handler): void {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, mixed $handler): void {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, mixed $handler): void {
        $this->add('PUT', $path, $handler);
    }

    public function patch(string $path, mixed $handler): void {
        $this->add('PATCH', $path, $handler);
    }

    public function delete(string $path, mixed $handler): void {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, mixed $handler): void {
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [
            'method'  => $method,
            'pattern' => '#^' . $pattern . '$#',
            'handler' => $handler,
        ];
    }

    public function dispatch(Request $request): void {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $request->method) {
                continue;
            }
            if (preg_match($route['pattern'], $request->path, $matches)) {
                $request->params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                // Soportar diferentes formas de handler: Closure, [ClassName, 'method']
                if (is_callable($route['handler'])) {
                    call_user_func($route['handler'], $request);
                } else {
                    Response::error('Handler no invocable', 500);
                }
                return;
            }
        }
        Response::error('Ruta no encontrada', 404);
    }
}
