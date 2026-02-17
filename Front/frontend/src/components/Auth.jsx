import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        localStorage.setItem('userEmail', email); // Сохраняем, чтобы форма создания видела юзера
        onLogin(email);
      } else {
        alert('Ошибка доступа. Проверьте данные.');
      }
    } catch (err) {
      console.error("Ошибка связи с бэкендом", err);
    }
  };

  const glassStyle = {
    background: 'rgba(20, 20, 25, 0.9)',
    backdropFilter: 'blur(20px)',
    padding: '40px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    width: '350px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 40px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    marginBottom: '15px',
    outline: 'none'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0c' }}>
      <div style={glassStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <ShieldCheck size={48} color="#4ade80" style={{ marginBottom: '10px' }} />
          <h2 style={{ color: '#fff', margin: 0, letterSpacing: '2px' }}>{isLogin ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}</h2>
          <p style={{ color: '#666', fontSize: '12px' }}>SYSTEM ACCESS REQUIRED</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#666" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            <input type="email" placeholder="Email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#666" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            <input type="password" placeholder="Пароль" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" style={{ 
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none', 
            background: '#4ade80', color: '#000', fontWeight: 'bold', cursor: 'pointer',
            marginTop: '10px'
          }}>
            ПОДТВЕРДИТЬ
          </button>
        </form>

        <p onClick={() => setIsLogin(!isLogin)} style={{ color: '#4ade80', fontSize: '12px', textAlign: 'center', marginTop: '20px', cursor: 'pointer' }}>
          {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
        </p>
      </div>
    </div>
  );
};

export default Auth;