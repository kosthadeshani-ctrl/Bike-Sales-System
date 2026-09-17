<?php
// Test API endpoint simulation
ini_set('display_errors', 0);
error_reporting(0);
ob_start();

// Simulate the auth/session endpoint
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/db.php';
    
    session_start();
    
    // Check if user is in session
    $currentUser = isset($_SESSION['user']) ? $_SESSION['user'] : null;
    
    if ($currentUser) {
        ob_end_clean();
        http_response_code(200);
        echo json_encode(["user" => $currentUser]);
    } else {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(["error" => "Not authenticated"]);
    }
} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
