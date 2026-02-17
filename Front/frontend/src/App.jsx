import { useState, useEffect } from 'react'
import axios from 'axios'
import CreateAgentForm from './components/CreateAgentFrom';
import AgentCard from './components/AgentCard'
import RelationshipGraph from './components/RelationshipGraph'
import { Clock, Activity, Zap, Terminal, Users, Shield } from 'lucide-react'
import Auth from './components/Auth';

const API_URL = "http://127.0.0.1:8000"

function App() {
    const [agents, setAgents] = useState({})
    const [events, setEvents] = useState([])
    const [graphData, setGraphData] = useState({ nodes: [], links: [] })
    const [user, setUser] = useState(localStorage.getItem('userEmail'));
    if (!user) {
    return <Auth onLogin={(email) => setUser(email)} />;
    } 
    const loadData = async () => {
        try {
            const [agentsRes, eventsRes, graphRes] = await Promise.all([
                axios.get(`${API_URL}/agents`),
                axios.get(`${API_URL}/events`),
                axios.get(`${API_URL}/graph`)
            ]);
            setAgents(agentsRes.data || {});
            const eventsArray = Array.isArray(eventsRes.data) ? [...eventsRes.data].reverse() : [];
            setEvents(eventsArray);
            setGraphData(graphRes.data || { nodes: [], links: [] });
        } catch (err) { 
            console.error("API Error:", err);
        }
    }

    useEffect(() => {
        loadData();
        const timer = setInterval(loadData, 3000);
        return () => clearInterval(timer);
    }, [])

    const handleGlobalInject = async () => {
        const eventText = prompt("Введите глобальное событие:");
        if (!eventText) return;
        const agentIds = Object.keys(agents);
        if (agentIds.length === 0) return alert("Нет агентов для взаимодействия");
        
        try {
            await axios.post(`${API_URL}/inject-event`, null, {
                params: { agent_id: agentIds[0], event_text: eventText }
            });
            loadData();
        } catch (err) { alert("Ошибка при вбросе"); }
    }

    const handleInteract = async (id) => {
        const event = prompt(`Прямое обращение к ${agents[id]?.name || id}:`);
        if (!event) return;
        try {
            await axios.post(`${API_URL}/interact/${id}`, { event, initiator_id: "user" });
            loadData();
        } catch (err) { alert("Ошибка взаимодействия"); }
    }

    return (
        <div style={{
            background: 'radial-gradient(circle at 50% 50%, #11111a 0%, #050505 100%)',
            height: '100vh', width: '100vw', color: '#fff',
            fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            <style>{`
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #222; borderRadius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
                
                @keyframes pulse-red { 
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 
                    70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } 
                }
                @keyframes glow-blue {
                    0% { text-shadow: 0 0 5px #3b82f633; }
                    50% { text-shadow: 0 0 15px #3b82f6aa; }
                    100% { text-shadow: 0 0 5px #3b82f633; }
                }
            `}</style>
            
            {/* НОВЫЙ ХЕДЕР */}
            <header style={{
                height: '75px', 
                padding: '0 40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(10, 10, 10, 0.7)', 
                backdropFilter: 'blur(15px)', 
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)', 
                zIndex: 1000,
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        padding: '8px',
                        borderRadius: '12px',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
                    }}>
                        <Activity size={20} color="#fff" />
                    </div>
                    <h1 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '900', 
                        margin: 0, 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px',
                        animation: 'glow-blue 3s infinite'
                    }}>
                        CyberLeap <span style={{ color: '#3b82f6' }}>v2.0</span>
                    </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#444', fontSize: '11px', fontWeight: '800' }}>
                        <Shield size={14} color="#3b82f6" />
                        <span style={{ letterSpacing: '1px' }}>CORE_SYSTEM: ACTIVE</span>
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
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        animation: 'pulse-red 2s infinite',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Zap size={16} fill="white" /> GOD MODE
                    </button>
                </div>
            </header>

            <main style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '25px', gap: '25px' }}>
                
                {/* АГЕНТЫ */}
                <div style={{
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
                    gap: '25px', 
                    alignContent: 'start',
                    paddingRight: '10px'
                }}>
                    {Object.entries(agents).map(([id, agent]) => (
                        <AgentCard key={id} id={id} agent={agent} onInteract={handleInteract} />
                    ))}
                    <CreateAgentForm onCreated={loadData} />
                </div>

                {/* САЙДБАР */}
                <aside style={{ width: '450px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        borderRadius: '24px', 
                        padding: '24px', 
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', color: '#444' }}>
                            <Users size={16} color="#3b82f6" /> 
                            <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Neural Connectivity Graph</span>
                        </div>
                        <div style={{ height: '320px', borderRadius: '18px', overflow: 'hidden', background: '#080808', border: '1px solid #111' }}>
                            <RelationshipGraph data={graphData} />
                        </div>
                    </div>

                    <div style={{ 
                        flex: 1, 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        borderRadius: '24px', 
                        padding: '24px', 
                        border: '1px solid rgba(59, 130, 246, 0.1)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', color: '#444' }}>
                            <Terminal size={16} color="#3b82f6" /> 
                            <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Event Stream</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                            {events.map((ev, i) => (
                                <div key={i} style={{ 
                                    marginBottom: '14px', 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    background: 'rgba(0,0,0,0.3)', 
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    borderLeft: `4px solid ${ev.agent_color || '#3b82f6'}`,
                                    transition: 'transform 0.2s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '6px' }}>
                                        <span style={{ color: ev.agent_color || '#3b82f6', fontWeight: '900', textTransform: 'uppercase' }}>
                                            {(ev.agent_name || ev.source || "System")}
                                        </span>
                                        <span style={{ color: '#333', fontWeight: 'bold' }}>{ev.time || ev.timestamp}</span>
                                    </div>
                                    <div style={{ color: '#eee', fontSize: '13px', lineHeight: '1.4' }}>{ev.message || ev.text}</div>
                                    
                                    {ev.reasoning?.thought && (
                                        <div style={{ 
                                            marginTop: '10px', 
                                            fontSize: '11px', 
                                            color: '#666', 
                                            fontStyle: 'italic', 
                                            padding: '10px', 
                                            background: 'rgba(0,0,0,0.5)', 
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.02)'
                                        }}>
                                            <span style={{ color: '#3b82f6', fontStyle: 'normal' }}>⚡</span> {ev.reasoning.thought}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    )
}

export default App;