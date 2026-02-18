import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';

    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        localStorage.setItem('userEmail', email);
        onLogin(email);
      } else {
        alert('ACCESS DENIED: Invalid credentials');
      }
    } catch (err) {
      console.error("Connection failed", err);
    }
  };

  // --- Стили ---
  const theme = {
    primary: '#4ade80',
    bg: '#050505',
    glass: 'rgba(15, 15, 20, 0.85)',
    border: 'rgba(74, 222, 128, 0.2)',
    textSec: '#94a3b8'
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: `radial-gradient(circle at center, #1a2c1a 0%, ${theme.bg} 100%)`,
    fontFamily: 'monospace'
  };

  const glassStyle = {
    background: theme.glass,
    backdropFilter: 'blur(16px)',
    padding: '48px 40px',
    borderRadius: '28px',
    border: `1px solid ${theme.border}`,
    width: '380px',
    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(74, 222, 128, 0.05)',
    position: 'relative',
    overflow: 'hidden'
  };

  const inputWrapper = {
    position: 'relative',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 44px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const submitBtnStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    background: isHovered ? theme.primary : '#3ba660',
    color: '#000',
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    boxShadow: isHovered ? `0 0 20px ${theme.primary}66` : 'none'
  };

  return (
      <div style={containerStyle}>
        {/* Декоративный элемент фона */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: theme.primary, filter: 'blur(150px)', opacity: '0.05', borderRadius: '50%' }} />

        <div style={glassStyle}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '16px', marginBottom: '16px' }}>
              <ShieldCheck size={32} color={theme.primary} />
            </div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '24px', letterSpacing: '4px', fontWeight: 'bold' }}>
              {isLogin ? 'AUTH_REQUIRED' : 'NEW_ENTITY'}
            </h2>
            <div style={{ height: '2px', width: '40px', background: theme.primary, margin: '12px auto' }} />
            <p style={{ color: theme.textSec, fontSize: '10px', textTransform: 'uppercase' }}>Secure Protocol v.2.4.0</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={inputWrapper}>
              <Mail size={18} color={theme.primary} style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.7 }} />
              <input
                  type="email"
                  placeholder="IDENTITY@NETWORK.COM"
                  style={inputStyle}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
              />
            </div>

            <div style={inputWrapper}>
              <Lock size={18} color={theme.primary} style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.7 }} />
              <input
                  type="password"
                  placeholder="ACCESS_CODE"
                  style={inputStyle}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
              />
            </div>

            <button
                type="submit"
                style={submitBtnStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
              EXECUTE {isLogin ? 'LOGIN' : 'SIGNUP'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div
              onClick={() => setIsLogin(!isLogin)}
              style={{
                marginTop: '24px', color: theme.textSec, fontSize: '12px', textAlign: 'center',
                cursor: 'pointer', transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = theme.primary}
              onMouseLeave={(e) => e.target.style.color = theme.textSec}
          >
            {isLogin ? '> Create new credentials' : '> Return to terminal'}
          </div>
        </div>
      </div>
  );
};

export default Auth;