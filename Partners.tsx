// frontend/src/views/Partners.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Landmark, ShieldCheck, Plus } from 'lucide-react';

export const Partners: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'leasing' | 'insurance'>('leasing');
  const [leasingCompanies, setLeasingCompanies] = useState<any[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showLeasingModal, setShowLeasingModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

  // Form states
  const [leasingForm, setLeasingForm] = useState({ company_name: '', registration_no: '', contact_person: '', phone: '', email: '', interest_rate: '', max_tenure: '', min_down_payment: '' });
  const [insuranceForm, setInsuranceForm] = useState({ company_name: '', license_no: '', contact_person: '', phone: '', coverage_types: '', commission_rate: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const lData = await apiService.getLeasing();
      const iData = await apiService.getInsurance();
      setLeasingCompanies(lData);
      setInsuranceCompanies(iData);
    } catch (e) {
      console.error("Failed to load partner directories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLeasingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockLCs = JSON.parse(localStorage.getItem('bsms_leasing') || '[]');
    const leasing_id = 'LC' + String(mockLCs.length + 1).padStart(3, '0');
    const newLC = {
      leasing_id,
      company_name: leasingForm.company_name,
      registration_no: leasingForm.registration_no,
      contact_person: leasingForm.contact_person,
      phone: leasingForm.phone,
      email: leasingForm.email,
      interest_rate: Number(leasingForm.interest_rate),
      max_tenure: Number(leasingForm.max_tenure),
      min_down_payment: Number(leasingForm.min_down_payment)
    };
    mockLCs.push(newLC);
    localStorage.setItem('bsms_leasing', JSON.stringify(mockLCs));

    // Audit Log Mock
    const session = JSON.parse(sessionStorage.getItem('bsms_session') || '{}');
    const logs = JSON.parse(localStorage.getItem('bsms_auditLogs') || '[]');
    logs.unshift({
      log_id: logs.length + 1,
      user_id: session.employee_id || 'system',
      action_type: 'Create',
      table_affected: 'leasing_company',
      record_id: leasing_id,
      old_values: null,
      new_values: newLC,
      action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip_address: '127.0.0.1'
    });
    localStorage.setItem('bsms_auditLogs', JSON.stringify(logs));

    setShowLeasingModal(false);
    setLeasingForm({ company_name: '', registration_no: '', contact_person: '', phone: '', email: '', interest_rate: '', max_tenure: '', min_down_payment: '' });
    fetchData();
  };

  const handleInsuranceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockICs = JSON.parse(localStorage.getItem('bsms_insurance') || '[]');
    const insurance_id = 'IC' + String(mockICs.length + 1).padStart(3, '0');
    const newIC = {
      insurance_id,
      company_name: insuranceForm.company_name,
      license_no: insuranceForm.license_no,
      contact_person: insuranceForm.contact_person,
      phone: insuranceForm.phone,
      coverage_types: insuranceForm.coverage_types,
      commission_rate: Number(insuranceForm.commission_rate)
    };
    mockICs.push(newIC);
    localStorage.setItem('bsms_insurance', JSON.stringify(mockICs));

    // Audit Log Mock
    const session = JSON.parse(sessionStorage.getItem('bsms_session') || '{}');
    const logs = JSON.parse(localStorage.getItem('bsms_auditLogs') || '[]');
    logs.unshift({
      log_id: logs.length + 1,
      user_id: session.employee_id || 'system',
      action_type: 'Create',
      table_affected: 'insurance_company',
      record_id: insurance_id,
      old_values: null,
      new_values: newIC,
      action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip_address: '127.0.0.1'
    });
    localStorage.setItem('bsms_auditLogs', JSON.stringify(logs));

    setShowInsuranceModal(false);
    setInsuranceForm({ company_name: '', license_no: '', contact_person: '', phone: '', coverage_types: '', commission_rate: '' });
    fetchData();
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading partners directory...</div>;
  }

  return (
    <div>
      {/* Sub Tabs Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveSubTab('leasing')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeSubTab === 'leasing' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeSubTab === 'leasing' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1.25rem'
            }}
          >
            <Landmark size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
            Leasing Partners
          </button>
          <button 
            onClick={() => setActiveSubTab('insurance')}
            className="btn btn-sm"
            style={{ 
              backgroundColor: activeSubTab === 'insurance' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeSubTab === 'insurance' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1.25rem'
            }}
          >
            <ShieldCheck size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
            Insurance Agencies
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeSubTab === 'leasing' ? (
            <button className="btn btn-primary" onClick={() => setShowLeasingModal(true)}>
              <Plus size={16} /> Add Leasing Partner
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowInsuranceModal(true)}>
              <Plus size={16} /> Register Insurance
            </button>
          )}
        </div>
      </div>

      {/* Main Tab lists */}
      <div className="glass-card">
        {activeSubTab === 'leasing' ? (
          <div>
            <h2>Registered Leasing Facilities</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Lease Partner ID</th>
                    <th>Company Name</th>
                    <th>BR Number</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Standard Interest</th>
                    <th>Max Tenure</th>
                    <th>Min Down Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {leasingCompanies.map(lc => (
                    <tr key={lc.leasing_id}>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{lc.leasing_id}</strong></td>
                      <td>{lc.company_name}</td>
                      <td>{lc.registration_no}</td>
                      <td>{lc.contact_person}</td>
                      <td>{lc.phone}</td>
                      <td>
                        <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{lc.interest_rate}% p.a.</span>
                      </td>
                      <td>{lc.max_tenure} Months</td>
                      <td>{lc.min_down_payment}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h2>Registered Insurance Underwriters</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Insurance ID</th>
                    <th>Company Name</th>
                    <th>License Number</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Coverage Classes</th>
                    <th>Claim Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {insuranceCompanies.map(ic => (
                    <tr key={ic.insurance_id}>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{ic.insurance_id}</strong></td>
                      <td>{ic.company_name}</td>
                      <td>{ic.license_no}</td>
                      <td>{ic.contact_person}</td>
                      <td>{ic.phone}</td>
                      <td>{ic.coverage_types}</td>
                      <td>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{ic.commission_rate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD LEASING PARTNER MODAL --- */}
      {showLeasingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Register Leasing Partner</h2>
              <button onClick={() => setShowLeasingModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleLeasingSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Leasing Company Name</label>
                  <input type="text" className="form-control" required value={leasingForm.company_name} onChange={(e) => setLeasingForm({ ...leasingForm, company_name: e.target.value })} placeholder="e.g. Alliance Finance PLC" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Business Registration No</label>
                    <input type="text" className="form-control" required value={leasingForm.registration_no} onChange={(e) => setLeasingForm({ ...leasingForm, registration_no: e.target.value })} placeholder="e.g. AFC-REG-09" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Standard Interest Rate (%)</label>
                    <input type="number" step="0.01" className="form-control" required value={leasingForm.interest_rate} onChange={(e) => setLeasingForm({ ...leasingForm, interest_rate: e.target.value })} placeholder="e.g. 14.5" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Contact Person</label>
                    <input type="text" className="form-control" required value={leasingForm.contact_person} onChange={(e) => setLeasingForm({ ...leasingForm, contact_person: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" required value={leasingForm.phone} onChange={(e) => setLeasingForm({ ...leasingForm, phone: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Max Tenure (Months)</label>
                    <input type="number" className="form-control" required value={leasingForm.max_tenure} onChange={(e) => setLeasingForm({ ...leasingForm, max_tenure: e.target.value })} placeholder="e.g. 48" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Min Down Payment (%)</label>
                    <input type="number" step="0.1" className="form-control" required value={leasingForm.min_down_payment} onChange={(e) => setLeasingForm({ ...leasingForm, min_down_payment: e.target.value })} placeholder="e.g. 20.0" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeasingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REGISTER INSURANCE PARTNER MODAL --- */}
      {showInsuranceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Register Insurance Agency</h2>
              <button onClick={() => setShowInsuranceModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleInsuranceSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Insurance Company Name</label>
                  <input type="text" className="form-control" required value={insuranceForm.company_name} onChange={(e) => setInsuranceForm({ ...insuranceForm, company_name: e.target.value })} placeholder="e.g. Allianz Insurance Lanka" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Insurance License Number</label>
                    <input type="text" className="form-control" required value={insuranceForm.license_no} onChange={(e) => setInsuranceForm({ ...insuranceForm, license_no: e.target.value })} placeholder="e.g. AL-INS-02" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Commission Rate (%)</label>
                    <input type="number" step="0.01" className="form-control" required value={insuranceForm.commission_rate} onChange={(e) => setInsuranceForm({ ...insuranceForm, commission_rate: e.target.value })} placeholder="e.g. 8.5" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Contact Person</label>
                    <input type="text" className="form-control" required value={insuranceForm.contact_person} onChange={(e) => setInsuranceForm({ ...insuranceForm, contact_person: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" required value={insuranceForm.phone} onChange={(e) => setInsuranceForm({ ...insuranceForm, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Coverage Packages (Comma separated)</label>
                  <input type="text" className="form-control" required value={insuranceForm.coverage_types} onChange={(e) => setInsuranceForm({ ...insuranceForm, coverage_types: e.target.value })} placeholder="Third Party, Comprehensive, Loss or Damage" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInsuranceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Insurance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
