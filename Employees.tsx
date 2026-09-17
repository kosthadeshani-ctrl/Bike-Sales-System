// frontend/src/views/Employees.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { UserPlus, Calculator, Award, BadgePercent } from 'lucide-react';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    full_name: '',
    nic: '',
    designation: '',
    salary: '',
    join_date: '',
    phone: '',
    access_level: 'Sales' as 'Admin' | 'Manager' | 'Sales' | 'Inventory' | 'Finance',
    username: '',
    password: ''
  });

  // Calculator State
  const [selectedCalcEmpId, setSelectedCalcEmpId] = useState('');
  const [calcCommissionRate, setCalcCommissionRate] = useState('2000'); // Default LKR 2000 per bike sold
  const [calcDeductions, setCalcDeductions] = useState('0');

  const fetchData = async () => {
    setLoading(true);
    try {
      const empData = await apiService.getEmployees();
      const salesData = await apiService.getSales();
      setEmployees(empData);
      setSales(salesData);
    } catch (e) {
      console.error("Failed to load employee list", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addEmployee(form);
      setShowAddModal(false);
      setForm({
        full_name: '',
        nic: '',
        designation: '',
        salary: '',
        join_date: '',
        phone: '',
        access_level: 'Sales',
        username: '',
        password: ''
      });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Target and performance tracker calculations (R-EMP-4, R-EMP-5)
  const getEmployeeSalesCount = (empId: string) => {
    return sales.filter(s => s.employee_id === empId).length;
  };

  // Mock targets (Admin and Managers have no sales targets, Sales Executives do)
  const getTargetDetails = (emp: any) => {
    const sold = getEmployeeSalesCount(emp.employee_id);
    let target = 0;
    
    if (emp.access_level === 'Sales') target = 8; // Default sales target is 8 bikes
    else if (emp.access_level === 'Manager') target = 15; // Showroom target
    
    return {
      sold,
      target,
      percent: target > 0 ? Math.min(Math.round((sold / target) * 100), 100) : 0
    };
  };

  // Salary Calculator computation (R-EMP-3)
  const calculateSalaryMetrics = () => {
    const emp = employees.find(e => e.employee_id === selectedCalcEmpId);
    if (!emp) return null;

    const count = getEmployeeSalesCount(emp.employee_id);
    const commRate = Number(calcCommissionRate || 0);
    const commEarned = count * commRate;
    const base = emp.salary;
    const ded = Number(calcDeductions || 0);
    const net = base + commEarned - ded;

    return {
      base,
      bikesSold: count,
      commissionEarned: commEarned,
      deductions: ded,
      netSalary: net
    };
  };

  const calcResults = calculateSalaryMetrics();

  if (loading && employees.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading personnel records...</div>;
  }

  return (
    <div>
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Employee Roster & Performance</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Register Employee
        </button>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Employees list and Target performance */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2>Staff Registry</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employees.map(emp => {
              const perf = getTargetDetails(emp);
              return (
                <div 
                  key={emp.employee_id}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.01)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{emp.full_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        ID: {emp.employee_id} | {emp.designation}
                      </span>
                    </div>
                    <span className="badge badge-info">{emp.access_level}</span>
                  </div>

                  {perf.target > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Award size={12} /> Target Progress</span>
                        <span>{perf.sold} / {perf.target} Bikes ({perf.percent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${perf.percent}%`, height: '100%', backgroundColor: perf.percent >= 100 ? 'var(--color-success)' : 'var(--color-primary)', transition: 'width 0.5s ease-in-out' }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Join Date: {emp.join_date}</span>
                    <span>Salary: LKR {emp.salary.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Commission and Salary Calculator */}
        <div className="glass-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} style={{ color: 'var(--color-primary)' }} />
            Salary & Commission Computation
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Select Employee</label>
              <select 
                className="form-control"
                value={selectedCalcEmpId}
                onChange={(e) => setSelectedCalcEmpId(e.target.value)}
              >
                <option value="">Select Staff...</option>
                {employees.map(e => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.full_name} ({e.designation})
                  </option>
                ))}
              </select>
            </div>

            {selectedCalcEmpId && (
              <>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Commission / Bike (LKR)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={calcCommissionRate}
                      onChange={(e) => setCalcCommissionRate(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Deductions (LKR)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={calcDeductions}
                      onChange={(e) => setCalcDeductions(e.target.value)}
                    />
                  </div>
                </div>

                {calcResults && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1.5rem', 
                    backgroundColor: 'rgba(6, 182, 212, 0.03)', 
                    border: '1px solid var(--border-hover)', 
                    borderRadius: 'var(--radius-lg)' 
                  }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                      <BadgePercent size={18} /> Payroll Statement
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Base Salary:</span>
                        <span>LKR {calcResults.base.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Bikes Sold This Month:</span>
                        <strong>{calcResults.bikesSold} Units</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                        <span>Commissions Earned:</span>
                        <span>+ LKR {calcResults.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                        <span>Deductions:</span>
                        <span>- LKR {calcResults.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
                        <span>Net Monthly Salary:</span>
                        <span style={{ color: 'var(--color-success)' }}>
                          LKR {calcResults.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!selectedCalcEmpId && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                Select an employee from the list above to view automatically calculated commissions and compile payroll.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- REGISTER EMPLOYEE MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Register Showroom Personnel</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Kasun Silva" />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">NIC Card Number</label>
                    <input type="text" className="form-control" required value={form.nic} onChange={(e) => setForm({ ...form, nic: e.target.value })} placeholder="e.g. 971122334V" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 0761122334" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Job Designation</label>
                    <input type="text" className="form-control" required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Inventory Controller" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Base Salary (LKR)</label>
                    <input type="number" className="form-control" required value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 40000" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Access Level Role</label>
                    <select 
                      className="form-control" 
                      value={form.access_level} 
                      onChange={(e) => setForm({ ...form, access_level: e.target.value as any })}
                    >
                      <option value="Admin">Administrator</option>
                      <option value="Manager">Manager</option>
                      <option value="Sales">Sales Executive</option>
                      <option value="Inventory">Inventory Clerk</option>
                      <option value="Finance">Finance Officer</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Join Date</label>
                    <input type="date" className="form-control" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
                  </div>
                </div>

                <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">System Username</label>
                    <input type="text" className="form-control" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. kasun" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Account Password</label>
                    <input type="password" className="form-control" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
