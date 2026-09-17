<?php
// backend/index.php
// Unified REST API Router and Controller for BSMS

// Start output buffering IMMEDIATELY
ob_start();

// Error handling - suppress display, log to file
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

// Set headers BEFORE any output
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:3000';
header("Access-Control-Allow-Origin: $origin");
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Ensure session cookie is valid for the proxied API path
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'None'
]);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit(0);
}

// Global error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: $errstr in $errfile on line $errline");
    return true;
});

// Catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_COMPILE_ERROR])) {
        error_log("Fatal Error: " . $error['message']);
    }
});

require_once 'db.php';

session_start();

// Helper to send JSON responses
function sendResponse($data, $statusCode = 200) {
    ob_end_clean(); // Clear any buffered output (error logs, etc.)
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Helper to log audit actions
function logAudit($userId, $actionType, $tableAffected, $recordId, $oldValues = null, $newValues = null) {
    try {
        DB::execute(
            "INSERT INTO audit_log (user_id, action_type, table_affected, record_id, old_values, new_values, action_timestamp, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)",
            [
                $userId ?: 'system',
                $actionType,
                $tableAffected,
                $recordId,
                $oldValues ? json_encode($oldValues) : null,
                $newValues ? json_encode($newValues) : null,
                $_SERVER['REMOTE_ADDR'] ?: '127.0.0.1'
            ]
        );
    } catch (Exception $e) {
        error_log("Audit log failed: " . $e->getMessage());
    }
}

// Parse request payload
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    parse_str($rawInput, $parsedInput);
    $input = array_merge($_POST, $parsedInput);
} else {
    $input = array_merge($_POST, $input);
}

// Determine route path
$path = '';
if (isset($_GET['action'])) {
    $path = $_GET['action'];
} elseif (isset($_SERVER['PATH_INFO'])) {
    $path = trim($_SERVER['PATH_INFO'], '/');
} else {
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $scriptName = $_SERVER['SCRIPT_NAME'];
    if (strpos($requestUri, $scriptName) === 0) {
        $path = substr($requestUri, strlen($scriptName));
    } else {
        $scriptDir = dirname($scriptName);
        if (strpos($requestUri, $scriptDir) === 0) {
            $path = substr($requestUri, strlen($scriptDir));
        }
    }
    $path = trim($path, '/');
}

$method = $_SERVER['REQUEST_METHOD'];
$currentUser = isset($_SESSION['user']) ? $_SESSION['user'] : null;

