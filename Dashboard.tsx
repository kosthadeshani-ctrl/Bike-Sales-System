// frontend/src/views/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { 
  DollarSign, 
  Bike, 
  Users, 
  ArrowUpRight,
  ShoppingBag,
  Clock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error("Failed to load dashboard statistics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>Loading dashboard insights...</div>;
  }

  // Formatting currency
  const formatCurrency = (val: number) => {
    return 'LKR ' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Showroom Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time metrics and operations summary for Shan Motors.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-3">
        {/* Sales Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-success)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Gross Revenue</span>
            <strong style={{ fontSize: '1.35rem', fontWeight: 700 }}>{formatCurrency(stats.total_sales)}</strong>
          </div>
        </div>

        {/* Bike Models Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            color: 'var(--color-primary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Bike size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Bike Catalog</span>
            <strong style={{ fontSize: '1.35rem', fontWeight: 700 }}>{stats.bike_models} Models</strong>
          </div>
        </div>

        {/* Customers Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--color-info)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Registered Customers</span>
            <strong style={{ fontSize: '1.35rem', fontWeight: 700 }}>{stats.total_customers} Customers</strong>
          </div>
        </div>
      </div>

      {/* Analytics Graph Row */}
      <div className="grid-2">
        {/* Custom SVG Sales Trend Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} />
            Sales Trend & Growth
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', width: '100%', paddingBottom: '10px', position: 'relative' }}>
            {/* Background grids */}
            <div style={{ position: 'absolute', width: '100%', borderBottom: '1px dashed rgba(255,255,255,0.05)', bottom: '50px' }} />
            <div style={{ position: 'absolute', width: '100%', borderBottom: '1px dashed rgba(255,255,255,0.05)', bottom: '100px' }} />
            <div style={{ position: 'absolute', width: '100%', borderBottom: '1px dashed rgba(255,255,255,0.05)', bottom: '150px' }} />
            
            {/* Custom SVG Line Chart */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Path line */}
              <path 
                d="M 20 150 Q 80 120 140 135 T 260 70 T 380 40 L 500 90" 
                fill="none" 
                stroke="var(--color-primary)" 
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Shadow gradient under line */}
              <path 
                d="M 20 150 Q 80 120 140 135 T 260 70 T 380 40 L 500 90 L 500 180 L 20 180 Z" 
                fill="url(#chartGrad)"
              />
              {/* Points */}
              <circle cx="20" cy="150" r="4.5" fill="#030712" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="140" cy="135" r="4.5" fill="#030712" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="260" cy="70" r="4.5" fill="#030712" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="380" cy="40" r="4.5" fill="#030712" stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx="500" cy="90" r="4.5" fill="#030712" stroke="var(--color-primary)" strokeWidth="2.5" />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Jan-Feb</span>
            <span>Mar-Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul (Current)</span>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--color-primary)' }} />
            Recent Sales Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recent_transactions && stats.recent_transactions.length > 0 ? (
              stats.recent_transactions.map((tx: any) => (
                <div 
                  key={tx.transaction_id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem 1rem', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{tx.model_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {tx.transaction_id} | Date: {tx.sale_date}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-success)' }}>
                      LKR {tx.sale_price.toLocaleString()}
                    </strong>
                    <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No recent transactions recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
