<?php
// backend/db.php
// Database connection utility for BSMS with Mock Fallback

class DB {
    private static $instance = null;
    private $conn;
    private $useMock = false;
    private static $mockData = null;

    private $host = '127.0.0.1';
    private $port = 3307;
    private $user = 'root';
    private $pass = '';
    private $dbname = 'bsms_db';

    private function __construct() {
        $this->conn = null;
        $this->useMock = false;

        try {
            // Try to connect to MySQL with short timeout
            $this->conn = new PDO(
                "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4",
                $this->user,
                $this->pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 2,
                ]
            );
            error_log("MySQL Database connected successfully");
        } catch (PDOException $e) {
            // Fall back to mock database
            error_log("MySQL connection failed: " . $e->getMessage());
            error_log("Switched to mock database for development");
            $this->useMock = true;
            $this->conn = null;
            self::$mockData = self::initMockData();
        }
    }

    private static function initMockData() {
        return [
            'employee' => [
                ['employee_id' => 'EMP001', 'full_name' => 'Dasan Dasanayaka', 'username' => 'admin', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Admin', 'nic' => '981234567V', 'designation' => 'Administrator', 'salary' => 85000.00, 'phone' => '0771234567'],
                ['employee_id' => 'EMP002', 'full_name' => 'Samantha Bandara', 'username' => 'manager', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Manager', 'nic' => '957654321V', 'designation' => 'Manager', 'salary' => 75000.00, 'phone' => '0717654321'],
                ['employee_id' => 'EMP003', 'full_name' => 'Ruvini Perera', 'username' => 'sales', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Sales', 'nic' => '998765432V', 'designation' => 'Sales Executive', 'salary' => 45000.00, 'phone' => '0759876543'],
                ['employee_id' => 'EMP004', 'full_name' => 'Kasun Silva', 'username' => 'inventory', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Inventory', 'nic' => '971122334V', 'designation' => 'Inventory Clerk', 'salary' => 40000.00, 'phone' => '0761122334'],
                ['employee_id' => 'EMP005', 'full_name' => 'Nimal Fernando', 'username' => 'finance', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Finance', 'nic' => '943344556V', 'designation' => 'Finance Officer', 'salary' => 50000.00, 'phone' => '0723344556'],
            ],
            'bike_model' => [
                ['model_id' => 'BM001', 'model_name' => 'Hero Splendor Plus', 'manufacturer' => 'Hero', 'engine_cc' => 110, 'color_options' => 'Red, Black, Silver', 'base_price' => 380000.00, 'current_stock' => 12, 'status' => 'Active'],
                ['model_id' => 'BM002', 'model_name' => 'Hero Thriller 160R', 'manufacturer' => 'Hero', 'engine_cc' => 160, 'color_options' => 'Red, Blue, Matte Grey', 'base_price' => 520000.00, 'current_stock' => 4, 'status' => 'Active'],
                ['model_id' => 'BM003', 'model_name' => 'Hero Glamour XTEC', 'manufacturer' => 'Hero', 'engine_cc' => 125, 'color_options' => 'Black, Grey, Blue', 'base_price' => 420000.00, 'current_stock' => 2, 'status' => 'Active'],
                ['model_id' => 'BM004', 'model_name' => 'Hero Pleasure Plus', 'manufacturer' => 'Hero', 'engine_cc' => 110, 'color_options' => 'Yellow, Red, Matte Black', 'base_price' => 350000.00, 'current_stock' => 8, 'status' => 'Active'],
                ['model_id' => 'BM005', 'model_name' => 'Hero XPulse 200 4V', 'manufacturer' => 'Hero', 'engine_cc' => 200, 'color_options' => 'Blue, White, Red', 'base_price' => 650000.00, 'current_stock' => 0, 'status' => 'Active'],
                ['model_id' => 'BM006', 'model_name' => 'Hero Passion Pro', 'manufacturer' => 'Hero', 'engine_cc' => 100, 'color_options' => 'Green, White, Black', 'base_price' => 320000.00, 'current_stock' => 15, 'status' => 'Active'],
            ],
            'spare_part' => [
                ['part_id' => 'SP001', 'part_name' => 'Front Brake Pad (Splendor)', 'part_number' => 'BP-SPL-01', 'unit_price' => 1250.00, 'current_stock' => 25, 'min_stock_level' => 10, 'status' => 'Active'],
                ['part_id' => 'SP002', 'part_name' => 'Spark Plug (Generic)', 'part_number' => 'SP-GEN-10', 'unit_price' => 450.00, 'current_stock' => 60, 'min_stock_level' => 15, 'status' => 'Active'],
                ['part_id' => 'SP003', 'part_name' => 'Engine Oil (Hero 4T 1L)', 'part_number' => 'EO-HERO-4T', 'unit_price' => 1850.00, 'current_stock' => 12, 'min_stock_level' => 10, 'status' => 'Active'],
                ['part_id' => 'SP004', 'part_name' => 'Air Filter (Pleasure)', 'part_number' => 'AF-PLS-02', 'unit_price' => 950.00, 'current_stock' => 4, 'min_stock_level' => 8, 'status' => 'Active'],
                ['part_id' => 'SP005', 'part_name' => 'Drive Chain Kit (Thriller)', 'part_number' => 'CK-THR-16', 'unit_price' => 4800.00, 'current_stock' => 8, 'min_stock_level' => 5, 'status' => 'Active'],
            ],
            'customer' => [
                ['customer_id' => 'CUS001', 'first_name' => 'John', 'last_name' => 'Doe', 'nic' => '123456789V', 'phone' => '0771234567', 'email' => 'john@example.com', 'address' => 'Colombo', 'registration_date' => '2025-01-01', 'customer_type' => 'Cash', 'username' => 'johndoe', 'password_hash' => null],
                ['customer_id' => 'CUS002', 'first_name' => 'Jane', 'last_name' => 'Smith', 'nic' => '987654321V', 'phone' => '0772345678', 'email' => 'jane@example.com', 'address' => 'Kandy', 'registration_date' => '2025-02-01', 'customer_type' => 'Credit', 'username' => 'janesmith', 'password_hash' => null],
            ],
            'supplier' => [
                ['supplier_id' => 'SUP001', 'company_name' => 'Hero MotoCorp Lanka', 'contact_person' => 'Jagath Alwis', 'phone' => '0112345678', 'email' => 'orders@herolanka.lk', 'address' => 'Colombo Road, Peliyagoda', 'bank_details' => 'BOC - 123456789', 'credit_limit' => 5000000.00, 'outstanding_balance' => 1250000.00],
                ['supplier_id' => 'SUP002', 'company_name' => 'Lanka Spare Parts Ltd', 'contact_person' => 'M. N. Perera', 'phone' => '0119876543', 'email' => 'sales@lankaspares.com', 'address' => 'Panchikawatta Road, Colombo 10', 'bank_details' => 'Sampath Bank - 987654321', 'credit_limit' => 500000.00, 'outstanding_balance' => 45000.00],
            ],
        ];
    }

    public static function getConnection() {
        if (!self::$instance) {
            self::$instance = new DB();
        }
        return self::$instance;
    }

    public static function isConnected() {
        $instance = self::getConnection();
        return $instance->conn !== null;
    }

    // Helper for parameterized SELECT queries returning multiple rows
    public static function query($sql, $params = []) {
        $instance = self::getConnection();
        
        if ($instance->useMock) {
            return $instance->mockQuery($sql, $params);
        }
        
        $stmt = $instance->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // Helper for parameterized SELECT queries returning a single row
    public static function queryRow($sql, $params = []) {
        $instance = self::getConnection();
        
        if ($instance->useMock) {
            return $instance->mockQueryRow($sql, $params);
        }
        
        $stmt = $instance->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    // Helper for INSERT, UPDATE, DELETE queries
    public static function execute($sql, $params = []) {
        $instance = self::getConnection();
        
        if ($instance->useMock) {
            return 1; // Mock success
        }
        
        $stmt = $instance->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    // Helper to get last inserted ID
    public static function lastInsertId() {
        $instance = self::getConnection();
        if ($instance->useMock) {
            return '0';
        }
        return $instance->conn->lastInsertId();
    }

    // Begin Transaction
    public static function beginTransaction() {
        $instance = self::getConnection();
        if ($instance->useMock) {
            return true;
        }
        return $instance->conn->beginTransaction();
    }

    // Commit Transaction
    public static function commit() {
        $instance = self::getConnection();
        if ($instance->useMock) {
            return true;
        }
        return $instance->conn->commit();
    }

    // Rollback Transaction
    public static function rollBack() {
        $instance = self::getConnection();
        if ($instance->useMock) {
            return true;
        }
        return $instance->conn->rollBack();
    }

    // Mock query implementation
    private function mockQuery($sql, $params = []) {
        // Determine table from SQL
        if (preg_match('/FROM\s+(\w+)/i', $sql, $matches)) {
            $table = $matches[1];
            if (isset(self::$mockData[$table])) {
                $results = self::$mockData[$table];
                
                // Handle WHERE clauses
                if (stripos($sql, 'WHERE') !== false) {
                    $results = $this->applyMockWhereClause($results, $sql, $params);
                }
                
                return $results;
            }
        }
        return [];
    }

    private function mockQueryRow($sql, $params = []) {
        $results = $this->mockQuery($sql, $params);
        return !empty($results) ? $results[0] : null;
    }

    private function applyMockWhereClause($rows, $sql, $params = []) {
        // Simple WHERE clause handling for common patterns
        if (stripos($sql, 'WHERE username') !== false && !empty($params)) {
            $username = $params[0];
            foreach ($rows as $row) {
                if (isset($row['username']) && $row['username'] === $username) {
                    return [$row];
                }
            }
            return [];
        }
        
        if (stripos($sql, 'WHERE employee_id') !== false && !empty($params)) {
            $id = $params[0];
            foreach ($rows as $row) {
                if (isset($row['employee_id']) && $row['employee_id'] === $id) {
                    return [$row];
                }
            }
            return [];
        }
        
        if (stripos($sql, 'WHERE model_id') !== false && !empty($params)) {
            $id = $params[0];
            foreach ($rows as $row) {
                if (isset($row['model_id']) && $row['model_id'] === $id) {
                    return [$row];
                }
            }
            return [];
        }
        
        // Filter for low stock levels (current_stock < min_stock_level)
        if (stripos($sql, 'current_stock < min_stock_level') !== false) {
            return array_filter($rows, function($row) {
                return isset($row['current_stock']) && isset($row['min_stock_level']) && 
                       $row['current_stock'] < $row['min_stock_level'];
            });
        }
        
        return $rows;
    }
}
