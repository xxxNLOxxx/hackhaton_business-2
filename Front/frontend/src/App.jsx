import { useState, useEffect } from 'react'
import axios from 'axios'
import AgentCard from './components/AgentCard'
import RelationshipGraph from './components/RelationshipGraph'
import { Clock, Activity } from 'lucide-react'

const API_URL = "http://127.0.0.1:8000"

function App() {
    const [agents, setAgents] = useState({})
    const [events, setEvents] = useState([])

    const loadData = async () => {
        try {
            const [agentsRes, eventsRes] = await Promise.all([
                axios.get(`${API_URL}/agents`),
                axios.get(`${API_URL}/events`)
            ]);
            setAgents(agentsRes.data);
            setEvents(eventsRes.data.reverse());
        } catch (err) { console.error("API Error:", err) }
    }

    useEffect(() => {
        loadData();
        const timer = setInterval(loadData, 3000);
        return () => clearInterval(timer);
    }, [])

    const handleInteract = async (id) => {
        const event = prompt(`Что произошло с ${agents[id]?.name || id}?`);
        if (!event) return;
        try {
            await axios.post(`${API_URL}/interact/${id}`, {
                event,
                initiator_id: "user"
            });
            loadData();
        } catch (err) { alert("Ошибка взаимодействия"); }
    }

    return (
        <div style={{
            background: '#0a0a0a', // Более глубокий черный
            height: '100vh',
            width: '100vw',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* ВЕРХНЯЯ ПАНЕЛЬ (Header) */}
            <header style={{
                height: '70px',
                padding: '0 40px',
                borderBottom: '1px solid #222',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#111',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '10px' }}>
                        <Activity size={24} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                            CYBER LEAP <span style={{ color: '#3b82f6' }}>SIMULATION</span>
                        </h1>
                        <p style={{ color: '#555', margin: 0, fontSize: '10px', textTransform: 'uppercase' }}>
                            Панель управления миром AI
                        </p>
                    </div>
                </div>

            </header>

            {/* ОСНОВНАЯ ЗОНА */}
            <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ЛЕВАЯ КОЛОНКА (Агенты) */}
                <div style={{
                    flex: 1,
                    padding: '40px',
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: '25px',
                    background: '#0f0f0f'
                }}>
                    {Object.entries(agents).map(([id, agent]) => (
                        <AgentCard key={id} id={id} agent={agent} onInteract={handleInteract} />
                    ))}
                </div>

                {/* ПРАВАЯ КОЛОНКА (Мониторинг) */}
                <aside style={{
                    width: '480px',
                    background: '#111',
                    borderLeft: '1px solid #222',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '25px'
                }}>
                    {}
                    <section style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                                Граф социальных связей
                            </h3>
                            <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }} />
                        </div>
                        <div style={{
                            height: '320px',
                            background: '#000',
                            borderRadius: '20px',
                            border: '1px solid #222',
                            overflow: 'hidden'
                        }}>
                            <RelationshipGraph agents={agents} />
                        </div>
                    </section>

                    {/* Лента событий  */}
                    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            Лог событий системы
                        </h3>
                        <div style={{
                            flex: 1,
                            background: '#000',
                            borderRadius: '20px',
                            border: '1px solid #222',
                            padding: '20px',
                            overflowY: 'auto'
                        }}>
                            {events.map((ev, i) => (
                                <div key={i} style={{
                                    padding: '12px 0',
                                    borderBottom: '1px solid #111',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: '#3b82f6', fontWeight: '700' }}>{ev.source}</span>
                                        <span style={{ color: '#333', fontSize: '10px' }}>{ev.time}</span>
                                    </div>
                                    <div style={{ color: '#ccc', lineHeight: '1.4' }}>{ev.text}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    )
}

export default App