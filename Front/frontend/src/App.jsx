import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CreateAgentForm from './components/CreateAgentFrom';
import AgentCard from './components/AgentCard';
import RelationshipGraph from './components/RelationshipGraph';
import { Activity, Zap, Terminal, Users, LogOut, Power } from 'lucide-react';
import Auth from './components/Auth';
import AgentChatController from "./components/AgentChatController.jsx";

const API_URL = "http://127.0.0.1:8000";

// --- КОМПОНЕНТ АДМИН-ПАНЕЛИ ---
function UsersAdminPanel({ users, onDeleteUser, currentUserEmail }) {
    return (
        <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginTop: 'auto'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#ef4444' }}>
                <Users size={18} /> <span style={{ fontWeight: 'bold' }}>Control Panel (Admin)</span>
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {users.map(u => (
                    <div key={u.email} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '13px'
                    }}>
                        <span style={{ color: u.role === 'admin' ? '#ef4444' : '#fff' }}>{u.email}</span>
                        {u.email !== currentUserEmail && (
                            <button
                                onClick={() => onDeleteUser(u.email)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                            >
                                Удалить
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
function App() {
    const [agents, setAgents] = useState({});
    const [events, setEvents] = useState([]);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [user, setUser] = useState(localStorage.getItem('user_email'));
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [autonomousMode, setAutonomousMode] = useState(true); // ✅ Состояние для автономного режима

    // ✅ Функция для переключения автономного режима
    const toggleAutonomousMode = async () => {
        try {
            const res = await axios.post(`${API_URL}/autonomous-mode/toggle`);
            setAutonomousMode(res.data.enabled);
        } catch (err) {
            console.error("Toggle autonomous mode error:", err);
        }
    };

    const loadData = useCallback(async (email, silent = false) => {
        if (!silent) setLoading(true);
        try {
            const headers = { email };
            const [agentsRes, eventsRes, graphRes, autonomousRes] = await Promise.all([
                axios.get(`${API_URL}/me/agents`, { headers }),
                axios.get(`${API_URL}/me/events`, { headers }),
                axios.get(`${API_URL}/me/graph`, { headers }),
                axios.get(`${API_URL}/autonomous-mode`) // ✅ Загружаем статус
            ]);

            const agentsObj = Array.isArray(agentsRes.data)
                ? Object.fromEntries(agentsRes.data.map(a => [a.id, a]))
                : {};

            setAgents(agentsObj);
            setEvents(eventsRes.data);
            setGraphData(graphRes.data);
            setAutonomousMode(autonomousRes.data.enabled); // ✅ Устанавливаем статус

            if (!isAdmin) {
                try {
                    const res = await axios.get(`${API_URL}/admin/users`, { headers });
                    setUsers(res.data);
                    setIsAdmin(true);
                } catch {
                    setIsAdmin(false);
                }
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            if (err.response?.status === 401) handleLogout();
        } finally {
            if (!silent) setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (user) {
            loadData(user);
            const interval = setInterval(() => loadData(user, true), 3000);
            return () => clearInterval(interval);
        }
    }, [user, loadData]);

    const handleLogin = (email) => {
        localStorage.setItem('user_email', email);
        setUser(email);
    };

    const handleLogout = () => {
        localStorage.removeItem('user_email');
        setUser(null);
        setAgents({});
        setEvents([]);
        setIsAdmin(false);
    };

    // --- МЕТОДЫ ДЛЯ РАБОТЫ С АГЕНТАМИ ---
    const handleInteract = async (agentId) => {
        const text = prompt(`Введите сообщение для ${agents[agentId]?.name || 'агента'}:`);
        if (!text) return;

        try {
            await axios.post(`${API_URL}/interact/${agentId}`,
                { event: text, initiator_id: "user" },
                { headers: { email: user } }
            );
            // Обновляем данные (график, логи, состояние агентов)
            loadData(user, true);
        } catch (err) {
            console.error("Interaction error:", err);
            alert("Ошибка при отправке сообщения агенту");
        }
    };

    const handleDeleteAgent = async (agentId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого агента?")) return;

        try {
            await axios.delete(`${API_URL}/me/agents/${agentId}`, {
                headers: { email: user }
            });
            // Перезагружаем список, чтобы карточка исчезла
            loadData(user, true);
        } catch (err) {
            console.error("Delete error:", err);
            alert("Не удалось удалить агента");
        }
    };

    const handleEditAgent = async (agentId, updates) => {
        try {
            await axios.put(`${API_URL}/me/agents/${agentId}`, updates, {
                headers: { email: user }
            });
            loadData(user, true);
        } catch (err) {
            console.error("Edit error:", err);
            alert("Ошибка при обновлении данных агента");
        }
    };

    if (!user) return <Auth onLogin={handleLogin} />;

    return (
        <div style={{
            background: 'radial-gradient(circle at 50% 50%, #11111a 0%, #050505 100%)',
            height: '100vh', width: '100vw', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* HEADER */}
            <header style={{
                height: '70px', minHeight: '70px', padding: '0 30px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(59, 130, 246, 0.3)', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Activity size={24} color="#3b82f6" />
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                        CyberLeap <span style={{ color: '#3b82f6' }}>v2.0</span>
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                     {/* ✅ Кнопка-переключатель автономного режима */}
                    <button onClick={toggleAutonomousMode} style={{
                        background: autonomousMode ? '#10b981' : '#333',
                        color: '#fff', border: 'none', padding: '10px 20px',
                        borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Power size={16} />
                        {autonomousMode ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => {
                        const event = prompt("Глобальное событие:");
                        if(event) axios.post(`${API_URL}/inject-event`, null, {
                            headers: { email: user }, params: { event }
                        }).then(() => loadData(user, true));
                    }} style={{
                        background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px',
                        borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Zap size={16} /> GOD MODE
                    </button>
                    <button onClick={handleLogout} style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main style={{ display: 'flex', flex: 1, padding: '20px', gap: '20px', overflow: 'hidden' }}>

                {/* ✅ ЛЕВАЯ ЧАСТЬ С FLEXBOX */}
                <div style={{
                    flex: 1, overflowY: 'auto', display: 'flex',
                    flexWrap: 'wrap', alignContent: 'flex-start',
                    gap: '20px', paddingRight: '10px'
                }}>
                    <div style={{ flexBasis: '320px', flexGrow: 1 }}>
                         <CreateAgentForm onCreated={() => loadData(user, true)} />
                    </div>
                    {Object.entries(agents).map(([id, agent]) => (
                        <div key={id} style={{ flexBasis: '320px', flexGrow: 1 }}>
                            <AgentCard
                                id={id}
                                agent={agent}
                                onInteract={() => handleInteract(id)}
                                onDelete={() => handleDeleteAgent(id)}
                                onEdit={(updates) => handleEditAgent(id, updates)}
                            />
                        </div>
                    ))}
                </div>

                {/* ПРАВАЯ ЧАСТЬ (САЙДБАР) — СКРОЛЛИТСЯ ЦЕЛИКОМ ЕСЛИ НУЖНО */}
                <aside style={{
                    width: '400px', minWidth: '400px', display: 'flex', flexDirection: 'column',
                    gap: '20px', height: '100%', overflowY: 'auto', paddingRight: '5px'
                }}>
                    {/* ГРАФ */}
                    <div style={{ background: 'rgba(15, 15, 20, 0.5)', padding: '20px', borderRadius: '16px', border: '1px solid #222' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#3b82f6' }}>
                            <Users size={18} /> <span style={{ fontWeight: 'bold' }}>Social Graph</span>
                        </div>
                        <RelationshipGraph data={graphData} />
                    </div>

                    <AgentChatController
                        agents={agents}
                        onUpdate={() => loadData(user, true)}
                    />

                    {/* СОБЫТИЯ — РАСТЯГИВАЮТСЯ ПО ВЕРТИКАЛИ */}
                    <div style={{
                        background: 'rgba(15, 15, 20, 0.5)', padding: '20px', borderRadius: '16px',
                        border: '1px solid #222', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#10b981' }}>
                            <Terminal size={18} /> <span style={{ fontWeight: 'bold' }}>Live Events</span>
                        </div>
                        <div id="event-log" style={{ flex: 1, overflowY: 'auto', fontSize: '13px' }}>
                            {events.slice().reverse().map((e, i) => (
                                <div key={i} style={{ padding: '10px', borderBottom: '1px solid #1a1a1a', animation: 'fadeIn 0.3s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: e.type === 'world' ? '#ef4444' : '#3b82f6', fontWeight: 'bold' }}>{e.actor}</span>
                                        <span style={{ color: '#555', fontSize: '11px' }}>{e.time}</span>
                                    </div>
                                    <div style={{ color: '#ccc', lineHeight: '1.4' }}>{e.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* АДМИН ПАНЕЛЬ */}
                    {isAdmin && (
                        <UsersAdminPanel
                            users={users}
                            currentUserEmail={user}
                            onDeleteUser={async (targetEmail) => {
                                if(!window.confirm(`Удалить ${targetEmail}?`)) return;
                                await axios.delete(`${API_URL}/admin/users/${targetEmail}`, { headers: { email: user } });
                                loadData(user, true);
                            }}
                        />
                    )}
                </aside>
            </main>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                #event-log { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
}

export default App;
