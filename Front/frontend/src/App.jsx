import { useState } from 'react';
import axios from 'axios';
import CreateAgentForm from './components/CreateAgentFrom';
import AgentCard from './components/AgentCard';
import RelationshipGraph from './components/RelationshipGraph';
import { Activity, Zap, Terminal, Users } from 'lucide-react';
import Auth from './components/Auth';

const API_URL = "http://127.0.0.1:8000";

function UsersAdminPanel({ users, onDeleteUser, currentUserEmail }) {
    return (
        <div style={{ background: '#111', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
            <h3 style={{ color: '#3b82f6' }}>Admin Panel — Users</h3>
            {users.length === 0 ? <div style={{ color: '#888' }}>Нет пользователей</div> :
            users.map(u => (
                <div key={u.email} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid #222'
                }}>
                    <span>{u.email} ({u.role})</span>
                    {u.email !== currentUserEmail && (
                        <button onClick={() => onDeleteUser(u.email)} style={{
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer'
                        }}>Удалить</button>
                    )}
                </div>
            ))}
        </div>
    )
}


function App() {
    const [agents, setAgents] = useState({});
    const [events, setEvents] = useState([]);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);

    const loadData = async (email) => {
        setLoading(true);
        try {
            const agentsRes = await axios.get(`${API_URL}/me/agents`, { headers: { email } });
            const agentsObj = Array.isArray(agentsRes.data)
                ? Object.fromEntries(agentsRes.data.map(a => [a.id, a]))
                : {};
            setAgents(agentsObj);

            const [eventsRes, graphRes] = await Promise.all([
                axios.get(`${API_URL}/me/events`, { headers: { email } }),
                axios.get(`${API_URL}/me/graph`, { headers: { email } })
            ]);

            setEvents(eventsRes.data);
            setGraphData(graphRes.data);

            // Проверка роли админа
            try {
                const res = await axios.get(`${API_URL}/admin/users`, { headers: { email } });
                if (res.data && Array.isArray(res.data)) {
                    setIsAdmin(true);
                    setUsers(res.data);
                }
            } catch {
                setIsAdmin(false);
            }

        } catch (err) {
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Auth onLogin={(email) => {
            setUser(email);
            loadData(email);
        }} />;
    }

    if (loading) {
        return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Загрузка данных...</div>;
    }

    const handleGlobalInject = async () => {
        const event = prompt("Введите глобальное событие для всех агентов:");
        if (!event) return;

        try {
            await axios.post(`${API_URL}/inject-event`, null, {
                headers: { email: user },
                params: { event }
            });
            loadData(user);
        } catch (err) {
            alert("Ошибка отправки глобального события");
            console.error(err);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setAgents({});
        setEvents([]);
        setGraphData({ nodes: [], links: [] });
        setIsAdmin(false);
        setUsers([]);
    };

    const handleInteract = async (id) => {
        const event = prompt(`Прямое обращение к ${agents[id]?.name || id}:`);
        if (!event) return;

        try {
            await axios.post(
                `${API_URL}/interact/${id}`,
                { event, initiator_id: "user" },
                { headers: { email: user } }
            );
            loadData(user);
        } catch (err) {
            alert("Ошибка взаимодействия");
        }
    };

    const handleDeleteAgent = async (agentId) => {
    if (!window.confirm(`Удалить агента ${agents[agentId].name}?`)) return;
    try {
        await axios.delete(`${API_URL}/me/agents/${agentId}`, { headers: { email: user } });
        
        // Обновляем локальный стейт агентов
        const newAgents = { ...agents };
        delete newAgents[agentId];
        setAgents(newAgents);

        // Перезагружаем граф, чтобы агент исчез
        const graphRes = await axios.get(`${API_URL}/me/graph`, { headers: { email: user } });
        setGraphData(graphRes.data);

    } catch (err) {
        console.error(err);
        alert("Ошибка удаления агента");
    }
};


    const handleEditAgent = async (agentId, updates) => {
        try {
            await axios.put(`${API_URL}/me/agents/${agentId}`, updates, { headers: { email: user } });
            loadData(user);
        } catch (err) {
            console.error(err);
            alert("Ошибка изменения агента");
        }
    };

    const handleDeleteUser = async (emailToDelete) => {
        if (!window.confirm(`Удалить пользователя ${emailToDelete}?`)) return;
        try {
            await axios.delete(`${API_URL}/admin/users/${emailToDelete}`, { headers: { email: user } });
            setUsers(users.filter(u => u.email !== emailToDelete));
            alert("Пользователь удален");
        } catch (err) {
            console.error(err);
            alert("Ошибка при удалении пользователя");
        }
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 50% 50%, #11111a 0%, #050505 100%)',
            height: '100vh',
            width: '100vw',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <header style={{
                height: '75px',
                padding: '0 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(10, 10, 10, 0.7)',
                backdropFilter: 'blur(15px)',
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Activity size={20} color="#3b82f6" />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '900' }}>
                        CyberLeap <span style={{ color: '#3b82f6' }}>v2.0</span>
                    </h1>
                </div>

                <button onClick={handleGlobalInject} style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '12px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '11px'
                }}>
                    <Zap size={16} /> GOD MODE
                </button>

                <button onClick={handleLogout} style={{
                    background: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    fontSize: '11px'
                }}>
                    Выйти
                </button>
            </header>

            <main style={{ display: 'flex', flex: 1, padding: '25px', gap: '25px' }}>
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '25px'
                }}>
                    {Object.entries(agents).map(([id, agent]) => (
                        <AgentCard
                            key={id}
                            id={id}
                            agent={agent}
                            onInteract={handleInteract}
                            onDelete={() => handleDeleteAgent(id)}
                            onEdit={(updates) => handleEditAgent(id, updates)}
                        />
                    ))}
                    <CreateAgentForm onCreated={() => loadData(user)} />
                </div>

                <aside style={{ width: '450px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ background: '#080808', padding: '20px', borderRadius: '16px' }}>
                        <Users size={16} color="#3b82f6" /> Graph 
                        <RelationshipGraph data={graphData} />
                    </div>

                    <div style={{ background: '#080808', padding: '20px', borderRadius: '16px', flex: 1, overflowY: 'auto' }}>
                        <Terminal size={16} color="#3b82f6" /> Events 
                        {events.length === 0 ? (
                            <div style={{ color: '#555', marginTop: '10px' }}>Нет событий</div>
                        ) : (
                            <div style={{ marginTop: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                                {events.map((e, i) => (
                                    <div key={i} style={{ marginBottom: '8px', borderBottom: '1px solid #222', paddingBottom: '4px' }}>
                                        <span style={{ color: '#888', fontSize: '10px' }}>{e.time}</span> — 
                                        <strong>{e.actor}</strong>: {e.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {isAdmin && <UsersAdminPanel users={users} onDeleteUser={handleDeleteUser} currentUserEmail={user} />}

                </aside>
            </main>
        </div>
    );
}

export default App;
