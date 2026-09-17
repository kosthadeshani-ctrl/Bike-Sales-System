<?php
// Mock database for development/testing when MySQL is unavailable

class MockDB {
    private static $data = null;

    public static function getData() {
        if (self::$data === null) {
            self::$data = [
                'employees' => [
                    ['employee_id' => 'EMP001', 'full_name' => 'Dasan Dasanayaka', 'username' => 'admin', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Admin'],
                    ['employee_id' => 'EMP002', 'full_name' => 'Samantha Bandara', 'username' => 'manager', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Manager'],
                    ['employee_id' => 'EMP003', 'full_name' => 'Ruvini Perera', 'username' => 'sales', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Sales'],
                    ['employee_id' => 'EMP004', 'full_name' => 'Kasun Silva', 'username' => 'inventory', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Inventory'],
                    ['employee_id' => 'EMP005', 'full_name' => 'Nimal Fernando', 'username' => 'finance', 'password_hash' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'access_level' => 'Finance'],
                ],
                'bikes' => [
                    ['model_id' => 'BM001', 'model_name' => 'Hero Splendor Plus', 'engine_cc' => 110, 'base_price' => 380000, 'current_stock' => 12],
                    ['model_id' => 'BM002', 'model_name' => 'Hero Thriller 160R', 'engine_cc' => 160, 'base_price' => 520000, 'current_stock' => 4],
                    ['model_id' => 'BM003', 'model_name' => 'Hero Glamour XTEC', 'engine_cc' => 125, 'base_price' => 420000, 'current_stock' => 2],
                    ['model_id' => 'BM004', 'model_name' => 'Hero Pleasure Plus', 'engine_cc' => 110, 'base_price' => 350000, 'current_stock' => 8],
                    ['model_id' => 'BM005', 'model_name' => 'Hero XPulse 200 4V', 'engine_cc' => 200, 'base_price' => 650000, 'current_stock' => 0],
                ],
                'parts' => [
                    ['part_id' => 'SP001', 'part_name' => 'Front Brake Pad (Splendor)', 'part_number' => 'BP-SPL-01', 'unit_price' => 1250, 'current_stock' => 25],
                    ['part_id' => 'SP002', 'part_name' => 'Spark Plug (Generic)', 'part_number' => 'SP-GEN-10', 'unit_price' => 450, 'current_stock' => 60],
                    ['part_id' => 'SP003', 'part_name' => 'Engine Oil (Hero 4T 1L)', 'part_number' => 'EO-HERO-4T', 'unit_price' => 1850, 'current_stock' => 12],
                    ['part_id' => 'SP004', 'part_name' => 'Air Filter (Pleasure)', 'part_number' => 'AF-PLS-02', 'unit_price' => 950, 'current_stock' => 4],
                    ['part_id' => 'SP005', 'part_name' => 'Drive Chain Kit (Thriller)', 'part_number' => 'CK-THR-16', 'unit_price' => 4800, 'current_stock' => 8],
                ],
                'customers' => [
                    ['customer_id' => 'CUS001', 'first_name' => 'John', 'last_name' => 'Doe', 'phone' => '0771234567', 'email' => 'john@example.com'],
                    ['customer_id' => 'CUS002', 'first_name' => 'Jane', 'last_name' => 'Smith', 'phone' => '0772345678', 'email' => 'jane@example.com'],
                ],
                'suppliers' => [
                    ['supplier_id' => 'SUP001', 'company_name' => 'Hero MotoCorp Lanka', 'contact_person' => 'Jagath Alwis', 'phone' => '0112345678', 'email' => 'orders@herolanka.lk', 'outstanding_balance' => 1250000],
                    ['supplier_id' => 'SUP002', 'company_name' => 'Lanka Spare Parts Ltd', 'contact_person' => 'M. N. Perera', 'phone' => '0119876543', 'email' => 'sales@lankaspares.com', 'outstanding_balance' => 45000],
                ],
            ];
        }
        return self::$data;
    }

    public static function queryRow($table, $criteria = null) {
        $data = self::getData();
        if (!isset($data[$table])) return null;
        
        foreach ($data[$table] as $row) {
            if ($criteria === null) return $row;
            $match = true;
            foreach ($criteria as $key => $value) {
                if (!isset($row[$key]) || $row[$key] != $value) {
                    $match = false;
                    break;
                }
            }
            if ($match) return $row;
        }
        return null;
    }

    public static function query($table) {
        $data = self::getData();
        return isset($data[$table]) ? $data[$table] : [];
    }

    public static function execute($table, $action, $data = []) {
        return true; // Mock write operations
    }
}
