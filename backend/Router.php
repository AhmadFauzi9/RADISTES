<?php
/**
 * RADISTES - Simple Modular API Router
 */

class Router {
    public static function dispatch() {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Health check endpoint
        if (strpos($uri, '/api.php/status') !== false || strpos($uri, '/api/status') !== false) {
            Response::json([
                'status' => 'ok',
                'app' => 'RADISTES',
                'version' => '1.0.0',
                'database' => 'MySQL Ready'
            ]);
            return;
        }

        Response::json([
            'message' => 'RADISTES API Gateway Aktif. Menunggu integrasi backend database lanjutan setelah frontend disetujui.',
            'method' => $method
        ]);
    }
}
