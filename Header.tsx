// frontend/src/components/Header.tsx
import React, { useState } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  title: string;
  lowStockBikes: any[];
  lowStockParts: any[];
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  lowStockBikes, 
  lowStockParts 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const totalLowStock = lowStockBikes.length + lowStockParts.length;

  return (
    <header className="header" style={{ position: 'relative' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Low Stock Warning Banner */}
        {totalLowStock > 0 && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
              fontWeight: 500,
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.08)'
            }}
          >
            <AlertTriangle size={15} style={{ color: 'var(--color-danger)' }} />
            <span>Low Stock Alert ({totalLowStock})</span>
          </div>
        )}

        {/* Notification Icon */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Bell size={18} />
            {totalLowStock > 0 && (
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '-2px', 
                  right: '-2px', 
                  backgroundColor: 'var(--color-danger)', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%',
                  boxShadow: '0 0 8px var(--color-danger)'
                }} 
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className="glass-card"
              style={{ 
                position: 'absolute', 
                top: '45px', 
                right: '0', 
                width: '320px', 
                zIndex: 100, 
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                maxHeight: '380px',
                overflowY: 'auto'
              }}
            >
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <span>Alerts & Notifications</span>
              </h3>
              
              {totalLowStock === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                  No warnings or alerts. All stock is normal!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lowStockBikes.map(bike => (
                    <div 
                      key={bike.model_id}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2px', 
                        padding: '0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderLeft: '3px solid var(--color-danger)'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{bike.model_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Bike stock: <strong style={{ color: 'var(--color-danger)' }}>{bike.current_stock}</strong> items left
                      </span>
                    </div>
                  ))}
                  
                  {lowStockParts.map(part => (
                    <div 
                      key={part.part_id}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2px', 
                        padding: '0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                        borderLeft: '3px solid var(--color-warning)'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{part.part_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Spare part stock: <strong style={{ color: 'var(--color-warning)' }}>{part.current_stock}</strong> (min: {part.min_stock_level})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
