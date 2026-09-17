// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { apiService } from './services/api';

// Views
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { Sales } from './views/Sales';
import { Customers } from './views/Customers';
import { Employees } from './views/Employees';
import { Suppliers } from './views/Suppliers';
import { Partners } from './views/Partners';
import { SMSLogs } from './views/SMSLogs';
import { AuditLogs } from './views/AuditLogs';
import { Company } from './views/Company';
import { CustomerPortal } from './views/CustomerPortal';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Global low stock cache for Header alert triggers
  const [lowStockBikes, setLowStockBikes] = useState<any[]>([]);
  const [lowStockParts, setLowStockParts] = useState<any[]>([]);

  const fetchSession = async () => {
    try {
      const user = await apiService.getSession();
      if (user) {
        setCurrentUser(user);
        setActiveTab(user.access_level === 'Customer' ? 'customer_portal' : 'dashboard');
      }
    } catch (e) {
      console.log("No active session found.");
    } finally {
      setLoading(false);
    }
  };

  const checkLowStockLevels = async () => {
    try {
      const bikes = await apiService.getBikes();
      const parts = await apiService.getSpareParts();
      
      setLowStockBikes(bikes.filter((b: any) => b.current_stock <= 2));
      setLowStockParts(parts.filter((p: any) => p.current_stock < p.min_stock_level));
    } catch (e) {
      console.error("Failed to compile low stock warning list", e);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      checkLowStockLevels();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setActiveTab(user.access_level === 'Customer' ? 'customer_portal' : 'dashboard');
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080d1a',
        color: '#94a3b8',
        fontFamily: 'sans-serif'
      }}>
        Initializing Shan Motors BSMS Portal...
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active view router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'customer_portal':
        return <CustomerPortal currentUser={currentUser} />;
      case 'company':
        return <Company currentUser={currentUser} />;
      case 'inventory':
        return <Inventory onStockUpdated={checkLowStockLevels} />;
      case 'sales':
        return <Sales currentUser={currentUser} onSaleCompleted={checkLowStockLevels} />;
      case 'customers':
        return <Customers />;
      case 'employees':
        return <Employees />;
      case 'suppliers':
        return <Suppliers />;
      case 'partners':
        return <Partners />;
      case 'sms':
        return <SMSLogs />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  const tabTitles: { [key: string]: string } = {
    dashboard: 'Operational Dashboard',
    customer_portal: 'Customer Care Portal',
    company: 'Company Registration & Profile',
    inventory: 'Inventory & Parts Catalogue',
    sales: 'Sales Transactions & Invoicing',
    customers: 'Customer Registry',
    employees: 'Employee Roster',
    suppliers: 'Supplier Accounts & POs',
    partners: 'Financing & Insurance Directory',
    sms: 'SMS Notification System',
    audit: 'System Audit Logs'
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Main content body */}
      <div className="main-content">
        <Header 
          title={tabTitles[activeTab] || 'Shan Motors'} 
          lowStockBikes={lowStockBikes} 
          lowStockParts={lowStockParts} 
        />
        <main className="page-body">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
