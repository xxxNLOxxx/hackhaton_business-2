import React, { useState } from 'react';
import { UserPlus, Activity, Database, Sparkles } from 'lucide-react';

const CreateAgentForm = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [mood, setMood] = useState(0);
  
  // Генерируем случайный цвет при инициализации
  const [tempColor] = useState(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));

  const createAgent = async () => {
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, '_');

    await fetch('http://localhost:8000/agents?email=test@test.ru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        bio,
        mood,
        color: tempColor
      })
    });

    setName('');
    setBio('');
    setMood(0);
    onCreated();
  };

  const inputBaseStyle = {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '12px 15px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  };

  return (
    <div style={{
      background: 'rgba(20, 20, 25, 0.8)',
      backdropFilter: 'blur(15px)',
      padding: '25px',
      borderRadius: '20px',
      borderLeft: `4px solid ${tempColor}`, // Тот самый акцент как на карточках
      boxShadow: `0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px ${tempColor}11`,
      color: '#fff'
    }}>
      {/* Заголовок в стиле терминала */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: `${tempColor}22`, padding: '8px', borderRadius: '8px' }}>
            <UserPlus size={18} color={tempColor} />
          </div>
          <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>
            Инициация Аватара
          </h3>
        </div>
        <div style={{ fontSize: '9px', color: '#444', fontWeight: 'bold' }}>SYSTEM.NEW_ENTITY</div>
      </div>

      {/* Поля ввода */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            Псевдоним / ID
          </label>
          <input
            placeholder="Введите имя..."
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputBaseStyle}
            onFocus={e => e.target.style.borderColor = tempColor}
            onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
          />
        </div>

        <div>
          <label style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            Нейронная прошивка (Био)
          </label>
          <textarea
            placeholder="Опишите характер..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            style={{ ...inputBaseStyle, minHeight: '80px', resize: 'none' }}
            onFocus={e => e.target.style.borderColor = tempColor}
            onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
          />
        </div>

        {/* Слайдер настроения */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Настроение</span>
            <span style={{ fontSize: '11px', color: mood >= 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
              {mood > 0 ? '+' : ''}{mood}
            </span>
          </div>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.1}
            value={mood}
            onChange={e => setMood(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: tempColor,
              cursor: 'pointer',
              opacity: 0.8
            }}
          />
        </div>
      </div>

      {/* Кнопка создания */}
      <button 
        onClick={createAgent}
        style={{
          width: '100%',
          marginTop: '25px',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: `linear-gradient(135deg, ${tempColor}dd, ${tempColor}77)`,
          color: '#fff',
          fontWeight: '900',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: 'pointer',
          boxShadow: `0 10px 20px ${tempColor}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Sparkles size={16} />
        Развернуть субъекта
      </button>
    </div>
  );
};

export default CreateAgentForm;