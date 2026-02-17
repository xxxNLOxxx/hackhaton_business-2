import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000";

const AgentChatController = ({ agents, onUpdate }) => {
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const runningRef = useRef(false);

  const userEmail = localStorage.getItem('userEmail');

  const send = async (agentId, targetId, text) => {
    try {
      const res = await axios.post(`${API_URL}/interact/${agentId}`, {
        event: text,
        initiator_id: targetId
      }, {
        headers: { email: userEmail }
      });

      if (res.data) {
        onUpdate?.(); // перезагрузим данные, чтобы обновить историю
      }
    } catch (err) {
      console.error("Ошибка при взаимодействии агентов:", err);
    }
  };

  const startChat = async () => {
    if (!a1 || !a2) return alert("Выберите обоих агентов");
    runningRef.current = true;

    while (runningRef.current) {
      await send(a1, a2, `Ты находишься в диалоге с ${agents[a2]?.name || a2}. Продолжи разговор.`);
      await new Promise(r => setTimeout(r, 3000));

      await send(a2, a1, `Ответь ${agents[a1]?.name || a1}, учитывая предыдущую реплику.`);
      await new Promise(r => setTimeout(r, 3000));
    }
  };

  const stopChat = () => {
    runningRef.current = false;
  };

  return (
    <div style={{ background: '#111', padding: '12px', marginTop: '20px', borderRadius: '12px' }}>
      <h3 style={{ color: '#fff' }}>Чат агентов</h3>

      <select value={a1} onChange={e => setA1(e.target.value)}>
        <option value="">Агент 1</option>
        {Object.keys(agents).map(id => (
          <option key={id} value={id}>{agents[id].name}</option>
        ))}
      </select>

      <select value={a2} onChange={e => setA2(e.target.value)} style={{ marginLeft: '10px' }}>
        <option value="">Агент 2</option>
        {Object.keys(agents).map(id => (
          <option key={id} value={id}>{agents[id].name}</option>
        ))}
      </select>

      <div style={{ marginTop: '10px' }}>
        <button onClick={startChat} style={{ padding: '6px 12px', cursor: 'pointer' }}>▶ Старт</button>
        <button onClick={stopChat} style={{ marginLeft: '10px', padding: '6px 12px', cursor: 'pointer' }}>⏹ Стоп</button>
      </div>
    </div>
  );
};

export default AgentChatController;
