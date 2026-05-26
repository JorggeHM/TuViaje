<?php
    //Conexion con db
class Database {
    private static ?PDO $instance = null;

    public static function connect(): PDO {
        if (self::$instance === null) {
            $host    = getenv('DB_HOST')    ?: '127.0.0.1';
            $dbname  = getenv('DB_NAME')    ?: 'tuviaje_db';
            $user    = getenv('DB_USER')    ?: 'root';
            $pass    = getenv('DB_PASS')    ?: '';
            $charset = getenv('DB_CHARSET') ?: 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }
        return self::$instance;
    }
}
