// frontend/src/views/AuditLogs.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ShieldCheck, Info } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error("Failed to load audit trail", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading && logs.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading audit logs...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
          System Activity & Audit Log Registry
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Authorized audit trail tracking data manipulations, logins, and session modifications (R-SEC-4).
        </p>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User ID</th>
                <th>Action</th>
                <th>Table</th>
                <th>Record ID</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.log_id}>
                  <td><code>#{log.log_id}</code></td>
                  <td><strong>{log.user_id}</strong></td>
                  <td>
                    <span className={`badge ${
                      log.action_type === 'Login' || log.action_type === 'Create' ? 'badge-success' :
                      log.action_type === 'Update' ? 'badge-warning' :
                      log.action_type === 'Delete' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td><code>{log.table_affected}</code></td>
                  <td>{log.record_id}</td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip_address}</span></td>
                  <td>{log.action_timestamp}</td>
                  <td>
                    {(log.old_values || log.new_values) ? (
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedLog(log)}
                      >
                        <Info size={12} /> Inspect
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- INSPECT LOG MODAL --- */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2>Inspect Log Record #{selectedLog.log_id}</h2>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Operation Context:</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                  User <strong>{selectedLog.user_id}</strong> performed a <strong>{selectedLog.action_type}</strong> action on database table <code>{selectedLog.table_affected}</code> (Record ID: <code>{selectedLog.record_id}</code>).
                </p>
              </div>

              {selectedLog.old_values && (
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>Previous State (Old Values):</strong>
                  <pre style={{ 
                    marginTop: '4px', 
                    padding: '0.75rem', 
                    backgroundColor: 'rgba(3,7,18,0.5)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)',
                    color: '#fca5a5',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>Updated State (New Values):</strong>
                  <pre style={{ 
                    marginTop: '4px', 
                    padding: '0.75rem', 
                    backgroundColor: 'rgba(3,7,18,0.5)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)',
                    color: '#a7f3d0',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Close Inspection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
