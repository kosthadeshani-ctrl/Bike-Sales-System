<?php
// Display all mock database tables
ini_set('display_errors', 0);
error_reporting(0);

require_once __DIR__ . '/backend/db.php';

// Get database instance to access mock data
$db = DB::getConnection();

echo "=== MOCK DATABASE VIEWER ===\n\n";

// Define tables
$tables = ['employee', 'bike_model', 'spare_part', 'customer', 'supplier'];

foreach ($tables as $table) {
    $results = DB::query("SELECT * FROM $table");
    
    echo "TABLE: $table\n";
    echo str_repeat("-", 100) . "\n";
    
    if (empty($results)) {
        echo "  (No data)\n\n";
        continue;
    }
    
    // Display headers
    $headers = array_keys($results[0]);
    echo "  " . implode(" | ", array_map(function($h) { return str_pad($h, 20); }, $headers)) . "\n";
    echo str_repeat("-", 100) . "\n";
    
    // Display rows
    foreach ($results as $row) {
        $values = array_map(function($v) { 
            $v = (is_array($v) || is_object($v)) ? json_encode($v) : (string)$v;
            return str_pad(substr($v, 0, 20), 20); 
        }, array_values($row));
        echo "  " . implode(" | ", $values) . "\n";
    }
    echo "\n";
}

echo "\n✓ Mock database initialized successfully\n";
?>
