import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Play } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

const AgentChatController = ({ agents, onUpdate }) => {
  const [agent1Id, setAgent1Id] = useState('');
  const [agent2Id, setAgent2Id] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userEmail = localStorage.getItem('user_email');

  const handleStartDialogue = async () => {
    if (!agent1Id || !agent2Id) return alert("Выберите обоих агентов");
    if (agent1Id === agent2Id) return alert("Агенты должны быть разными");

    setIsLoading(true);

    try {
      // Отправляем ОДИН запрос, который ставит диалог в очередь на бэкенде
      await axios.post(`${API_URL}/interact/${agent1Id}`, {
        event: `Начать диалог с ${agents[agent2Id]?.name || 'агентом'}`,
        initiator_id: agent2Id,
        is_manual_override: true, // ✅ Вот он, наш флаг!
      }, {
        headers: { email: userEmail }
      });
      // onUpdate тут же покажет, что диалог начался
      if(onUpdate) onUpdate();

    } catch (err) {
      console.error("Manual dialogue start error:", err);
      alert("Не удалось запустить диалог.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div style={{
        background: 'rgba(15, 15, 20, 0.5)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid rgba(168, 85, 247, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#a855f7' }}>
          <MessageSquare size={18} />
          <span style={{ fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '12px' }}>
            Ручной запуск диалога
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <select value={agent1Id} onChange={e => setAgent1Id(e.target.value)} style={selectStyle}>
            <option value="">Агент 1</option>
            {Object.values(agents).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select value={agent2Id} onChange={e => setAgent2Id(e.target.value)} style={selectStyle}>
            <option value="">Агент 2</option>
            {Object.values(agents).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <button onClick={handleStartDialogue} disabled={isLoading} style={buttonStyle(isLoading)}>
          <Play size={16} fill="white" /> {isLoading ? 'Запуск...' : 'Начать диалог'}
        </button>
      </div>
  );
};

// Стили вынесены для чистоты
const selectStyle = {
  flex: 1, background: 'rgba(0, 0, 0, 0.4)', color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px',
  borderRadius: '8px', outline: 'none', fontSize: '13px', cursor: 'pointer'
};

const buttonStyle = (isLoading) => ({
  width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
  background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
  color: '#fff', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  transition: 'all 0.3s ease', opacity: isLoading ? 0.7 : 1,
  boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
});

export default AgentChatController;
