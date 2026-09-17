<?php
// Test the backend mock database
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/db.php';
    
    // Test 1: Query employee
    $user = DB::queryRow("SELECT employee_id, full_name, username FROM employee WHERE username = ?", ['admin']);
    
    if ($user) {
        echo json_encode([
            'status' => 'SUCCESS',
            'message' => 'Backend mock database is working',
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'status' => 'ERROR',
            'message' => 'User not found'
        ]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'ERROR',
        'message' => $e->getMessage()
    ]);
}
