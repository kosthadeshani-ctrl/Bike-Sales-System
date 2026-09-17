// frontend/src/services/api.ts
// Dual-mode API Service: Real PHP API backend connection with client-side LocalStorage fallback.

const API_BASE = '/api';

// Seed data corresponding to database/schema.sql
const SEED_DATA = {
  employees: [
    { employee_id: 'EMP001', full_name: 'Dasan Dasanayaka', nic: '981234567V', designation: 'Administrator', salary: 85000, join_date: '2025-01-10', phone: '0771234567', access_level: 'Admin', username: 'admin' },
    { employee_id: 'EMP002', full_name: 'Samantha Bandara', nic: '957654321V', designation: 'Manager', salary: 75000, join_date: '2025-02-15', phone: '0717654321', access_level: 'Manager', username: 'manager' },
    { employee_id: 'EMP003', full_name: 'Ruvini Perera', nic: '998765432V', designation: 'Sales Executive', salary: 45000, join_date: '2025-03-01', phone: '0759876543', access_level: 'Sales', username: 'sales' },
    { employee_id: 'EMP004', full_name: 'Kasun Silva', nic: '971122334V', designation: 'Inventory Clerk', salary: 40000, join_date: '2025-04-10', phone: '0761122334', access_level: 'Inventory', username: 'inventory' },
    { employee_id: 'EMP005', full_name: 'Nimal Fernando', nic: '943344556V', designation: 'Finance Officer', salary: 50000, join_date: '2025-05-12', phone: '0723344556', access_level: 'Finance', username: 'finance' }
  ],
  bikes: [
    { model_id: 'BM001', model_name: 'Hero Splendor Plus', manufacturer: 'Hero', engine_cc: 110, color_options: 'Red, Black, Silver', base_price: 380000, current_stock: 12, status: 'Active' },
    { model_id: 'BM002', model_name: 'Hero Thriller 160R', manufacturer: 'Hero', engine_cc: 160, color_options: 'Red, Blue, Matte Grey', base_price: 520000, current_stock: 4, status: 'Active' },
    { model_id: 'BM003', model_name: 'Hero Glamour XTEC', manufacturer: 'Hero', engine_cc: 125, color_options: 'Black, Grey, Blue', base_price: 420000, current_stock: 2, status: 'Active' },
    { model_id: 'BM004', model_name: 'Hero Pleasure Plus', manufacturer: 'Hero', engine_cc: 110, color_options: 'Yellow, Red, Matte Black', base_price: 350000, current_stock: 8, status: 'Active' },
    { model_id: 'BM005', model_name: 'Hero XPulse 200 4V', manufacturer: 'Hero', engine_cc: 200, color_options: 'Blue, White, Red', base_price: 650000, current_stock: 0, status: 'Active' }
  ],
  parts: [
    { part_id: 'SP001', part_name: 'Front Brake Pad (Splendor)', part_number: 'BP-SPL-01', compatible_models: 'Hero Splendor Plus', unit_price: 1250, current_stock: 25, min_stock_level: 10, status: 'Active' },
    { part_id: 'SP002', part_name: 'Spark Plug (Generic)', part_number: 'SP-GEN-10', compatible_models: 'All Hero Models', unit_price: 450, current_stock: 60, min_stock_level: 15, status: 'Active' },
    { part_id: 'SP003', part_name: 'Engine Oil (Hero 4T 1L)', part_number: 'EO-HERO-4T', compatible_models: 'All Hero Models', unit_price: 1850, current_stock: 12, min_stock_level: 10, status: 'Active' },
    { part_id: 'SP004', part_name: 'Air Filter (Pleasure)', part_number: 'AF-PLS-02', compatible_models: 'Hero Pleasure Plus', unit_price: 950, current_stock: 4, min_stock_level: 8, status: 'Active' },
    { part_id: 'SP005', part_name: 'Drive Chain Kit (Thriller)', part_number: 'CK-THR-16', compatible_models: 'Hero Thriller 160R', unit_price: 4800, current_stock: 8, min_stock_level: 5, status: 'Active' }
  ],
  suppliers: [
    { supplier_id: 'SUP001', company_name: 'Hero MotoCorp Lanka', contact_person: 'Jagath Alwis', phone: '0112345678', email: 'orders@herolanka.lk', address: 'Colombo Road, Peliyagoda', bank_details: 'BOC - 123456789 - Peliyagoda', credit_limit: 5000000, outstanding_balance: 1250000 },
    { supplier_id: 'SUP002', company_name: 'Lanka Spare Parts Ltd', contact_person: 'M. N. Perera', phone: '0119876543', email: 'sales@lankaspares.com', address: 'Panchikawatta Road, Colombo 10', bank_details: 'Sampath Bank - 987654321 - Panchikawatta', credit_limit: 500000, outstanding_balance: 45000 }
  ],
  leasing: [
    { leasing_id: 'LC001', company_name: 'LB Finance PLC', registration_no: 'LB-REG-991', contact_person: 'Nalin Silva', phone: '0452222222', email: 'info@lbfinance.lk', interest_rate: 14.5, max_tenure: 48, min_down_payment: 20.0 },
    { leasing_id: 'LC002', company_name: 'Commercial Leasing & Finance', registration_no: 'CLC-REG-452', contact_person: 'Kamal Perera', phone: '0453333333', email: 'leasing@clc.lk', interest_rate: 15.0, max_tenure: 60, min_down_payment: 25.0 }
  ],
  insurance: [
    { insurance_id: 'IC001', company_name: 'Ceylinco General Insurance', license_no: 'CEY-INS-001', contact_person: 'Ruwan Fernando', phone: '0454444444', coverage_types: 'Third Party, Comprehensive, Full Option', commission_rate: 8.5 },
    { insurance_id: 'IC002', company_name: 'Sri Lanka Insurance (SLIC)', license_no: 'SLI-INS-002', contact_person: 'Anura Kumara', phone: '0455555555', coverage_types: 'Third Party, Comprehensive', commission_rate: 7.5 }
  ],
  customers: [
    { customer_id: 'CUS001', first_name: 'Sunil', last_name: 'Perera', nic: '751234567V', phone: '0714567890', email: 'sunil@gmail.com', address: '12/A, Kaltota Road, Balangoda', registration_date: '2025-05-15', customer_type: 'Cash', username: 'sunil' },
    { customer_id: 'CUS002', first_name: 'Priyantha', last_name: 'Silva', nic: '823456789V', phone: '0772345678', email: 'priyantha@yahoo.com', address: '45, Main Street, Balangoda', registration_date: '2025-05-20', customer_type: 'Credit', username: 'priyantha' },
    { customer_id: 'CUS003', first_name: 'Dilini',  last_name: 'Fernando', nic: '948765432V', phone: '0763456789', email: 'dilini@gmail.com', address: '78, Rathnapura Road, Balangoda', registration_date: '2025-06-01', customer_type: 'Cash', username: 'dilini' }
  ],
  sales: [
    { transaction_id: 'TX4092', customer_id: 'CUS001', employee_id: 'EMP003', model_id: 'BM001', chassis_number: 'CHA-12345-X', engine_number: 'ENG-98765-Y', sale_date: '2025-06-10', sale_price: 380000, payment_method: 'Cash', down_payment: 380000, balance_amount: 0, status: 'Completed', first_name: 'Sunil', last_name: 'Perera', model_name: 'Hero Splendor Plus', invoice_id: 'INV1042', net_amount: 410400, payment_status: 'Paid' }
  ],
  smsLogs: [
    { sms_id: 1, customer_id: 'CUS001', phone_number: '0714567890', message_content: 'Thank you Sunil for purchasing Hero Splendor Plus! Warranty registered. Invoiced: LKR 410,400.00', message_type: 'Welcome', sent_date: '2025-06-10 14:32:00', delivery_status: 'Delivered', gateway_response: 'Mock Gateway SUCCESS' }
  ],
  auditLogs: [
    { log_id: 1, user_id: 'EMP001', action_type: 'Login', table_affected: 'employee', record_id: 'EMP001', old_values: null, new_values: null, action_timestamp: '2025-06-10 08:30:00', ip_address: '127.0.0.1' }
  ]
};

