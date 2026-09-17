// frontend/src/views/Customers.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Search, UserPlus, FileText, Phone, Mail, MapPin } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    nic: '',
    phone: '',
    email: '',
    address: '',
    customer_type: 'Cash' as 'Cash' | 'Credit'
  });

  const fetchCustomers = async (search = '') => {
    setLoading(true);
    try {
      const data = await apiService.getCustomers(search);
      setCustomers(data);
    } catch (e) {
      console.error("Failed to fetch customers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchCustomers(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addCustomer(form);
      setShowAddModal(false);
      setForm({ first_name: '', last_name: '', nic: '', phone: '', email: '', address: '', customer_type: 'Cash' });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const viewPurchaseHistory = async (customer: any) => {
    // Search history records in local mock database or backend
    const allSales = await apiService.getSales();
    const custSales = allSales.filter((s: any) => s.customer_id === customer.customer_id);
    setHistoryCustomer({
      profile: customer,
      sales: custSales
    });
  };

  if (loading && customers.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading customer list...</div>;
  }

  return (
    <div>
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.4rem 1rem', width: '320px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, NIC, phone..." 
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Register Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="glass-card">
        <h2>Customer Registry</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>NIC Number</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Payment Status</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.customer_id}>
                  <td><strong style={{ color: 'var(--color-primary)' }}>{c.customer_id}</strong></td>
                  <td>{c.first_name} {c.last_name}</td>
                  <td>{c.nic}</td>
                  <td>{c.phone}</td>
                  <td>{c.email || 'N/A'}</td>
                  <td>{c.address}</td>
                  <td>
                    <span className={`badge ${c.customer_type === 'Cash' ? 'badge-success' : 'badge-warning'}`}>
                      {c.customer_type}
                    </span>
                  </td>
                  <td>{c.registration_date}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => viewPurchaseHistory(c)}>
                      <FileText size={13} /> History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD CUSTOMER MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Register New Customer Profile</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="e.g. Sunil" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="e.g. Perera" />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">NIC Card Number</label>
                    <input type="text" className="form-control" required value={form.nic} onChange={(e) => setForm({ ...form, nic: e.target.value })} placeholder="e.g. 751234567V" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 0714567890" />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email Address (Optional)</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="sunil@gmail.com" />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Residential Address</label>
                  <textarea className="form-control" required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. 12/A, Kaltota Road, Balangoda" />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Payment Type Classification</label>
                  <select 
                    className="form-control" 
                    value={form.customer_type} 
                    onChange={(e) => setForm({ ...form, customer_type: e.target.value as any })}
                  >
                    <option value="Cash">Cash Account</option>
                    <option value="Credit">Credit / Installment Account</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PURCHASE HISTORY VIEW MODAL --- */}
      {historyCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>Purchase History Profile</h2>
              <button onClick={() => setHistoryCustomer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Customer summary */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{historyCustomer.profile.first_name} {historyCustomer.profile.last_name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={13} /> {historyCustomer.profile.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={13} /> {historyCustomer.profile.email || 'No email registered'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={13} /> {historyCustomer.profile.address}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div>
                <h3 style={{ marginBottom: '0.75rem' }}>Completed Bike Purchases</h3>
                {historyCustomer.sales && historyCustomer.sales.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {historyCustomer.sales.map((sale: any) => (
                      <div 
                        key={sale.transaction_id}
                        style={{ 
                          padding: '0.75rem 1rem', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: 'rgba(255,255,255,0.01)', 
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hero {sale.model_name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Chassis: {sale.chassis_number} | Invoice: {sale.invoice_id}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--color-success)', display: 'block' }}>
                            LKR {sale.sale_price.toLocaleString()}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sale.sale_date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    No bike purchase records found for this customer.
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setHistoryCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
