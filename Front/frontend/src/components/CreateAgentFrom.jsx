import React, { useState } from 'react';

const CreateAgentForm = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [mood, setMood] = useState(0);

  const createAgent = async () => {
    const id = name.toLowerCase().replace(/\s+/g, '_');

    await fetch('http://localhost:8000/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        bio,
        mood
      })
    });

    setName('');
    setBio('');
    setMood(0);

    onCreated(); // рефетч агентов
  };

  return (
    <div style={{
      background: '#111',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #333'
    }}>
      <h3 style={{ color: '#fff' }}>Создать агента</h3>

      <input
        placeholder="Имя"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <textarea
        placeholder="Характер / био"
        value={bio}
        onChange={e => setBio(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <label style={{ color: '#aaa' }}>
        Настроение: {mood}
      </label>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.1}
        value={mood}
        onChange={e => setMood(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />

      <button onClick={createAgent} style={{ marginTop: '10px' }}>
        Создать
      </button>
    </div>
  );
};

export default CreateAgentForm;