// Initialize localStorage if not set
const initializeLocalStorage = () => {
  Object.entries(SEED_DATA).forEach(([key, value]) => {
    if (!localStorage.getItem(`bsms_${key}`)) {
      localStorage.setItem(`bsms_${key}`, JSON.stringify(value));
    }
  });
};
initializeLocalStorage();

// Helper to interact with LocalStorage
const getLocal = (key: string) => JSON.parse(localStorage.getItem(`bsms_${key}`) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(`bsms_${key}`, JSON.stringify(data));

const mockLogAudit = (userId: string, actionType: string, table: string, recordId: string, oldVal: any = null, newVal: any = null) => {
  const logs = getLocal('auditLogs');
  const newLog = {
    log_id: logs.length + 1,
    user_id: userId || 'system',
    action_type: actionType,
    table_affected: table,
    record_id: recordId,
    old_values: oldVal,
    new_values: newVal,
    action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip_address: '127.0.0.1'
  };
  logs.unshift(newLog);
  setLocal('auditLogs', logs);
};

// Network checker to decide whether to run real API or fallback to mock
let isBackendOffline = false;

async function apiRequest(path: string, options: RequestInit = {}) {
  if (isBackendOffline) {
    throw new Error("Running in offline mock mode");
  }
  
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      ...options,
      credentials: options.credentials ?? 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    
    // For auth/session, 401 is expected when not authenticated - just return null
    if (res.status === 401 && path === 'auth/session') {
      return null;
    }
    
    if (res.status === 401 && path !== 'auth/login') {
      window.location.reload();
      throw new Error("Session expired");
    }
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "API request failed");
    }
    
    return await res.json();
  } catch (e) {
    console.warn(`API path '${path}' failed. Falling back to LocalStorage Mock database.`, e);
    // If it's a connection refused, mark backend offline for current session
    if (e instanceof TypeError) {
      isBackendOffline = true;
    }
    throw e;
  }
}