try {
    // Route switchboard
    switch ($path) {
    
    // --- 1. Authentication Endpoints ---
    case 'auth/login':
        if ($method !== 'POST') sendResponse(["error" => "Method not allowed"], 405);
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        if (empty($username) || empty($password)) {
            sendResponse(["error" => "Username and password are required"], 400);
        }
        
        $user = DB::queryRow("SELECT * FROM employee WHERE username = ?", [$username]);
        if ($user && password_verify($password, $user['password_hash'])) {
            unset($user['password_hash']);
            $_SESSION['user'] = $user;
            logAudit($user['employee_id'], 'Login', 'employee', $user['employee_id']);
            sendResponse(["message" => "Login successful", "user" => $user]);
        } else {
            $customer = DB::queryRow("SELECT * FROM customer WHERE username = ?", [$username]);
            if ($customer && password_verify($password, $customer['password_hash'])) {
                unset($customer['password_hash']);
                $sessionUser = [
                    "employee_id" => $customer['customer_id'],
                    "full_name" => $customer['first_name'] . ' ' . $customer['last_name'],
                    "nic" => $customer['nic'],
                    "designation" => 'Customer Profile',
                    "salary" => 0.00,
                    "join_date" => $customer['registration_date'],
                    "phone" => $customer['phone'],
                    "access_level" => 'Customer',
                    "username" => $customer['username']
                ];
                $_SESSION['user'] = $sessionUser;
                logAudit($customer['customer_id'], 'Login', 'customer', $customer['customer_id']);
                sendResponse(["message" => "Login successful", "user" => $sessionUser]);
            } else {
                sendResponse(["error" => "Invalid credentials"], 401);
            }
        }
        break;

    case 'auth/register':
        if ($method !== 'POST') sendResponse(["error" => "Method not allowed"], 405);
        $first = isset($input['first_name']) ? trim($input['first_name']) : '';
        $last = isset($input['last_name']) ? trim($input['last_name']) : '';
        $nic = isset($input['nic']) ? trim($input['nic']) : '';
        $phone = isset($input['phone']) ? trim($input['phone']) : '';
        $email = isset($input['email']) ? trim($input['email']) : '';
        $address = isset($input['address']) ? trim($input['address']) : '';
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        if (empty($first) || empty($last) || empty($nic) || empty($phone) || empty($username) || empty($password)) {
            sendResponse(["error" => "All mandatory fields are required"], 400);
        }
        
        $existsUser = DB::queryRow("SELECT username FROM customer WHERE username = ? UNION SELECT username FROM employee WHERE username = ?", [$username, $username]);
        if ($existsUser) {
            sendResponse(["error" => "Username already exists"], 400);
        }
        
        $existsNic = DB::queryRow("SELECT nic FROM customer WHERE nic = ? UNION SELECT nic FROM employee WHERE nic = ?", [$nic, $nic]);
        if ($existsNic) {
            sendResponse(["error" => "NIC already exists"], 400);
        }
        
        $customer_id = 'CUS' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
        $passHash = password_hash($password, PASSWORD_BCRYPT);
        
        DB::execute(
            "INSERT INTO customer (customer_id, first_name, last_name, nic, phone, email, address, registration_date, customer_type, username, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Cash', ?, ?)",
            [$customer_id, $first, $last, $nic, $phone, $email, $address, $username, $passHash]
        );
        
        logAudit($customer_id, 'Create', 'customer', $customer_id);
        
        $sessionUser = [
            "employee_id" => $customer_id,
            "full_name" => $first . ' ' . $last,
            "nic" => $nic,
            "designation" => 'Customer Profile',
            "salary" => 0.00,
            "join_date" => date('Y-m-d'),
            "phone" => $phone,
            "access_level" => 'Customer',
            "username" => $username
        ];
        $_SESSION['user'] = $sessionUser;
        
        sendResponse(["message" => "Registration successful", "user" => $sessionUser]);
        break;

    case 'auth/logout':
        if ($currentUser) {
            logAudit($currentUser['employee_id'], 'Logout', 'employee', $currentUser['employee_id']);
        }
        session_destroy();
        sendResponse(["message" => "Logged out successfully"]);
        break;

    case 'auth/session':
        if ($currentUser) {
            sendResponse(["user" => $currentUser]);
        } else {
            sendResponse(["error" => "Not authenticated"], 401);
        }
        break;

    // --- 2. Inventory Endpoints ---
    case 'inventory/bikes':
        if ($method === 'GET') {
            $bikes = DB::query("SELECT * FROM bike_model");
            sendResponse($bikes);
        } elseif ($method === 'POST') {
            // Add bike stock
            $model_id = 'BM' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            $name = trim($input['model_name']);
            $manufacturer = trim($input['manufacturer'] ?: 'Hero');
            $engine_cc = (int)$input['engine_cc'];
            $color = trim($input['color_options']);
            $price = (float)$input['base_price'];
            $stock = (int)$input['current_stock'];
            
            DB::execute(
                "INSERT INTO bike_model (model_id, model_name, manufacturer, engine_cc, color_options, base_price, current_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')",
                [$model_id, $name, $manufacturer, $engine_cc, $color, $price, $stock]
            );
            
            if ($stock > 0) {
                DB::execute(
                    "INSERT INTO inventory_movement (model_id, movement_type, quantity, reference_id, movement_date, notes) VALUES (?, 'In', ?, NULL, CURDATE(), 'Initial stock intake')",
                    [$model_id, $stock]
                );
            }
            
            logAudit($currentUser['employee_id'], 'Create', 'bike_model', $model_id, null, $input);
            sendResponse(["message" => "Bike model added successfully", "model_id" => $model_id]);
        }
        break;

    case 'inventory/adjust':
        if ($method !== 'POST') sendResponse(["error" => "Method not allowed"], 405);
        $model_id = trim($input['model_id']);
        $type = $input['movement_type']; // 'In', 'Out', 'Adjustment'
        $qty = (int)$input['quantity'];
        $notes = trim($input['notes']);
        
        $bike = DB::queryRow("SELECT * FROM bike_model WHERE model_id = ?", [$model_id]);
        if (!$bike) sendResponse(["error" => "Bike model not found"], 404);
        
        // Calculate new stock
        $newStock = $bike['current_stock'];
        if ($type === 'In') {
            $newStock += $qty;
        } elseif ($type === 'Out') {
            $newStock -= $qty;
        } elseif ($type === 'Adjustment') {
            $newStock = $qty; // Set directly
        }
        
        if ($newStock < 0) sendResponse(["error" => "Insufficient stock level"], 400);
        
        DB::beginTransaction();
        try {
            DB::execute("UPDATE bike_model SET current_stock = ? WHERE model_id = ?", [$newStock, $model_id]);
            DB::execute(
                "INSERT INTO inventory_movement (model_id, movement_type, quantity, reference_id, movement_date, notes) VALUES (?, ?, ?, NULL, CURDATE(), ?)",
                [$model_id, $type, $qty, $notes]
            );
            DB::commit();
            logAudit($currentUser['employee_id'], 'Update', 'bike_model', $model_id, ["current_stock" => $bike['current_stock']], ["current_stock" => $newStock]);
            sendResponse(["message" => "Stock adjusted successfully", "current_stock" => $newStock]);
        } catch (Exception $e) {
            DB::rollBack();
            sendResponse(["error" => "Adjustment failed: " . $e->getMessage()], 500);
        }
        break;

    case 'inventory/parts':
        if ($method === 'GET') {
            $parts = DB::query("SELECT * FROM spare_part");
            sendResponse($parts);
        } elseif ($method === 'POST') {
            $part_id = 'SP' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            $name = trim($input['part_name']);
            $number = trim($input['part_number']);
            $compat = trim($input['compatible_models']);
            $price = (float)$input['unit_price'];
            $stock = (int)$input['current_stock'];
            $min_level = (int)$input['min_stock_level'];
            
            DB::execute(
                "INSERT INTO spare_part (part_id, part_name, part_number, compatible_models, unit_price, current_stock, min_stock_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')",
                [$part_id, $name, $number, $compat, $price, $stock, $min_level]
            );
            logAudit($currentUser['employee_id'], 'Create', 'spare_part', $part_id, null, $input);
            sendResponse(["message" => "Spare part registered successfully", "part_id" => $part_id]);
        }
        break;

    // --- 3. Customers Endpoints ---
    case 'customers':
        if ($method === 'GET') {
            $search = isset($_GET['q']) ? '%' . trim($_GET['q']) . '%' : '%';
            $customers = DB::query(
                "SELECT * FROM customer WHERE first_name LIKE ? OR last_name LIKE ? OR nic LIKE ? OR phone LIKE ?",
                [$search, $search, $search, $search]
            );
            sendResponse($customers);
        } elseif ($method === 'POST') {
            $customer_id = 'CUS' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            $first = trim($input['first_name']);
            $last = trim($input['last_name']);
            $nic = trim($input['nic']);
            $phone = trim($input['phone']);
            $email = trim($input['email']);
            $address = trim($input['address']);
            $type = $input['customer_type'] ?: 'Cash';
            
            DB::execute(
                "INSERT INTO customer (customer_id, first_name, last_name, nic, phone, email, address, registration_date, customer_type) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)",
                [$customer_id, $first, $last, $nic, $phone, $email, $address, $type]
            );
            logAudit($currentUser['employee_id'], 'Create', 'customer', $customer_id, null, $input);
            sendResponse(["message" => "Customer registered successfully", "customer_id" => $customer_id]);
        }
        break;

    // --- 4. Sales and Invoicing Endpoints ---
    case 'sales/create':
        if ($method !== 'POST') sendResponse(["error" => "Method not allowed"], 405);
        $customer_id = trim($input['customer_id']);
        $employee_id = trim($input['employee_id']);
        $model_id = trim($input['model_id']);
        $chassis = trim($input['chassis_number']);
        $engine = trim($input['engine_number']);
        $price = (float)$input['sale_price'];
        $method = $input['payment_method']; // 'Cash', 'Credit', 'Leasing'
        $down_payment = (float)($input['down_payment'] ?: 0.00);
        $balance = $price - $down_payment;
        
        // Validation
        $bike = DB::queryRow("SELECT * FROM bike_model WHERE model_id = ?", [$model_id]);
        if (!$bike || $bike['current_stock'] < 1) {
            sendResponse(["error" => "Bike model is out of stock"], 400);
        }
        
        $transaction_id = 'TX' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        $invoice_id = 'INV' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        
        DB::beginTransaction();
        try {
            // Decrement Stock
            DB::execute("UPDATE bike_model SET current_stock = current_stock - 1 WHERE model_id = ?", [$model_id]);
            
            // Record Sale
            DB::execute(
                "INSERT INTO sales_transaction (transaction_id, customer_id, employee_id, model_id, chassis_number, engine_number, sale_date, sale_price, payment_method, down_payment, balance_amount, status) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, 'Completed')",
                [$transaction_id, $customer_id, $employee_id, $model_id, $chassis, $engine, $price, $method, $down_payment, $balance]
            );
            
            // Record Movement
            DB::execute(
                "INSERT INTO inventory_movement (model_id, movement_type, quantity, reference_id, movement_date, notes) VALUES (?, 'Out', 1, ?, CURDATE(), 'Bike Sales Transaction')",
                [$model_id, $transaction_id]
            );
            
            // Compute Invoice
            $tax = $price * 0.08; // Mock 8% tax
            $discount = (float)($input['discount_amount'] ?: 0.00);
            $net = $price + $tax - $discount;
            $payStatus = ($balance <= 0) ? 'Paid' : 'Partial';
            
            DB::execute(
                "INSERT INTO invoice (invoice_id, transaction_id, invoice_date, total_amount, tax_amount, discount_amount, net_amount, payment_status) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)",
                [$invoice_id, $transaction_id, $price, $tax, $discount, $net, $payStatus]
            );
            
            // Send Automated Welcome SMS (R-SMS-1)
            $customer = DB::queryRow("SELECT * FROM customer WHERE customer_id = ?", [$customer_id]);
            $smsMsg = "Thank you {$customer['first_name']} for purchasing Hero {$bike['model_name']}! Warranty registered. Invoiced: LKR " . number_format($net, 2);
            DB::execute(
                "INSERT INTO sms_log (customer_id, phone_number, message_content, message_type, sent_date, delivery_status, gateway_response) VALUES (?, ?, ?, 'Welcome', NOW(), 'Delivered', 'Mock Gateway SUCCESS')",
                [$customer_id, $customer['phone'], $smsMsg]
            );
            
            DB::commit();
            logAudit($employee_id, 'Create', 'sales_transaction', $transaction_id);
            sendResponse([
                "message" => "Sale processed successfully", 
                "transaction_id" => $transaction_id,
                "invoice_id" => $invoice_id,
                "net_amount" => $net
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            sendResponse(["error" => "Transaction failed: " . $e->getMessage()], 500);
        }
        break;

    case 'sales/list':
        $sales = DB::query(
            "SELECT t.*, c.first_name, c.last_name, b.model_name, i.invoice_id, i.net_amount, i.payment_status 
             FROM sales_transaction t 
             JOIN customer c ON t.customer_id = c.customer_id 
             JOIN bike_model b ON t.model_id = b.model_id
             LEFT JOIN invoice i ON t.transaction_id = i.transaction_id"
        );
        sendResponse($sales);
        break;

    // --- 5. Suppliers Endpoints ---
    case 'suppliers':
        if ($method === 'GET') {
            $suppliers = DB::query("SELECT * FROM supplier");
            sendResponse($suppliers);
        } elseif ($method === 'POST') {
            $supplier_id = 'SUP' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            $company = trim($input['company_name']);
            $contact = trim($input['contact_person']);
            $phone = trim($input['phone']);
            $email = trim($input['email']);
            $address = trim($input['address']);
            $bank = trim($input['bank_details']);
            $limit = (float)$input['credit_limit'];
            
            DB::execute(
                "INSERT INTO supplier (supplier_id, company_name, contact_person, phone, email, address, bank_details, credit_limit, outstanding_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.00)",
                [$supplier_id, $company, $contact, $phone, $email, $address, $bank, $limit]
            );
            logAudit($currentUser['employee_id'], 'Create', 'supplier', $supplier_id, null, $input);
            sendResponse(["message" => "Supplier onboarded successfully", "supplier_id" => $supplier_id]);
        }
        break;

    // --- 6. Employees Endpoints ---
    case 'employees':
        if ($method === 'GET') {
            $employees = DB::query("SELECT employee_id, full_name, nic, designation, salary, join_date, phone, access_level, username FROM employee");
            sendResponse($employees);
        } elseif ($method === 'POST') {
            $employee_id = 'EMP' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            $name = trim($input['full_name']);
            $nic = trim($input['nic']);
            $desig = trim($input['designation']);
            $salary = (float)$input['salary'];
            $join = $input['join_date'] ?: date('Y-m-d');
            $phone = trim($input['phone']);
            $level = $input['access_level'];
            $user = trim($input['username']);
            $pass = password_hash($input['password'], PASSWORD_BCRYPT);
            
            DB::execute(
                "INSERT INTO employee (employee_id, full_name, nic, designation, salary, join_date, phone, access_level, username, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [$employee_id, $name, $nic, $desig, $salary, $join, $phone, $level, $user, $pass]
            );
            logAudit($currentUser['employee_id'], 'Create', 'employee', $employee_id);
            sendResponse(["message" => "Employee registered successfully", "employee_id" => $employee_id]);
        }
        break;

    // --- 7. Partners (Leasing & Insurance) Endpoints ---
    case 'partners/leasing':
        $leasing = DB::query("SELECT * FROM leasing_company");
        sendResponse($leasing);
        break;

    case 'partners/insurance':
        $insurance = DB::query("SELECT * FROM insurance_company");
        sendResponse($insurance);
        break;

    // --- 8. Reports & Analytics ---
    case 'reports/dashboard':
        $totalSales = DB::queryRow("SELECT SUM(sale_price) as sum FROM sales_transaction WHERE status = 'Completed'")['sum'] ?: 0;
        $activeBikes = DB::queryRow("SELECT COUNT(*) as count FROM bike_model WHERE status = 'Active'")['count'] ?: 0;
        $totalCustomers = DB::queryRow("SELECT COUNT(*) as count FROM customer")['count'] ?: 0;
        $lowStock = DB::queryRow("SELECT COUNT(*) as count FROM bike_model WHERE current_stock <= 2")['count'] ?: 0;
        $recentTrans = DB::query("SELECT t.transaction_id, b.model_name, t.sale_price, t.sale_date FROM sales_transaction t JOIN bike_model b ON t.model_id = b.model_id ORDER BY t.sale_date DESC LIMIT 5");
        
        sendResponse([
            "total_sales" => (float)$totalSales,
            "bike_models" => (int)$activeBikes,
            "total_customers" => (int)$totalCustomers,
            "low_stock_alerts" => (int)$lowStock,
            "recent_transactions" => $recentTrans
        ]);
        break;

    // --- 9. Logs Endpoints ---
    case 'sms/logs':
        $logs = DB::query("SELECT s.*, c.first_name, c.last_name FROM sms_log s JOIN customer c ON s.customer_id = c.customer_id ORDER BY s.sent_date DESC");
        sendResponse($logs);
        break;

    case 'audit/logs':
        $logs = DB::query("SELECT * FROM audit_log ORDER BY action_timestamp DESC LIMIT 100");
        sendResponse($logs);
        break;

    default:
        sendResponse(["error" => "API endpoint not found: " . $path], 404);
        break;
    }
} catch (Exception $e) {
    error_log("API Exception: " . $e->getMessage());
    ob_end_clean();
    sendResponse(["error" => "Internal server error: " . $e->getMessage()], 500);
}
