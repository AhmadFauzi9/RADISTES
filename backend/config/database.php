<?php
/**
 * RADISTES - Backend Database Configuration
 * Siap dikoneksikan ke MySQL / XAMPP (phpMyAdmin)
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_radistes');
define('DB_PORT', 3306);

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                // Fallback message jika database belum dibuat di MySQL
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Koneksi database MySQL gagal: ' . $e->getMessage()
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
