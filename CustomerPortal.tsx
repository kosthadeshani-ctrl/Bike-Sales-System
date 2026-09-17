// frontend/src/views/CustomerPortal.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Bike, ShieldCheck, Landmark, DollarSign, AlertTriangle } from 'lucide-react';

interface CustomerPortalProps {
  currentUser: any;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'garage' | 'catalog' | 'payments'>('garage');
  const [myBikes, setMyBikes] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortalData = async () => {
      setLoading(true);
      try {
        const allSales = await apiService.getSales();
        // Filter transactions for this customer
        const filtered = allSales.filter((s: any) => s.customer_id === currentUser.employee_id);
        setMyBikes(filtered);

        const bikes = await apiService.getBikes();
        setCatalog(bikes.filter((b: any) => b.status === 'Active'));
      } catch (e) {
        console.error("Failed to load customer portal data", e);
      } finally {
        setLoading(false);
      }
    };
    loadPortalData();
  }, [currentUser]);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading portal data...</div>;
  }

  return (
    <div>
      {/* Welcome Message */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Welcome back, {currentUser.full_name}!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View your garage, insurance policies, and catalog details.</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('garage')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeTab === 'garage' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeTab === 'garage' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem'
            }}
          >
            My Garage
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeTab === 'catalog' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeTab === 'catalog' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem'
            }}
          >
            Browse Bikes
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeTab === 'payments' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeTab === 'payments' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem'
            }}
          >
            Dues & Financing
          </button>
        </div>
      </div>

      {/* Main Tab Render */}
      {activeTab === 'garage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {myBikes.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <Bike size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No Purchased Vehicles Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                If you recently purchased a motorcycle, showroom staff will register your chassis and warranty details soon.
              </p>
            </div>
          ) : (
            myBikes.map(bike => (
              <div key={bike.transaction_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                    <Bike size={20} style={{ color: 'var(--color-primary)' }} />
                    Hero {bike.model_name}
                  </h3>
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ShieldCheck size={12} /> Active Warranty
                  </span>
                </div>

                <div className="grid-3" style={{ margin: 0 }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Chassis Identifier</span>
                    <strong style={{ fontSize: '0.95rem' }}>{bike.chassis_number}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Engine Identifier</span>
                    <strong style={{ fontSize: '0.95rem' }}>{bike.engine_number}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Purchase Date</span>
                    <strong style={{ fontSize: '0.95rem' }}>{bike.sale_date}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', alignItems: 'center' }}>
                  <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Periodic Service Maintenance Schedule:</strong> Your periodic service check is scheduled 3 months from purchase date. Next servicing is due on or before <strong style={{ color: 'var(--color-warning)' }}>{new Date(new Date(bike.sale_date).setMonth(new Date(bike.sale_date).getMonth() + 3)).toLocaleDateString()}</strong>.
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="grid-2">
          {catalog.map(bike => (
            <div key={bike.model_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{bike.model_name}</h3>
                  <span className={`badge ${bike.current_stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {bike.current_stock > 0 ? 'Available' : 'Out of stock'}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
                  Manufacturer: {bike.manufacturer} | Engine CC: {bike.engine_cc}cc
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span>🎨 Available Colors: <strong>{bike.color_options}</strong></span>
                  <span>🏍️ Categorization: Scooter / Motorcycle</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Retail Price (LKR)</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                  LKR {bike.base_price.toLocaleString()}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {myBikes.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <Landmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No Financing Dues Recorded</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Your purchases and policies are fully settled.
              </p>
            </div>
          ) : (
            myBikes.map(bike => {
              const isCredit = bike.payment_method !== 'Cash';
              return (
                <div key={bike.transaction_id} className="glass-card">
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    Hero {bike.model_name} – Account Dues
                  </h3>

                  <div className="grid-3" style={{ margin: 0, gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Purchase Value</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>LKR {bike.net_amount.toLocaleString()}</strong>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Down Payment Made</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-success)' }}>LKR {bike.down_payment.toLocaleString()}</strong>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Outstanding Balance</span>
                      <strong style={{ fontSize: '1.1rem', color: bike.balance_amount > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                        LKR {bike.balance_amount.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {isCredit && bike.balance_amount > 0 && (
                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'rgba(6, 182, 212, 0.02)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-lg)' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                        <DollarSign size={16} /> Active Installment Schedule
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Your remaining balance of <strong>LKR {bike.balance_amount.toLocaleString()}</strong> is financed via LB Finance. 
                        Your monthly installment of approximately <strong style={{ color: 'var(--color-warning)' }}>LKR {((bike.balance_amount * 1.145) / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong> is due on the 5th of each month.
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
