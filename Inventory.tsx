// frontend/src/views/Inventory.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Plus, Settings, AlertCircle, Scan, Search } from 'lucide-react';

interface InventoryProps {
  onStockUpdated: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onStockUpdated }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bikes' | 'parts'>('bikes');
  const [bikes, setBikes] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showBikeModal, setShowBikeModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Form states
  const [bikeForm, setBikeForm] = useState({ model_name: '', manufacturer: 'Hero', engine_cc: '', color_options: '', base_price: '', current_stock: '' });
  const [partForm, setPartForm] = useState({ part_name: '', part_number: '', compatible_models: '', unit_price: '', current_stock: '', min_stock_level: '' });
  const [adjustForm, setAdjustForm] = useState({ id: '', name: '', type: 'In' as 'In'|'Out'|'Adjustment', qty: '', notes: '', isBike: true });

  // Scan states
  const [scanQuery, setScanQuery] = useState('');
  const [scannedItem, setScannedItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bikeData = await apiService.getBikes();
      const partData = await apiService.getSpareParts();
      setBikes(bikeData);
      setParts(partData);
    } catch (e) {
      console.error("Failed to load inventory data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBikeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addBike(bikeForm);
      setShowBikeModal(false);
      setBikeForm({ model_name: '', manufacturer: 'Hero', engine_cc: '', color_options: '', base_price: '', current_stock: '' });
      fetchData();
      onStockUpdated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addSparePart(partForm);
      setShowPartModal(false);
      setPartForm({ part_name: '', part_number: '', compatible_models: '', unit_price: '', current_stock: '', min_stock_level: '' });
      fetchData();
      onStockUpdated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (adjustForm.isBike) {
        await apiService.adjustStock(adjustForm.id, adjustForm.type, Number(adjustForm.qty), adjustForm.notes);
      } else {
        // Adjusting spare parts stock in mock/local mode
        const localParts = JSON.parse(localStorage.getItem('bsms_parts') || '[]');
        const pIndex = localParts.findIndex((p: any) => p.part_id === adjustForm.id);
        if (pIndex !== -1) {
          let curr = localParts[pIndex].current_stock;
          if (adjustForm.type === 'In') curr += Number(adjustForm.qty);
          else if (adjustForm.type === 'Out') curr -= Number(adjustForm.qty);
          else if (adjustForm.type === 'Adjustment') curr = Number(adjustForm.qty);
          
          if (curr < 0) throw new Error("Insufficient stock");
          localParts[pIndex].current_stock = curr;
          localStorage.setItem('bsms_parts', JSON.stringify(localParts));
          
          // Log Audit Mock
          const session = JSON.parse(sessionStorage.getItem('bsms_session') || '{}');
          const logs = JSON.parse(localStorage.getItem('bsms_auditLogs') || '[]');
          logs.unshift({
            log_id: logs.length + 1,
            user_id: session.employee_id || 'system',
            action_type: 'Update',
            table_affected: 'spare_part',
            record_id: adjustForm.id,
            old_values: null,
            new_values: { current_stock: curr },
            action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ip_address: '127.0.0.1'
          });
          localStorage.setItem('bsms_auditLogs', JSON.stringify(logs));
        }
      }
      setShowAdjustModal(false);
      setAdjustForm({ id: '', name: '', type: 'In', qty: '', notes: '', isBike: true });
      fetchData();
      onStockUpdated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setScannedItem(null);
    const code = scanQuery.toUpperCase().trim();
    
    // Look in bikes
    const foundBike = bikes.find(b => b.model_id.toUpperCase() === code);
    if (foundBike) {
      setScannedItem({ type: 'Bike Model', id: foundBike.model_id, name: foundBike.model_name, stock: foundBike.current_stock, details: `LKR ${foundBike.base_price.toLocaleString()} | CC: ${foundBike.engine_cc} | Colors: ${foundBike.color_options}` });
      return;
    }
    // Look in parts
    const foundPart = parts.find(p => p.part_id.toUpperCase() === code || p.part_number.toUpperCase() === code);
    if (foundPart) {
      setScannedItem({ type: 'Spare Part', id: foundPart.part_id, name: foundPart.part_name, stock: foundPart.current_stock, details: `Part No: ${foundPart.part_number} | Compatible: ${foundPart.compatible_models} | LKR ${foundPart.unit_price.toLocaleString()}` });
      return;
    }

    alert("No item matching the barcode / code was found.");
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading inventory...</div>;
  }

  return (
    <div>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveSubTab('bikes')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeSubTab === 'bikes' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeSubTab === 'bikes' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1.25rem'
            }}
          >
            Motor Bikes
          </button>
          <button 
            onClick={() => setActiveSubTab('parts')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeSubTab === 'parts' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeSubTab === 'parts' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1.25rem'
            }}
          >
            Spare Parts
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeSubTab === 'bikes' ? (
            <button className="btn btn-primary" onClick={() => setShowBikeModal(true)}>
              <Plus size={16} /> Add Bike Model
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowPartModal(true)}>
              <Plus size={16} /> Add Spare Part
            </button>
          )}
        </div>
      </div>

      {/* Barcode Scanner Emulator */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <Scan size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Barcode Emulator:</span>
          </div>
          <input 
            type="text" 
            className="form-control" 
            style={{ width: '240px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
            placeholder="Type ID (e.g., BM001, SP001)"
            value={scanQuery}
            onChange={(e) => setScanQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 1rem' }}>
            <Search size={14} /> Scan
          </button>

          {scannedItem && (
            <div style={{ 
              marginLeft: '1rem', 
              padding: '0.35rem 0.75rem', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span><strong>{scannedItem.type}:</strong> {scannedItem.name} ({scannedItem.id})</span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span><strong>Stock:</strong> <span style={{ color: scannedItem.stock <= 2 ? 'var(--color-danger)' : 'var(--color-success)' }}>{scannedItem.stock}</span></span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-secondary)' }}>{scannedItem.details}</span>
              <button 
                onClick={() => {
                  setAdjustForm({ id: scannedItem.id, name: scannedItem.name, type: 'In', qty: '', notes: '', isBike: scannedItem.type === 'Bike Model' });
                  setShowAdjustModal(true);
                }} 
                className="btn btn-secondary btn-sm" 
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                Adjust Stock
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Main Tables */}
      <div className="glass-card">
        {activeSubTab === 'bikes' ? (
          <div>
            <h2>Active Bike Stock</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Model ID</th>
                    <th>Model Name</th>
                    <th>Manufacturer</th>
                    <th>Engine Capacity</th>
                    <th>Colors</th>
                    <th>Base Price</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bikes.map(bike => (
                    <tr key={bike.model_id}>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{bike.model_id}</strong></td>
                      <td>{bike.model_name}</td>
                      <td>{bike.manufacturer}</td>
                      <td>{bike.engine_cc} CC</td>
                      <td>{bike.color_options}</td>
                      <td>LKR {bike.base_price.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: bike.current_stock <= 2 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                            {bike.current_stock}
                          </strong>
                          {bike.current_stock <= 2 && (
                            <span title="Low stock alert" style={{ display: 'inline-flex', color: 'var(--color-danger)' }}>
                              <AlertCircle size={14} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${bike.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {bike.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => {
                            setAdjustForm({ id: bike.model_id, name: bike.model_name, type: 'In', qty: '', notes: '', isBike: true });
                            setShowAdjustModal(true);
                          }}
                        >
                          <Settings size={13} /> Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h2>Spare Parts Inventory</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Part ID</th>
                    <th>Part Name</th>
                    <th>Part Number</th>
                    <th>Compatible Models</th>
                    <th>Unit Price</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map(part => {
                    const isLow = part.current_stock < part.min_stock_level;
                    return (
                      <tr key={part.part_id}>
                        <td><strong style={{ color: 'var(--color-primary)' }}>{part.part_id}</strong></td>
                        <td>{part.part_name}</td>
                        <td><code>{part.part_number}</code></td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {part.compatible_models}
                        </td>
                        <td>LKR {part.unit_price.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: isLow ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                              {part.current_stock}
                            </strong>
                            {isLow && (
                              <span title="Below minimum level warning" style={{ display: 'inline-flex', color: 'var(--color-danger)' }}>
                                <AlertCircle size={14} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{part.min_stock_level}</td>
                        <td>
                          <span className={`badge ${part.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                            {part.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setAdjustForm({ id: part.part_id, name: part.part_name, type: 'In', qty: '', notes: '', isBike: false });
                              setShowAdjustModal(true);
                            }}
                          >
                            <Settings size={13} /> Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- 1. ADD BIKE MODAL --- */}
      {showBikeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Bike Model</h2>
              <button onClick={() => setShowBikeModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleBikeSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Bike Model Name</label>
                  <input type="text" className="form-control" required value={bikeForm.model_name} onChange={(e) => setBikeForm({ ...bikeForm, model_name: e.target.value })} placeholder="e.g. Hero Splendor Pro" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Manufacturer</label>
                    <input type="text" className="form-control" required value={bikeForm.manufacturer} onChange={(e) => setBikeForm({ ...bikeForm, manufacturer: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Engine (CC)</label>
                    <input type="number" className="form-control" required value={bikeForm.engine_cc} onChange={(e) => setBikeForm({ ...bikeForm, engine_cc: e.target.value })} placeholder="e.g. 125" />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Color Options (Comma separated)</label>
                  <input type="text" className="form-control" required value={bikeForm.color_options} onChange={(e) => setBikeForm({ ...bikeForm, color_options: e.target.value })} placeholder="Red, Black, Matte Blue" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Base Retail Price (LKR)</label>
                    <input type="number" className="form-control" required value={bikeForm.base_price} onChange={(e) => setBikeForm({ ...bikeForm, base_price: e.target.value })} placeholder="e.g. 420000" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Opening Stock Qty</label>
                    <input type="number" className="form-control" required value={bikeForm.current_stock} onChange={(e) => setBikeForm({ ...bikeForm, current_stock: e.target.value })} placeholder="e.g. 5" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBikeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Bike Model</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. ADD SPARE PART MODAL --- */}
      {showPartModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Register Spare Part</h2>
              <button onClick={() => setShowPartModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handlePartSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Part Name</label>
                  <input type="text" className="form-control" required value={partForm.part_name} onChange={(e) => setPartForm({ ...partForm, part_name: e.target.value })} placeholder="e.g. Front Fork Oil Seal" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Part SKU / Number</label>
                    <input type="text" className="form-control" required value={partForm.part_number} onChange={(e) => setPartForm({ ...partForm, part_number: e.target.value })} placeholder="e.g. OS-HERO-001" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Compatible Bike Models</label>
                    <input type="text" className="form-control" required value={partForm.compatible_models} onChange={(e) => setPartForm({ ...partForm, compatible_models: e.target.value })} placeholder="e.g. Hero Pleasure Plus, Splendor" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Unit Cost Price (LKR)</label>
                    <input type="number" className="form-control" required value={partForm.unit_price} onChange={(e) => setPartForm({ ...partForm, unit_price: e.target.value })} placeholder="e.g. 1250" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Current Stock Level</label>
                    <input type="number" className="form-control" required value={partForm.current_stock} onChange={(e) => setPartForm({ ...partForm, current_stock: e.target.value })} placeholder="e.g. 15" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Min Stock Level Threshold</label>
                    <input type="number" className="form-control" required value={partForm.min_stock_level} onChange={(e) => setPartForm({ ...partForm, min_stock_level: e.target.value })} placeholder="e.g. 5" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPartModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Part</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 3. ADJUST STOCK MODAL --- */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Adjust Stock Levels</h2>
              <button onClick={() => setShowAdjustModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleAdjustSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Adjusting stock for {adjustForm.isBike ? 'Bike Model' : 'Spare Part'}: <strong style={{ color: 'var(--color-primary)' }}>{adjustForm.name} ({adjustForm.id})</strong>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Adjustment Type</label>
                  <select 
                    className="form-control" 
                    value={adjustForm.type} 
                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as any })}
                  >
                    <option value="In">Stock Intake (Addition)</option>
                    <option value="Out">Stock Damage/Disbursement (Subtraction)</option>
                    <option value="Adjustment">Set Stock Count Directly</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Quantity</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={adjustForm.qty} 
                    onChange={(e) => setAdjustForm({ ...adjustForm, qty: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Reason / Notes</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    required 
                    value={adjustForm.notes} 
                    onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                    placeholder="Provide details (e.g., received stock order from Hero HQ, customer returned defective unit, etc.)"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
