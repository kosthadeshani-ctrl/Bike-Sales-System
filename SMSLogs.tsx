// frontend/src/views/SMSLogs.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const SMSLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logData = await apiService.getSMSLogs();
      const custData = await apiService.getCustomers();
      setLogs(logData);
      setCustomers(custData);
    } catch (e) {
      console.error("Failed to load SMS metrics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Template autofill logic (R-SMS-6)
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (!selectedCustomerId) {
      setSmsMessage('');
      return;
    }
    const customer = customers.find(c => c.customer_id === selectedCustomerId);
    const customerName = customer ? `${customer.first_name}` : 'Customer';

    switch (template) {
      case 'welcome':
        setSmsMessage(`Dear ${customerName}, thank you for purchasing your new Hero motorcycle from Shan Motors Balangoda! Your product warranty has been registered successfully.`);
        break;
      case 'payment':
        setSmsMessage(`Dear ${customerName}, this is a friendly reminder that your monthly installment is due in 3 days. Please settle at the Shan Motors showroom or via bank transfer.`);
        break;
      case 'service':
        setSmsMessage(`Dear ${customerName}, your periodic bike service is due soon. Please visit the Shan Motors service center in Balangoda to keep your warranty active.`);
        break;
      default:
        setSmsMessage('');
    }
  };

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !smsMessage) return;

    const customer = customers.find(c => c.customer_id === selectedCustomerId);
    if (!customer) return;

    // Dispatch SMS Mock
    const mockLogs = JSON.parse(localStorage.getItem('bsms_smsLogs') || '[]');
    const newLog = {
      sms_id: mockLogs.length + 1,
      customer_id: selectedCustomerId,
      phone_number: customer.phone,
      message_content: smsMessage,
      message_type: 'Promotion',
      sent_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      delivery_status: 'Delivered',
      gateway_response: 'Mock Gateway SUCCESS'
    };
    mockLogs.unshift(newLog);
    localStorage.setItem('bsms_smsLogs', JSON.stringify(mockLogs));

    // Audit Log Mock
    const session = JSON.parse(sessionStorage.getItem('bsms_session') || '{}');
    const auditLogs = JSON.parse(localStorage.getItem('bsms_auditLogs') || '[]');
    auditLogs.unshift({
      log_id: auditLogs.length + 1,
      user_id: session.employee_id || 'system',
      action_type: 'Create',
      table_affected: 'sms_log',
      record_id: String(newLog.sms_id),
      old_values: null,
      new_values: newLog,
      action_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip_address: '127.0.0.1'
    });
    localStorage.setItem('bsms_auditLogs', JSON.stringify(auditLogs));

    // Reset Form
    setSelectedCustomerId('');
    setSelectedTemplate('');
    setSmsMessage('');
    
    alert("SMS dispatched successfully through gateway!");
    fetchLogs();
  };

  if (loading && logs.length === 0) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading SMS metrics...</div>;
  }

  return (
    <div className="grid-2" style={{ alignItems: 'flex-start' }}>
      {/* Compose Form */}
      <div className="glass-card">
        <h2>
          <MessageSquare size={18} style={{ color: 'var(--color-primary)', marginRight: '6px', display: 'inline-block' }} />
          Compose SMS Campaign
        </h2>
        <form onSubmit={handleSendSMS} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Recipient Customer</label>
            <select 
              className="form-control" 
              required 
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setSelectedTemplate('');
                setSmsMessage('');
              }}
            >
              <option value="">Choose Recipient...</option>
              {customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.first_name} {c.last_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">SMS Template Quick-Fill</label>
            <select 
              className="form-control" 
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={!selectedCustomerId}
            >
              <option value="">Choose template...</option>
              <option value="welcome">Bike Purchase Welcome (R-SMS-1)</option>
              <option value="payment">Credit Installment Reminder (R-SMS-2)</option>
              <option value="service">Periodic Service Reminder (R-SMS-3)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">SMS Message Body</label>
            <textarea 
              className="form-control" 
              required
              rows={4}
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={!selectedCustomerId}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Standard SMS limit: 160 characters. Sinhala/Unicode character sets are supported.
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={!selectedCustomerId || !smsMessage}
          >
            <Send size={14} /> Dispatch SMS Message
          </button>
        </form>
      </div>

      {/* SMS Logs list */}
      <div className="glass-card">
        <h2>Gateway Delivery Logs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
          {logs.map(log => (
            <div 
              key={log.sms_id} 
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  To: {log.first_name} {log.last_name} ({log.phone_number})
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineBreak: 'anywhere' }}>
                  {log.message_content}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Sent: {log.sent_date} | {log.gateway_response}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {log.delivery_status === 'Delivered' ? (
                  <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> DELIVERED
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <AlertCircle size={14} /> FAILED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
