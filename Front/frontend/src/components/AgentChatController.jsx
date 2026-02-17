import React, { useState, useRef } from 'react';

const AgentChatController = ({ agents }) => {
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const runningRef = useRef(false);

  const send = async (agentId, targetId, text) => {
    await fetch(`http://localhost:8000/interact/${agentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: text,
        initiator_id: targetId
      })
    });
  };

  const startChat = async () => {
    runningRef.current = true;

    while (runningRef.current) {
      await send(
        a1,
        a2,
        `Ты находишься в диалоге с ${a2}. Продолжи разговор.`
      );

      await new Promise(r => setTimeout(r, 3000));

      await send(
        a2,
        a1,
        `Ответь ${a1}, учитывая предыдущую реплику.`
      );

      await new Promise(r => setTimeout(r, 3000));
    }
  };

  const stopChat = () => {
    runningRef.current = false;
  };

  return (
    <div style={{ background: '#111', padding: '12px', marginTop: '20px' }}>
      <h3 style={{ color: '#fff' }}>Чат агентов</h3>

      <select onChange={e => setA1(e.target.value)}>
        <option>Агент 1</option>
        {Object.keys(agents).map(id => (
          <option key={id} value={id}>{agents[id].name}</option>
        ))}
      </select>

      <select onChange={e => setA2(e.target.value)}>
        <option>Агент 2</option>
        {Object.keys(agents).map(id => (
          <option key={id} value={id}>{agents[id].name}</option>
        ))}
      </select>

      <div style={{ marginTop: '10px' }}>
        <button onClick={startChat}>▶ Старт</button>
        <button onClick={stopChat} style={{ marginLeft: '10px' }}>⏹ Стоп</button>
      </div>
    </div>
  );
};

export default AgentChatController;
