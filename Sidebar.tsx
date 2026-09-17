// frontend/src/components/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Briefcase, 
  Truck, 
  Handshake, 
  MessageSquare, 
  FileCheck, 
  LogOut,
  Bike,
  Building
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout 
}) => {
  if (!currentUser) return null;

  const role = currentUser.access_level;

  // Role based menu item filtering
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Sales', 'Inventory', 'Finance'] },
    { id: 'customer_portal', name: 'My Portal', icon: LayoutDashboard, roles: ['Customer'] },
    { id: 'company', name: 'Company Profile', icon: Building, roles: ['Admin', 'Manager'] },
    { id: 'inventory', name: 'Inventory & Parts', icon: Package, roles: ['Admin', 'Manager', 'Sales', 'Inventory'] },
    { id: 'sales', name: 'Sales & Invoicing', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Sales', 'Finance'] },
    { id: 'customers', name: 'Customers', icon: Users, roles: ['Admin', 'Manager', 'Sales'] },
    { id: 'employees', name: 'Employee Mgmt', icon: Briefcase, roles: ['Admin', 'Manager', 'Finance'] },
    { id: 'suppliers', name: 'Suppliers', icon: Truck, roles: ['Admin', 'Manager', 'Inventory', 'Finance'] },
    { id: 'partners', name: 'Leasing & Insurance', icon: Handshake, roles: ['Admin', 'Manager', 'Sales', 'Finance'] },
    { id: 'sms', name: 'SMS Campaigns', icon: MessageSquare, roles: ['Admin', 'Manager'] },
    { id: 'audit', name: 'Audit & Security', icon: FileCheck, roles: ['Admin', 'Manager'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Bike size={24} />
        <div>
          <span style={{ fontWeight: 800, display: 'block', lineHeight: 1.1 }}>SHAN MOTORS</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BALANGODA</span>
        </div>
      </div>

      <ul className="nav-links">
        {filteredItems.map(item => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <div 
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-user">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser.full_name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>
            {currentUser.designation}
          </span>
        </div>
        <button 
          onClick={onLogout}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          title="Logout"
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
