// frontend/src/views/Company.tsx
import React, { useState, useEffect } from 'react';
import { Building, FileText, Printer, Save, FileCheck, ShieldAlert } from 'lucide-react';

interface CompanyProps {
  currentUser: any;
}

export const Company: React.FC<CompanyProps> = ({ currentUser }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [form, setForm] = useState({
    company_name: 'Shan Motors',
    br_number: 'PV-998822',
    tax_id: 'TIN-10293847',
    registration_date: '2018-04-12',
    phone: '045-2222222',
    email: 'info@shanmotors.lk',
    address: 'Kaltota Road, Balangoda, Sri Lanka',
    branch_details: 'Balangoda Showroom (Main Branch) & Service Depot'
  });

  const [documents, setDocuments] = useState<any[]>([
    { name: 'BR_Certificate_ShanMotors.pdf', size: '2.4 MB', uploaded: '2018-04-15' },
    { name: 'Tax_Clearance_2024.pdf', size: '1.8 MB', uploaded: '2024-03-10' },
    { name: 'Hero_Franchise_Agreement.pdf', size: '12.6 MB', uploaded: '2018-05-01' }
  ]);

  useEffect(() => {
    // Load profile from local storage or set defaults
    const stored = localStorage.getItem('bsms_company_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile(parsed);
      setForm(parsed);
    } else {
      localStorage.setItem('bsms_company_profile', JSON.stringify(form));
      setProfile(form);
    }
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.access_level !== 'Admin') {
      alert("Only Administrators can modify company registration records.");
      return;
    }

    localStorage.setItem('bsms_company_profile', JSON.stringify(form));
    setProfile(form);
    setIsEditing(false);
    setSuccessMsg('Business profile updated successfully!');
    
    // Log Audit Mock
    const logs = JSON.parse(localStorage.getItem('bsms_auditLogs') || '[]');
    logs.unshift({
      log_id: logs.length + 1,
      user_id: currentUser.employee_id,
      action_type: 'Update',
      table_affected: 'company_profile',
      record_id: form.br_number,
      old_values: profile,
      new_values: form,
      action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip_address: '127.0.0.1'
    });
    localStorage.setItem('bsms_auditLogs', JSON.stringify(logs));

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading || !profile) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading corporate profile...</div>;
  }

  const isAdmin = currentUser.access_level === 'Admin';

  return (
    <div className="grid-2" style={{ alignItems: 'flex-start' }}>
      
      {/* 1. Core Profile Card */}
      <div className="glass-card" id="invoice-print-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Building size={22} style={{ color: 'var(--color-primary)' }} />
            Corporate Registration
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={handlePrintReport}>
            <Printer size={14} /> Profile Report
          </button>
        </div>

        {successMsg && (
          <div className="alert-banner alert-danger" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.25)', color: '#a7f3d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileCheck size={16} style={{ color: 'var(--color-success)' }} />
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Registered Entity Name</label>
              <input 
                type="text" 
                className="form-control" 
                disabled={!isEditing} 
                value={form.company_name} 
                onChange={(e) => setForm({ ...form, company_name: e.target.value })} 
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Business Registration (BR) No</label>
              <input 
                type="text" 
                className="form-control" 
                disabled={!isEditing} 
                value={form.br_number} 
                onChange={(e) => setForm({ ...form, br_number: e.target.value })} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Tax Identification Number (TIN)</label>
              <input 
                type="text" 
                className="form-control" 
                disabled={!isEditing} 
                value={form.tax_id} 
                onChange={(e) => setForm({ ...form, tax_id: e.target.value })} 
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Incorporation Date</label>
              <input 
                type="date" 
                className="form-control" 
                disabled={!isEditing} 
                value={form.registration_date} 
                onChange={(e) => setForm({ ...form, registration_date: e.target.value })} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Contact Phone</label>
              <input 
                type="tel" 
                className="form-control" 
                disabled={!isEditing} 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Contact Email</label>
              <input 
                type="email" 
                className="form-control" 
                disabled={!isEditing} 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Registered Office Address</label>
            <textarea 
              className="form-control" 
              rows={2} 
              disabled={!isEditing} 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Showroom Branch Details</label>
            <textarea 
              className="form-control" 
              rows={2} 
              disabled={!isEditing} 
              value={form.branch_details} 
              onChange={(e) => setForm({ ...form, branch_details: e.target.value })} 
            />
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setForm(profile); setIsEditing(false); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm"><Save size={14} /> Save Profile</button>
                </div>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>Edit Details</button>
              )}
            </div>
          )}

          {!isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              <ShieldAlert size={14} />
              <span>You are logged in as {currentUser.access_level}. Only Admin can edit profile details.</span>
            </div>
          )}
        </form>
      </div>

      {/* 2. Uploaded Registration Documents */}
      <div className="glass-card">
        <h2>Corporate Documents</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Digital copies of certification papers (R-COM-3).
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {documents.map((doc, idx) => (
            <div 
              key={idx} 
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>{doc.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size: {doc.size} | Uploaded: {doc.uploaded}</span>
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => alert(`Downloading document: ${doc.name}`)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Download
              </button>
            </div>
          ))}

          {isAdmin && (
            <div style={{ marginTop: '1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
              <input 
                type="file" 
                id="doc-upload" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const newDoc = {
                      name: file.name,
                      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                      uploaded: new Date().toISOString().substring(0, 10)
                    };
                    setDocuments([...documents, newDoc]);
                  }
                }}
              />
              <label 
                htmlFor="doc-upload" 
                style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 500 }}
              >
                + Upload New Certificate
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
