// frontend/src/views/Suppliers.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Plus, FileText, Send, Calendar } from 'lucide-react';

export const Suppliers: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'orders'>('list');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);

  // Form states
  const [supplierForm, setSupplierForm] = useState({ company_name: '', contact_person: '', phone: '', email: '', address: '', bank_details: '', credit_limit: '' });
  const [poForm, setPoForm] = useState({ supplier_id: '', items: '', qty: '', delivery_date: '', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSuppliers();
      setSuppliers(data);
      
      // Fetch mock purchase orders from Local Storage if not present
      if (!localStorage.getItem('bsms_purchase_orders')) {
        const mockPOs = [
          { po_id: 'PO-2025-001', supplier_name: 'Hero MotoCorp Lanka', items: 'Hero Splendor Engine Gaskets, Spark Plugs', qty: 150, date_ordered: '2025-06-01', expected_date: '2025-06-15', status: 'Delivered' },
          { po_id: 'PO-2025-002', supplier_name: 'Lanka Spare Parts Ltd', items: 'Pleasure Plus Air Filters, Thriller Brake Pads', qty: 80, date_ordered: '2025-07-02', expected_date: '2025-07-20', status: 'Pending' }
        ];
        localStorage.setItem('bsms_purchase_orders', JSON.stringify(mockPOs));
      }
      setPurchaseOrders(JSON.parse(localStorage.getItem('bsms_purchase_orders') || '[]'));
    } catch (e) {
      console.error("Failed to load suppliers data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addSupplier(supplierForm);
      setShowSupplierModal(false);
      setSupplierForm({ company_name: '', contact_person: '', phone: '', email: '', address: '', bank_details: '', credit_limit: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.supplier_id === poForm.supplier_id);
    if (!sup) return;

    const po_id = 'PO-2025-' + String(purchaseOrders.length + 1).padStart(3, '0');
    const newPO = {
      po_id,
      supplier_name: sup.company_name,
      items: poForm.items,
      qty: Number(poForm.qty),
      date_ordered: new Date().toISOString().substring(0, 10),
      expected_date: poForm.delivery_date,
      status: 'Pending'
    };

    const updated = [newPO, ...purchaseOrders];
    setPurchaseOrders(updated);
    localStorage.setItem('bsms_purchase_orders', JSON.stringify(updated));
    
    // Simulate outstanding balance increase due to purchase order
    const localSups = JSON.parse(localStorage.getItem('bsms_suppliers') || '[]');
    const sIndex = localSups.findIndex((s: any) => s.supplier_id === poForm.supplier_id);
    if (sIndex !== -1) {
      localSups[sIndex].outstanding_balance += (Number(poForm.qty) * 1500); // Estimating LKR 1500 per item ordered
      localStorage.setItem('bsms_suppliers', JSON.stringify(localSups));
    }

    // Log Audit Mock
    const session = JSON.parse(sessionStorage.getItem('bsms_session') || '{}');
    const logs = JSON.parse(localStorage.getItem('bsms_auditLogs') || '[]');
    logs.unshift({
      log_id: logs.length + 1,
      user_id: session.employee_id || 'system',
      action_type: 'Create',
      table_affected: 'purchase_orders',
      record_id: po_id,
      old_values: null,
      new_values: newPO,
      action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip_address: '127.0.0.1'
    });
    localStorage.setItem('bsms_auditLogs', JSON.stringify(logs));

    setShowPOModal(false);
    setPoForm({ supplier_id: '', items: '', qty: '', delivery_date: '', notes: '' });
    fetchData();
  };

  const handleSettleDues = (supplierId: string) => {
    const amountStr = prompt("Enter payment amount to settle outstanding dues (LKR):");
    if (!amountStr || isNaN(Number(amountStr))) return;
    const amount = Number(amountStr);

    const localSups = JSON.parse(localStorage.getItem('bsms_suppliers') || '[]');
    const sIndex = localSups.findIndex((s: any) => s.supplier_id === supplierId);
    if (sIndex !== -1) {
      const currentBalance = localSups[sIndex].outstanding_balance;
      if (amount > currentBalance) {
        alert("Payment amount cannot exceed outstanding dues.");
        return;
      }
      localSups[sIndex].outstanding_balance -= amount;
      localStorage.setItem('bsms_suppliers', JSON.stringify(localSups));
      
      // Log Audit Mock
      const session = JSON.parse(sessionStorage.getItem('bsms_session') || '{}');
      const logs = JSON.parse(localStorage.getItem('bsms_auditLogs') || '[]');
      logs.unshift({
        log_id: logs.length + 1,
        user_id: session.employee_id || 'system',
        action_type: 'Update',
        table_affected: 'supplier',
        record_id: supplierId,
        old_values: { outstanding_balance: currentBalance },
        new_values: { outstanding_balance: currentBalance - amount },
        action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        ip_address: '127.0.0.1'
      });
      localStorage.setItem('bsms_auditLogs', JSON.stringify(logs));
      
      alert("Payment recorded successfully!");
      fetchData();
    }
  };

  if (loading && suppliers.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading suppliers...</div>;
  }

  return (
    <div>
      {/* Sub Tabs Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveSubTab('list')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeSubTab === 'list' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeSubTab === 'list' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1.25rem'
            }}
          >
            Showroom Suppliers
          </button>
          <button 
            onClick={() => setActiveSubTab('orders')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeSubTab === 'orders' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeSubTab === 'orders' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1.25rem'
            }}
          >
            Purchase Orders (POs)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeSubTab === 'list' ? (
            <button className="btn btn-primary" onClick={() => setShowSupplierModal(true)}>
              <Plus size={16} /> Onboard Supplier
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowPOModal(true)}>
              <FileText size={16} /> Create Purchase Order
            </button>
          )}
        </div>
      </div>

      {/* Main Subtab views */}
      <div className="glass-card">
        {activeSubTab === 'list' ? (
          <div>
            <h2>Suppliers & Dues Tracking</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Supplier ID</th>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Credit Limit</th>
                    <th>Outstanding Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(sup => (
                    <tr key={sup.supplier_id}>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{sup.supplier_id}</strong></td>
                      <td>{sup.company_name}</td>
                      <td>{sup.contact_person}</td>
                      <td>{sup.phone}</td>
                      <td>{sup.email || 'N/A'}</td>
                      <td>LKR {sup.credit_limit.toLocaleString()}</td>
                      <td>
                        <strong style={{ color: sup.outstanding_balance > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                          LKR {sup.outstanding_balance.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        {sup.outstanding_balance > 0 ? (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleSettleDues(sup.supplier_id)}>
                            Settle Dues
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Dues</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h2>Active Purchase Orders</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Supplier Name</th>
                    <th>Items Ordered</th>
                    <th>Quantity</th>
                    <th>Date Ordered</th>
                    <th>Expected Delivery</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map(po => (
                    <tr key={po.po_id}>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{po.po_id}</strong></td>
                      <td>{po.supplier_name}</td>
                      <td>{po.items}</td>
                      <td>{po.qty} Items</td>
                      <td>{po.date_ordered}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{po.expected_date}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${po.status === 'Delivered' ? 'badge-success' : 'badge-warning'}`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- ONBOARD SUPPLIER MODAL --- */}
      {showSupplierModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Onboard New Supplier</h2>
              <button onClick={() => setShowSupplierModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSupplierSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Company Name</label>
                  <input type="text" className="form-control" required value={supplierForm.company_name} onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })} placeholder="e.g. Hero Parts Ltd" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Contact Person Name</label>
                    <input type="text" className="form-control" required value={supplierForm.contact_person} onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })} placeholder="e.g. Janaka Alwis" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" required value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} placeholder="e.g. 0112345678" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Email Address (Optional)</label>
                    <input type="email" className="form-control" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} placeholder="orders@company.lk" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Allowed Credit Limit (LKR)</label>
                    <input type="number" className="form-control" required value={supplierForm.credit_limit} onChange={(e) => setSupplierForm({ ...supplierForm, credit_limit: e.target.value })} placeholder="e.g. 1000000" />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Corporate Address</label>
                  <textarea className="form-control" required rows={2} value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} placeholder="e.g. Peliyagoda, Colombo" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Bank Settlement Details</label>
                  <textarea className="form-control" required rows={2} value={supplierForm.bank_details} onChange={(e) => setSupplierForm({ ...supplierForm, bank_details: e.target.value })} placeholder="e.g. BOC - A/C 99882233 - Peliyagoda" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSupplierModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Onboard Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE PURCHASE ORDER MODAL --- */}
      {showPOModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Draft Purchase Order</h2>
              <button onClick={() => setShowPOModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handlePOSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Select Target Supplier</label>
                  <select 
                    className="form-control" 
                    required 
                    value={poForm.supplier_id}
                    onChange={(e) => setPoForm({ ...poForm, supplier_id: e.target.value })}
                  >
                    <option value="">Choose Supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.supplier_id} value={s.supplier_id}>
                        {s.company_name} (Avail Credit Limit: LKR {(s.credit_limit - s.outstanding_balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Items to Order (Specs & Part Names)</label>
                  <textarea className="form-control" required rows={3} value={poForm.items} onChange={(e) => setPoForm({ ...poForm, items: e.target.value })} placeholder="e.g. 50 units Front Brake Pad (Splendor), 10 Spark Plugs" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Total Item Quantity</label>
                    <input type="number" className="form-control" required value={poForm.qty} onChange={(e) => setPoForm({ ...poForm, qty: e.target.value })} placeholder="e.g. 60" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Expected Delivery Date</label>
                    <input type="date" className="form-control" required value={poForm.delivery_date} onChange={(e) => setPoForm({ ...poForm, delivery_date: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Special Delivery Instructions</label>
                  <input type="text" className="form-control" value={poForm.notes} onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })} placeholder="e.g. Deliver to Balangoda warehouse" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Send size={14} /> Dispatch PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
