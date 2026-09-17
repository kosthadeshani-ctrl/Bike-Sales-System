-- MySQL Schema for Bike Sales Management System (BSMS)
-- Target Database: bsms_db

DROP DATABASE IF EXISTS bsms_db;
CREATE DATABASE bsms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bsms_db;
SET NAMES utf8mb4;
SET default_storage_engine=INNODB;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customer (
    customer_id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    nic VARCHAR(15) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    registration_date DATE NOT NULL,
    customer_type ENUM('Cash', 'Credit') NOT NULL DEFAULT 'Cash',
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bike Models Table
CREATE TABLE IF NOT EXISTS bike_model (
    model_id VARCHAR(20) PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL DEFAULT 'Hero',
    engine_cc INT NOT NULL,
    color_options VARCHAR(255) NOT NULL, -- e.g., 'Red, Blue, Black'
    base_price DECIMAL(10,2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Spare Parts Table (R-INV-6)
CREATE TABLE IF NOT EXISTS spare_part (
    part_id VARCHAR(20) PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    part_number VARCHAR(50) NOT NULL UNIQUE,
    compatible_models VARCHAR(255),
    unit_price DECIMAL(10,2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Employees Table
CREATE TABLE IF NOT EXISTS employee (
    employee_id VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    nic VARCHAR(15) NOT NULL UNIQUE,
    designation VARCHAR(50) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    join_date DATE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    access_level ENUM('Admin', 'Manager', 'Sales', 'Inventory', 'Finance') NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sales Transactions Table
CREATE TABLE IF NOT EXISTS sales_transaction (
    transaction_id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    employee_id VARCHAR(20) NOT NULL,
    model_id VARCHAR(20) NOT NULL,
    chassis_number VARCHAR(50) NOT NULL UNIQUE,
    engine_number VARCHAR(50) NOT NULL UNIQUE,
    sale_date DATE NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Credit', 'Leasing') NOT NULL,
    down_payment DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('Completed', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id),
    FOREIGN KEY (model_id) REFERENCES bike_model(model_id)
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id VARCHAR(20) PRIMARY KEY,
    transaction_id VARCHAR(20) NOT NULL UNIQUE,
    invoice_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Paid', 'Unpaid', 'Partial') NOT NULL DEFAULT 'Unpaid',
    FOREIGN KEY (transaction_id) REFERENCES sales_transaction(transaction_id)
);

-- 7. Inventory Movements Table
CREATE TABLE IF NOT EXISTS inventory_movement (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    model_id VARCHAR(20) NOT NULL,
    movement_type ENUM('In', 'Out', 'Adjustment') NOT NULL,
    quantity INT NOT NULL,
    reference_id VARCHAR(20), -- references purchase order or sales transaction
    movement_date DATE NOT NULL,
    notes TEXT,
    FOREIGN KEY (model_id) REFERENCES bike_model(model_id)
);

-- 8. Suppliers Table
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id VARCHAR(20) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    bank_details TEXT,
    credit_limit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    outstanding_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- 9. Leasing Companies Table
CREATE TABLE IF NOT EXISTS leasing_company (
    leasing_id VARCHAR(20) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    registration_no VARCHAR(50) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- e.g. 12.50 for 12.5%
    max_tenure INT NOT NULL, -- in months
    min_down_payment DECIMAL(5,2) NOT NULL DEFAULT 0.00 -- e.g. 20.00 for 20%
);

-- 10. Insurance Companies Table
CREATE TABLE IF NOT EXISTS insurance_company (
    insurance_id VARCHAR(20) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    license_no VARCHAR(50) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    coverage_types VARCHAR(255) NOT NULL, -- e.g. 'Third Party, Full Option'
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00
);

-- 11. SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_log (
    sms_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    message_content TEXT NOT NULL,
    message_type ENUM('Welcome', 'Reminder', 'Promotion', 'Alert') NOT NULL,
    sent_date DATETIME NOT NULL,
    delivery_status ENUM('Sent', 'Delivered', 'Failed') NOT NULL DEFAULT 'Sent',
    gateway_response TEXT,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- 12. Audit Logs Table
DROP TABLE IF EXISTS audit_log;
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    action_type ENUM('Create', 'Update', 'Delete', 'Login', 'Logout') NOT NULL,
    table_affected VARCHAR(50) NOT NULL,
    record_id VARCHAR(20) NOT NULL,
    old_values JSON,
    new_values JSON,
    action_timestamp DATETIME NOT NULL,
    ip_address VARCHAR(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Seed Data for Testing and Initial Setup
-- -------------------------------------------------------------

-- Seed Initial Users (Passwords are hashed for security, but for mock, let's keep bcrypt-hashed strings. Password for all is 'Password123!')
-- BCrypt hash of 'Password123!': $2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm
INSERT INTO employee (employee_id, full_name, nic, designation, salary, join_date, phone, access_level, username, password_hash) VALUES
('EMP001', 'Dasan Dasanayaka', '981234567V', 'Administrator', 85000.00, '2025-01-10', '0771234567', 'Admin', 'admin', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'),
('EMP002', 'Samantha Bandara', '957654321V', 'Manager', 75000.00, '2025-02-15', '0717654321', 'Manager', 'manager', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'),
('EMP003', 'Ruvini Perera', '998765432V', 'Sales Executive', 45000.00, '2025-03-01', '0759876543', 'Sales', 'sales', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'),
('EMP004', 'Kasun Silva', '971122334V', 'Inventory Clerk', 40000.00, '2025-04-10', '0761122334', 'Inventory', 'inventory', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'),
('EMP005', 'Nimal Fernando', '943344556V', 'Finance Officer', 50000.00, '2025-05-12', '0723344556', 'Finance', 'finance', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm');

-- Seed Bike Models (BM005 has 0 stock to trigger low-stock alert)
INSERT INTO bike_model (model_id, model_name, manufacturer, engine_cc, color_options, base_price, current_stock, status) VALUES
('BM001', 'Hero Splendor Plus', 'Hero', 110, 'Red, Black, Silver', 380000.00, 12, 'Active'),
('BM002', 'Hero Thriller 160R', 'Hero', 160, 'Red, Blue, Matte Grey', 520000.00, 4, 'Active'),
('BM003', 'Hero Glamour XTEC', 'Hero', 125, 'Black, Grey, Blue', 420000.00, 2, 'Active'),
('BM004', 'Hero Pleasure Plus', 'Hero', 110, 'Yellow, Red, Matte Black', 350000.00, 8, 'Active'),
('BM005', 'Hero XPulse 200 4V', 'Hero', 200, 'Blue, White, Red', 650000.00, 0, 'Active');

-- Seed Spare Parts (SP004 has low stock)
INSERT INTO spare_part (part_id, part_name, part_number, compatible_models, unit_price, current_stock, min_stock_level, status) VALUES
('SP001', 'Front Brake Pad (Splendor)', 'BP-SPL-01', 'Hero Splendor Plus', 1250.00, 25, 10, 'Active'),
('SP002', 'Spark Plug (Generic)', 'SP-GEN-10', 'All Hero Models', 450.00, 60, 15, 'Active'),
('SP003', 'Engine Oil (Hero 4T 1L)', 'EO-HERO-4T', 'All Hero Models', 1850.00, 12, 10, 'Active'),
('SP004', 'Air Filter (Pleasure)', 'AF-PLS-02', 'Hero Pleasure Plus', 950.00, 4, 8, 'Active'),
('SP005', 'Drive Chain Kit (Thriller)', 'CK-THR-16', 'Hero Thriller 160R', 4800.00, 8, 5, 'Active');

-- Seed Suppliers
INSERT INTO supplier (supplier_id, company_name, contact_person, phone, email, address, bank_details, credit_limit, outstanding_balance) VALUES
('SUP001', 'Hero MotoCorp Lanka', 'Jagath Alwis', '0112345678', 'orders@herolanka.lk', 'Colombo Road, Peliyagoda', 'BOC - 123456789 - Peliyagoda', 5000000.00, 1250000.00),
('SUP002', 'Lanka Spare Parts Ltd', 'M. N. Perera', '0119876543', 'sales@lankaspares.com', 'Panchikawatta Road, Colombo 10', 'Sampath Bank - 987654321 - Panchikawatta', 500000.00, 45000.00);

-- Seed Leasing Companies
INSERT INTO leasing_company (leasing_id, company_name, registration_no, contact_person, phone, email, interest_rate, max_tenure, min_down_payment) VALUES
('LC001', 'LB Finance PLC', 'LB-REG-991', 'Nalin Silva', '0452222222', 'info@lbfinance.lk', 14.50, 48, 20.00),
('LC002', 'Commercial Leasing & Finance', 'CLC-REG-452', 'Kamal Perera', '0453333333', 'leasing@clc.lk', 15.00, 60, 25.00);

-- Seed Insurance Companies
INSERT INTO insurance_company (insurance_id, company_name, license_no, contact_person, phone, coverage_types, commission_rate) VALUES
('IC001', 'Ceylinco General Insurance', 'CEY-INS-001', 'Ruwan Fernando', '0454444444', 'Third Party, Comprehensive, Full Option', 8.50),
('IC002', 'Sri Lanka Insurance (SLIC)', 'SLI-INS-002', 'Anura Kumara', '0455555555', 'Third Party, Comprehensive', 7.50);

-- Seed Customers (Passwords are also 'Password123!', BCrypt hash: $2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm)
INSERT INTO customer (customer_id, first_name, last_name, nic, phone, email, address, registration_date, customer_type, username, password_hash) VALUES
('CUS001', 'Sunil', 'Perera', '751234567V', '0714567890', 'sunil@gmail.com', '12/A, Kaltota Road, Balangoda', '2025-05-15', 'Cash', 'sunil', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'),
('CUS002', 'Priyantha', 'Silva', '823456789V', '0772345678', 'priyantha@yahoo.com', '45, Main Street, Balangoda', '2025-05-20', 'Credit', 'priyantha', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'),
('CUS003', 'Dilini',  'Fernando', '948765432V', '0763456789', 'dilini@gmail.com', '78, Rathnapura Road, Balangoda', '2025-06-01', 'Cash', 'dilini', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm');