// Global active session state for standalone fallback
let mockSessionUser: any = JSON.parse(sessionStorage.getItem('bsms_session') || 'null');

export const apiService = {
  // Check Mode
  isMockMode: () => isBackendOffline || mockSessionUser !== null,

  // --- AUTH SERVICES ---
  login: async (username: string, password: string) => {
    try {
      const data = await apiRequest('auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      sessionStorage.setItem('bsms_session', JSON.stringify(data.user));
      return data.user;
    } catch (e) {
      // Standalone Mock Logic
      const employees = getLocal('employees');
      const user = employees.find((e: any) => e.username === username);
      if (user && password === 'Password123!') { // Standard password for mock
        sessionStorage.setItem('bsms_session', JSON.stringify(user));
        mockSessionUser = user;
        mockLogAudit(user.employee_id, 'Login', 'employee', user.employee_id);
        return user;
      }
      
      const customers = getLocal('customers');
      const cust = customers.find((c: any) => c.username === username);
      if (cust && password === 'Password123!') {
        const sessionUser = {
          employee_id: cust.customer_id,
          full_name: cust.first_name + ' ' + cust.last_name,
          nic: cust.nic,
          designation: 'Customer Profile',
          salary: 0,
          join_date: cust.registration_date,
          phone: cust.phone,
          access_level: 'Customer',
          username: cust.username
        };
        sessionStorage.setItem('bsms_session', JSON.stringify(sessionUser));
        mockSessionUser = sessionUser;
        mockLogAudit(cust.customer_id, 'Login', 'customer', cust.customer_id);
        return sessionUser;
      }
      throw new Error("Invalid username or password (use password: Password123!)");
    }
  },

  logout: async () => {
    try {
      await apiRequest('auth/logout', { method: 'POST' });
    } catch (e) {
      // Mock logout
      if (mockSessionUser) {
        mockLogAudit(mockSessionUser.employee_id, 'Logout', 'employee', mockSessionUser.employee_id);
      }
    }
    sessionStorage.removeItem('bsms_session');
    mockSessionUser = null;
  },

  getSession: async () => {
    try {
      const data = await apiRequest('auth/session');
      return data ? data.user : mockSessionUser; // If null response (401), return mock session
    } catch (e) {
      return mockSessionUser;
    }
  },

  // --- INVENTORY SERVICES ---
  getBikes: async () => {
    try {
      return await apiRequest('inventory/bikes');
    } catch (e) {
      return getLocal('bikes');
    }
  },

  addBike: async (bike: any) => {
    try {
      return await apiRequest('inventory/bikes', {
        method: 'POST',
        body: JSON.stringify(bike)
      });
    } catch (e) {
      const bikes = getLocal('bikes');
      const model_id = 'BM' + String(bikes.length + 1).padStart(3, '0');
      const newBike = {
        model_id,
        model_name: bike.model_name,
        manufacturer: bike.manufacturer || 'Hero',
        engine_cc: Number(bike.engine_cc),
        color_options: bike.color_options,
        base_price: Number(bike.base_price),
        current_stock: Number(bike.current_stock),
        status: 'Active'
      };
      bikes.push(newBike);
      setLocal('bikes', bikes);
      mockLogAudit(mockSessionUser?.employee_id, 'Create', 'bike_model', model_id, null, newBike);
      return newBike;
    }
  },

  adjustStock: async (model_id: string, type: 'In'|'Out'|'Adjustment', qty: number, notes: string) => {
    try {
      return await apiRequest('inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({ model_id, movement_type: type, quantity: qty, notes })
      });
    } catch (e) {
      const bikes = getLocal('bikes');
      const bikeIndex = bikes.findIndex((b: any) => b.model_id === model_id);
      if (bikeIndex === -1) throw new Error("Bike model not found");
      
      const oldStock = bikes[bikeIndex].current_stock;
      let newStock = oldStock;
      if (type === 'In') newStock += qty;
      else if (type === 'Out') newStock -= qty;
      else if (type === 'Adjustment') newStock = qty;
      
      if (newStock < 0) throw new Error("Insufficient stock level");
      
      bikes[bikeIndex].current_stock = newStock;
      setLocal('bikes', bikes);
      mockLogAudit(mockSessionUser?.employee_id, 'Update', 'bike_model', model_id, { current_stock: oldStock }, { current_stock: newStock });
      return { current_stock: newStock };
    }
  },

  getSpareParts: async () => {
    try {
      return await apiRequest('inventory/parts');
    } catch (e) {
      return getLocal('parts');
    }
  },

  addSparePart: async (part: any) => {
    try {
      return await apiRequest('inventory/parts', {
        method: 'POST',
        body: JSON.stringify(part)
      });
    } catch (e) {
      const parts = getLocal('parts');
      const part_id = 'SP' + String(parts.length + 1).padStart(3, '0');
      const newPart = {
        part_id,
        part_name: part.part_name,
        part_number: part.part_number,
        compatible_models: part.compatible_models,
        unit_price: Number(part.unit_price),
        current_stock: Number(part.current_stock),
        min_stock_level: Number(part.min_stock_level),
        status: 'Active'
      };
      parts.push(newPart);
      setLocal('parts', parts);
      mockLogAudit(mockSessionUser?.employee_id, 'Create', 'spare_part', part_id, null, newPart);
      return newPart;
    }
  },

  // --- CUSTOMER SERVICES ---
  getCustomers: async (q = '') => {
    try {
      return await apiRequest(`customers?q=${q}`);
    } catch (e) {
      const customers = getLocal('customers');
      if (!q) return customers;
      const term = q.toLowerCase();
      return customers.filter((c: any) => 
        c.first_name.toLowerCase().includes(term) ||
        c.last_name.toLowerCase().includes(term) ||
        c.nic.toLowerCase().includes(term) ||
        c.phone.includes(term)
      );
    }
  },

  addCustomer: async (customer: any) => {
    try {
      return await apiRequest('customers', {
        method: 'POST',
        body: JSON.stringify(customer)
      });
    } catch (e) {
      const customers = getLocal('customers');
      const customer_id = 'CUS' + String(customers.length + 1).padStart(3, '0');
      const newCust = {
        customer_id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        nic: customer.nic,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        registration_date: new Date().toISOString().substring(0, 10),
        customer_type: customer.customer_type || 'Cash'
      };
      customers.push(newCust);
      setLocal('customers', customers);
      mockLogAudit(mockSessionUser?.employee_id, 'Create', 'customer', customer_id, null, newCust);
      return newCust;
    }
  },

  // --- SALES SERVICES ---
  getSales: async () => {
    try {
      return await apiRequest('sales/list');
    } catch (e) {
      return getLocal('sales');
    }
  },

  createSale: async (sale: any) => {
    try {
      return await apiRequest('sales/create', {
        method: 'POST',
        body: JSON.stringify(sale)
      });
    } catch (e) {
      // Mock Transaction
      const bikes = getLocal('bikes');
      const bike = bikes.find((b: any) => b.model_id === sale.model_id);
      if (!bike || bike.current_stock < 1) throw new Error("Bike model is out of stock");
      
      // Decrement Stock
      bike.current_stock -= 1;
      setLocal('bikes', bikes);
      
      const sales = getLocal('sales');
      const txId = 'TX' + String(Math.floor(1000 + Math.random() * 9000));
      const invId = 'INV' + String(Math.floor(1000 + Math.random() * 9000));
      
      const price = Number(sale.sale_price);
      const down = Number(sale.down_payment || 0);
      const balance = price - down;
      const tax = price * 0.08;
      const discount = Number(sale.discount_amount || 0);
      const net = price + tax - discount;
      
      const customer = getLocal('customers').find((c: any) => c.customer_id === sale.customer_id);
      
      const newSale = {
        transaction_id: txId,
        customer_id: sale.customer_id,
        employee_id: sale.employee_id,
        model_id: sale.model_id,
        chassis_number: sale.chassis_number,
        engine_number: sale.engine_number,
        sale_date: new Date().toISOString().substring(0, 10),
        sale_price: price,
        payment_method: sale.payment_method,
        down_payment: down,
        balance_amount: balance,
        status: 'Completed',
        first_name: customer ? customer.first_name : 'Walk-in',
        last_name: customer ? customer.last_name : 'Customer',
        model_name: bike.model_name,
        invoice_id: invId,
        net_amount: net,
        payment_status: balance <= 0 ? 'Paid' : 'Partial'
      };
      
      sales.unshift(newSale);
      setLocal('sales', sales);
      
      // Record movement
      const movements = getLocal('movements');
      movements.push({
        movement_id: movements.length + 1,
        model_id: sale.model_id,
        movement_type: 'Out',
        quantity: 1,
        reference_id: txId,
        movement_date: new Date().toISOString().substring(0, 10),
        notes: 'Bike Sales Transaction'
      });
      setLocal('movements', movements);

      // Record SMS log
      const smsLogs = getLocal('smsLogs');
      const smsMsg = `Thank you ${customer?.first_name || 'Customer'} for purchasing Hero ${bike.model_name}! Warranty registered. Invoiced: LKR ${net.toLocaleString()}`;
      smsLogs.unshift({
        sms_id: smsLogs.length + 1,
        customer_id: sale.customer_id,
        phone_number: customer?.phone || '0000000000',
        message_content: smsMsg,
        message_type: 'Welcome',
        sent_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        delivery_status: 'Delivered',
        gateway_response: 'Mock Gateway SUCCESS'
      });
      setLocal('smsLogs', smsLogs);
      
      mockLogAudit(sale.employee_id, 'Create', 'sales_transaction', txId);
      return {
        message: "Sale processed successfully",
        transaction_id: txId,
        invoice_id: invId,
        net_amount: net
      };
    }
  },

  // --- SUPPLIER SERVICES ---
  getSuppliers: async () => {
    try {
      return await apiRequest('suppliers');
    } catch (e) {
      return getLocal('suppliers');
    }
  },

  addSupplier: async (sup: any) => {
    try {
      return await apiRequest('suppliers', {
        method: 'POST',
        body: JSON.stringify(sup)
      });
    } catch (e) {
      const suppliers = getLocal('suppliers');
      const supplier_id = 'SUP' + String(suppliers.length + 1).padStart(3, '0');
      const newSup = {
        supplier_id,
        company_name: sup.company_name,
        contact_person: sup.contact_person,
        phone: sup.phone,
        email: sup.email,
        address: sup.address,
        bank_details: sup.bank_details,
        credit_limit: Number(sup.credit_limit),
        outstanding_balance: 0
      };
      suppliers.push(newSup);
      setLocal('suppliers', suppliers);
      mockLogAudit(mockSessionUser?.employee_id, 'Create', 'supplier', supplier_id, null, newSup);
      return newSup;
    }
  },

  // --- PARTNER SERVICES ---
  getLeasing: async () => {
    try {
      return await apiRequest('partners/leasing');
    } catch (e) {
      return getLocal('leasing');
    }
  },

  getInsurance: async () => {
    try {
      return await apiRequest('partners/insurance');
    } catch (e) {
      return getLocal('insurance');
    }
  },

  // --- EMPLOYEE SERVICES ---
  getEmployees: async () => {
    try {
      return await apiRequest('employees');
    } catch (e) {
      return getLocal('employees');
    }
  },

  addEmployee: async (emp: any) => {
    try {
      return await apiRequest('employees', {
        method: 'POST',
        body: JSON.stringify(emp)
      });
    } catch (e) {
      const employees = getLocal('employees');
      const employee_id = 'EMP' + String(employees.length + 1).padStart(3, '0');
      const newEmp = {
        employee_id,
        full_name: emp.full_name,
        nic: emp.nic,
        designation: emp.designation,
        salary: Number(emp.salary),
        join_date: emp.join_date || new Date().toISOString().substring(0, 10),
        phone: emp.phone,
        access_level: emp.access_level,
        username: emp.username
      };
      employees.push(newEmp);
      setLocal('employees', employees);
      mockLogAudit(mockSessionUser?.employee_id, 'Create', 'employee', employee_id);
      return newEmp;
    }
  },

  // --- REPORT SERVICES ---
  getDashboardStats: async () => {
    try {
      return await apiRequest('reports/dashboard');
    } catch (e) {
      const sales = getLocal('sales');
      const bikes = getLocal('bikes');
      const customers = getLocal('customers');
      
      const totalSales = sales.reduce((acc: number, curr: any) => acc + curr.sale_price, 0);
      const lowStockAlerts = bikes.filter((b: any) => b.current_stock <= 2).length;
      
      return {
        total_sales: totalSales,
        bike_models: bikes.length,
        total_customers: customers.length,
        low_stock_alerts: lowStockAlerts,
        recent_transactions: sales.slice(0, 5).map((s: any) => ({
          transaction_id: s.transaction_id,
          model_name: s.model_name,
          sale_price: s.sale_price,
          sale_date: s.sale_date
        }))
      };
    }
  },

  // --- LOGS ---
  getSMSLogs: async () => {
    try {
      return await apiRequest('sms/logs');
    } catch (e) {
      return getLocal('smsLogs');
    }
  },

  getAuditLogs: async () => {
    try {
      return await apiRequest('audit/logs');
    } catch (e) {
      return getLocal('auditLogs');
    }
  },

  registerCustomer: async (customer: any) => {
    try {
      const data = await apiRequest('auth/register', {
        method: 'POST',
        body: JSON.stringify(customer)
      });
      sessionStorage.setItem('bsms_session', JSON.stringify(data.user));
      mockSessionUser = data.user;
      return data.user;
    } catch (e) {
      const customers = getLocal('customers');
      const exists = customers.some((c: any) => c.username === customer.username || c.nic === customer.nic);
      if (exists) throw new Error("Username or NIC already registered");

      const customer_id = 'CUS' + String(customers.length + 1).padStart(3, '0');
      const newCust = {
        customer_id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        nic: customer.nic,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        registration_date: new Date().toISOString().substring(0, 10),
        customer_type: 'Cash',
        username: customer.username
      };
      customers.push(newCust);
      setLocal('customers', customers);

      const sessionUser = {
        employee_id: customer_id,
        full_name: customer.first_name + ' ' + customer.last_name,
        nic: customer.nic,
        designation: 'Customer Profile',
        salary: 0,
        join_date: newCust.registration_date,
        phone: customer.phone,
        access_level: 'Customer',
        username: customer.username
      };

      sessionStorage.setItem('bsms_session', JSON.stringify(sessionUser));
      mockSessionUser = sessionUser;
      mockLogAudit(customer_id, 'Create', 'customer', customer_id);
      return sessionUser;
    }
  }
};
