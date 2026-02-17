import React, { useState } from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:8000";

const CreateAgentFrom = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [mood, setMood] = useState(0);

  const [tempColor] = useState(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));

  const createAgent = async () => {
    if (!name.trim()) return;
   const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const userEmail = localStorage.getItem('userEmail');

    try {
      await axios.post(`${API_URL}/me/agents`, {
        id,
        name,
        bio,
        mood,
        color: tempColor
      }, {
        headers: { email: userEmail }
      });

      setName('');
      setBio('');
      setMood(0);
      onCreated?.();
    } catch (err) {
      console.error("Ошибка создания агента:", err);
      alert("Не удалось создать агента");
    }
  };

  return (
    <div style={{
      background: 'rgba(20,20,25,0.8)',
      backdropFilter: 'blur(15px)',
      padding: '20px',
      borderRadius: '16px',
      borderLeft: `4px solid ${tempColor}`,
      color: '#fff'
    }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
        <UserPlus size={18} /> Новый агент
      </h4>

      <input
        placeholder="Имя / ID"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: '100%', marginTop: '12px', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#222', color: '#fff' }}
      />

      <textarea
        placeholder="Био"
        value={bio}
        onChange={e => setBio(e.target.value)}
        style={{ width: '100%', marginTop: '8px', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#222', color: '#fff' }}
      />

      <div style={{ marginTop: '8px' }}>
        <label style={{ fontSize: '12px' }}>Настроение: {mood}</label>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.1}
          value={mood}
          onChange={e => setMood(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: tempColor }}
        />
      </div>

      <button
        onClick={createAgent}
        style={{
          marginTop: '12px',
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          background: tempColor,
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontWeight: '700'
        }}
      >
        <Sparkles size={16} /> Создать агента
      </button>
    </div>
  );
};

export default CreateAgentFrom;
