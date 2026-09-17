// frontend/src/views/Sales.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Printer, ShoppingCart, CheckCircle } from 'lucide-react';

interface SalesProps {
  currentUser: any;
  onSaleCompleted: () => void;
}

export const Sales: React.FC<SalesProps> = ({ currentUser, onSaleCompleted }) => {
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [bikes, setBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Sale Form
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit' | 'Leasing'>('Cash');
  const [downPayment, setDownPayment] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');

  // Print Invoice Preview Modal
  const [printedInvoice, setPrintedInvoice] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const salesData = await apiService.getSales();
      const customerData = await apiService.getCustomers();
      const bikeData = await apiService.getBikes();
      setSales(salesData);
      setCustomers(customerData);
      setBikes(bikeData.filter((b: any) => b.current_stock > 0 && b.status === 'Active'));
    } catch (e) {
      console.error("Failed to load checkout data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync pricing when a model is selected
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const bike = bikes.find(b => b.model_id === modelId);
    if (bike) {
      setSalePrice(String(bike.base_price));
    } else {
      setSalePrice('');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedModelId || !chassisNumber || !engineNumber || !salePrice) {
      alert("Please fill in all mandatory checkout fields.");
      return;
    }

    try {
      const payload = {
        customer_id: selectedCustomerId,
        employee_id: currentUser.employee_id,
        model_id: selectedModelId,
        chassis_number: chassisNumber,
        engine_number: engineNumber,
        sale_price: Number(salePrice),
        payment_method: paymentMethod,
        down_payment: Number(downPayment),
        discount_amount: Number(discountAmount)
      };

      const result = await apiService.createSale(payload);
      
      // Load Invoice details for print preview
      const customer = customers.find(c => c.customer_id === selectedCustomerId);
      const bike = bikes.find(b => b.model_id === selectedModelId);
      
      const tax = Number(salePrice) * 0.08;
      const net = Number(salePrice) + tax - Number(discountAmount);
      
      setPrintedInvoice({
        invoice_id: result.invoice_id,
        transaction_id: result.transaction_id,
        customer_name: `${customer.first_name} ${customer.last_name}`,
        customer_phone: customer.phone,
        customer_address: customer.address,
        bike_model: bike.model_name,
        chassis: chassisNumber,
        engine: engineNumber,
        sale_price: Number(salePrice),
        tax,
        discount: Number(discountAmount),
        net_amount: net,
        payment_method: paymentMethod,
        down_payment: Number(downPayment),
        balance: Number(salePrice) - Number(downPayment),
        salesperson: currentUser.full_name,
        invoice_date: new Date().toLocaleDateString()
      });

      // Reset Form
      setSelectedCustomerId('');
      setSelectedModelId('');
      setChassisNumber('');
      setEngineNumber('');
      setSalePrice('');
      setPaymentMethod('Cash');
      setDownPayment('0');
      setDiscountAmount('0');
      setShowCheckout(false);

      fetchData();
      onSaleCompleted();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  // Generate credit breakdown terms (R-SAL-5)
  const renderInstallmentSchedule = () => {
    const price = Number(salePrice || 0);
    const down = Number(downPayment || 0);
    const balance = price - down;
    if (balance <= 0) return null;

    // Standard mock terms: 12 months, 14.5% interest rate
    const interestRate = 0.145; 
    const totalWithInterest = balance * (1 + interestRate);
    const monthlyPayment = totalWithInterest / 12;

    return (
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
        <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Credit Payment Schedule (Estimate)</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Credit Principal:</span>
          <span>LKR {balance.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Interest Rate (LB Finance):</span>
          <span>14.5% per annum</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Tenure:</span>
          <span>12 Monthly Installments</span>
        </div>
        <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Monthly Installment:</span>
          <span style={{ color: 'var(--color-warning)' }}>LKR {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })} / mo</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading sales directory...</div>;
  }

  return (
    <div>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Showroom Transactions</h2>
        <button className="btn btn-primary" onClick={() => setShowCheckout(true)}>
          <ShoppingCart size={16} /> New Bike Sale
        </button>
      </div>

      {/* Transaction List */}
      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Tx ID</th>
                <th>Customer</th>
                <th>Model</th>
                <th>Sale Price</th>
                <th>Net Invoiced</th>
                <th>Method</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.transaction_id}>
                  <td><strong style={{ color: 'var(--color-primary)' }}>{sale.invoice_id || 'N/A'}</strong></td>
                  <td>{sale.transaction_id}</td>
                  <td>{sale.first_name} {sale.last_name}</td>
                  <td>{sale.model_name}</td>
                  <td>LKR {sale.sale_price.toLocaleString()}</td>
                  <td>LKR {(sale.net_amount || sale.sale_price).toLocaleString()}</td>
                  <td>
                    <span className="badge badge-info">{sale.payment_method}</span>
                  </td>
                  <td>
                    <span style={{ color: sale.balance_amount > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                      LKR {sale.balance_amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${sale.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {sale.payment_status || 'Paid'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setPrintedInvoice({
                          invoice_id: sale.invoice_id || 'INV-MOCK',
                          transaction_id: sale.transaction_id,
                          customer_name: `${sale.first_name} ${sale.last_name}`,
                          customer_phone: 'N/A',
                          customer_address: 'Balangoda',
                          bike_model: sale.model_name,
                          chassis: sale.chassis_number,
                          engine: sale.engine_number,
                          sale_price: sale.sale_price,
                          tax: sale.sale_price * 0.08,
                          discount: 0,
                          net_amount: sale.net_amount || (sale.sale_price * 1.08),
                          payment_method: sale.payment_method,
                          down_payment: sale.down_payment,
                          balance: sale.balance_amount,
                          salesperson: 'Showroom Executive',
                          invoice_date: sale.sale_date
                        });
                      }}
                    >
                      <Printer size={13} /> Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CHECKOUT DRAWER / MODAL --- */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>New Bike Checkout Flow</h2>
              <button onClick={() => setShowCheckout(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* 1. Customer Selection */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Profile</label>
                  <select 
                    className="form-control" 
                    required 
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">Select customer...</option>
                    {customers.map(c => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.first_name} {c.last_name} ({c.nic} - {c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Bike Selection */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Bike Model</label>
                    <select 
                      className="form-control" 
                      required 
                      value={selectedModelId}
                      onChange={(e) => handleModelChange(e.target.value)}
                    >
                      <option value="">Select bike model...</option>
                      {bikes.map(b => (
                        <option key={b.model_id} value={b.model_id}>
                          {b.model_name} (Stock: {b.current_stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Sale Price (LKR)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. Chassis & Engine Identifiers */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Chassis Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      placeholder="e.g. CHA-99082-Z"
                      value={chassisNumber} 
                      onChange={(e) => setChassisNumber(e.target.value)} 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Engine Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      placeholder="e.g. ENG-88123-K"
                      value={engineNumber} 
                      onChange={(e) => setEngineNumber(e.target.value)} 
                    />
                  </div>
                </div>

                {/* 4. Payment Terms */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Payment Terms</label>
                    <select 
                      className="form-control" 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="Cash">Cash Sale</option>
                      <option value="Credit">Credit / Installment Plan</option>
                      <option value="Leasing">Partner Leasing Facility</option>
                    </select>
                  </div>
                  
                  {paymentMethod !== 'Cash' && (
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label className="form-label">Down Payment Paid (LKR)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        required
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Discount Given (LKR)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* 5. Credit Schedule Projection */}
                {paymentMethod !== 'Cash' && renderInstallmentSchedule()}

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCheckout(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">
                  <CheckCircle size={16} /> Complete Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INVOICE PRINT PREVIEW MODAL (A4 FORMAT) --- */}
      {printedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', backgroundColor: '#fff', color: '#000' }}>
            <div className="modal-header" style={{ borderColor: '#ddd' }}>
              <h2 style={{ color: '#000' }}>Invoice Print Preview</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={triggerPrint}>
                  <Printer size={16} /> Print
                </button>
                <button className="btn btn-secondary" onClick={() => setPrintedInvoice(null)} style={{ color: '#000', borderColor: '#ccc' }}>Close</button>
              </div>
            </div>
            
            {/* Print Area */}
            <div id="invoice-print-area" style={{ padding: '2rem', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ color: '#000', fontSize: '1.8rem', margin: 0 }}>SHAN MOTORS</h1>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#555' }}>Balangoda Showroom | Tel: 045-2222222</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>Authorized Hero Dealership</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ color: '#000', margin: 0, fontSize: '1.4rem' }}>INVOICE</h2>
                  <p style={{ margin: '2px 0 0' }}><strong>Invoice No:</strong> {printedInvoice.invoice_id}</p>
                  <p style={{ margin: 0 }}><strong>Date:</strong> {printedInvoice.invoice_date}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Billed To:</strong>
                  <span>{printedInvoice.customer_name}</span><br />
                  <span>{printedInvoice.customer_address}</span><br />
                  <span>NIC: {printedInvoice.customer_phone}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Sales Details:</strong>
                  <span><strong>Salesperson:</strong> {printedInvoice.salesperson}</span><br />
                  <span><strong>Terms:</strong> {printedInvoice.payment_method}</span>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                    <th style={{ padding: '8px', textAlign: 'left', backgroundColor: 'transparent', color: '#000', border: 'none' }}>Description</th>
                    <th style={{ padding: '8px', textAlign: 'right', backgroundColor: 'transparent', color: '#000', border: 'none' }}>Chassis / Engine Number</th>
                    <th style={{ padding: '8px', textAlign: 'right', backgroundColor: 'transparent', color: '#000', border: 'none' }}>Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px 8px 1.5rem', border: 'none' }}>
                      <strong>Hero {printedInvoice.bike_model}</strong><br />
                      <span style={{ fontSize: '0.8rem', color: '#555' }}>1 Unit (Brand New)</span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', border: 'none' }}>
                      C: {printedInvoice.chassis}<br />
                      E: {printedInvoice.engine}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', border: 'none' }}>
                      {printedInvoice.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ width: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>Subtotal:</span>
                    <span>LKR {printedInvoice.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>VAT (8%):</span>
                    <span>LKR {printedInvoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {printedInvoice.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#c00' }}>
                      <span>Discount:</span>
                      <span>- LKR {printedInvoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #000', fontWeight: 700, fontSize: '1.1rem' }}>
                    <span>Total Invoiced:</span>
                    <span>LKR {printedInvoice.net_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px dashed #ddd', fontSize: '0.85rem' }}>
                    <span>Amount Paid:</span>
                    <span>LKR {printedInvoice.down_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 600, fontSize: '0.85rem' }}>
                    <span>Balance Due:</span>
                    <span>LKR {printedInvoice.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', borderTop: '1px solid #000', paddingTop: '1.5rem', marginTop: '3rem', fontSize: '0.8rem', color: '#555' }}>
                <span>Thank you for your business! Ride safely.</span><br />
                <span>Shan Motors - Powered by BSMS Management Portal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
