// frontend/src/views/Login.tsx
import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Bike, ShieldAlert, KeyRound, User, Phone, MapPin, Mail, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    first_name: '',
    last_name: '',
    nic: '',
    phone: '',
    email: '',
    address: '',
    username: '',
    password: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await apiService.login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await apiService.registerCustomer(regForm);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0e172a 0%, #030712 100%)',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: isRegistering ? '550px' : '420px', 
        padding: '2rem 2.25rem',
        transition: 'max-width 0.3s ease-in-out'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            backgroundColor: 'var(--color-primary-glow)',
            color: 'var(--color-primary)',
            padding: '0.85rem',
            borderRadius: '50%',
            marginBottom: '0.75rem',
            border: '1px solid var(--border-hover)',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Bike size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.15rem' }}>SHAN MOTORS</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            {isRegistering ? 'Customer Account Sign Up' : 'Showroom Operations Portal'}
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            marginBottom: '1.25rem'
          }}>
            <ShieldAlert size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* --- RENDER REGISTRATION FORM --- */}
        {isRegistering ? (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={regForm.first_name} 
                  onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })} 
                  placeholder="Sunil" 
                />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={regForm.last_name} 
                  onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })} 
                  placeholder="Perera" 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">NIC Card Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={regForm.nic} 
                  onChange={(e) => setRegForm({ ...regForm, nic: e.target.value })} 
                  placeholder="751234567V" 
                />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Phone size={12} /> Phone No
                </label>
                <input 
                  type="tel" 
                  className="form-control" 
                  required 
                  value={regForm.phone} 
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} 
                  placeholder="0714567890" 
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Mail size={12} /> Email Address (Optional)
              </label>
              <input 
                type="email" 
                className="form-control" 
                value={regForm.email} 
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} 
                placeholder="sunil@gmail.com" 
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <MapPin size={12} /> Residential Address
              </label>
              <textarea 
                className="form-control" 
                required 
                rows={2} 
                value={regForm.address} 
                onChange={(e) => setRegForm({ ...regForm, address: e.target.value })} 
                placeholder="12/A, Kaltota Road, Balangoda" 
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <User size={12} /> Desired Username
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={regForm.username} 
                  onChange={(e) => setRegForm({ ...regForm, username: e.target.value })} 
                  placeholder="sunil123" 
                />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <KeyRound size={12} /> Password
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  required 
                  value={regForm.password} 
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ width: '100%', border: 'none', background: 'transparent' }}
              onClick={() => setIsRegistering(false)}
            >
              <ArrowLeft size={13} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }} />
              Already have an account? Sign In
            </button>
          </form>
        ) : (
          /* --- RENDER LOGIN FORM --- */
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={14} /> Username
              </label>
              <input 
                type="text" 
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <KeyRound size={14} /> Password
              </label>
              <input 
                type="password" 
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Secure Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                New showroom customer?{' '}
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => {
                    setIsRegistering(true);
                    setError('');
                  }}
                >
                  Sign Up Here
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
