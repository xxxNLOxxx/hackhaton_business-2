import { useState, useEffect } from 'react'
import axios from 'axios'
import CreateAgentForm from './components/CreateAgentForm';
import AgentCard from './components/AgentCard'
import RelationshipGraph from './components/RelationshipGraph'
import { Clock, Activity, Zap } from 'lucide-react' // Добавил Zap для "вмешательства"

const API_URL = "http://127.0.0.1:8000"

function App() {
    const [agents, setAgents] = useState({})
    const [events, setEvents] = useState([])
    const [graphData, setGraphData] = useState({ nodes: [], links: [] }) // Состояние для графа

    const loadData = async () => {
        try {
            // Запрашиваем данные, включая новый эндпоинт графа
            const [agentsRes, eventsRes, graphRes] = await Promise.all([
                axios.get(`${API_URL}/agents`),
                axios.get(`${API_URL}/events`),
                axios.get(`${API_URL}/graph`) // Тот самый новый эндпоинт
            ]);
            setAgents(agentsRes.data);
            setEvents(eventsRes.data.reverse());
            setGraphData(graphRes.data);
        } catch (err) { console.error("API Error:", err) }
    }

    useEffect(() => {
        loadData();
        const timer = setInterval(loadData, 3000);
        return () => clearInterval(timer);
    }, [])

    // Функция "Божественного вмешательства" (ТЗ: Панель управления)
    const handleGlobalInject = async () => {
        const eventText = prompt("Введите глобальное событие (н-р: 'Началось землетрясение' или 'Привезли пиццу'):");
        if (!eventText) return;
        
        const agentId = Object.keys(agents)[0]; // Выбираем первого попавшегося агента для реакции
        try {
            await axios.post(`${API_URL}/inject-event`, null, {
                params: { agent_id: agentId, event_text: eventText }
            });
            loadData();
        } catch (err) { alert("Ошибка при вбросе события"); }
    }

    const handleInteract = async (id) => {
        const event = prompt(`Прямое обращение к ${agents[id]?.name || id}:`);
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
            background: '#0a0a0a',
            height: '100vh',
            width: '100vw',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
           
            {/* ВЕРХНЯЯ ПАНЕЛЬ */}
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
                    </div>
                </div>

                {/* КНОПКА ВМЕШАТЕЛЬСТВА */}
                <button 
                    onClick={handleGlobalInject}
                    style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Zap size={18} /> ВБРОСИТЬ СОБЫТИЕ
                </button>
            </header>

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
                    {/* ГРАФ ОТНОШЕНИЙ */}
                    <section style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            Граф социальных связей
                        </h3>
                        <div style={{ height: '320px', background: '#000', borderRadius: '20px', border: '1px solid #222', overflow: 'hidden' }}>
                            {/* Передаем graphData вместо просто agents */}
                            <RelationshipGraph data={graphData} />
                        </div>
                    </section>

                    {/* ЛЕНТА СОБЫТИЙ */}
                    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            Лог событий (с рефлексией)
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
                                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #111' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: '#3b82f6', fontWeight: '700', fontSize: '12px' }}>{ev.source}</span>
                                        <span style={{ color: '#444', fontSize: '10px' }}>{ev.time}</span>
                                    </div>
                                    <div style={{ color: '#eee', fontSize: '14px', marginBottom: '5px' }}>{ev.text}</div>
                                    
                                    {/* ОТОБРАЖЕНИЕ МЫСЛЕЙ (Рефлексия) */}
                                    {ev.thought && (
                                        <div style={{ 
                                            fontSize: '11px', 
                                            color: '#666', 
                                            fontStyle: 'italic',
                                            background: '#0a0a0a',
                                            padding: '5px 8px',
                                            borderRadius: '4px',
                                            borderLeft: '2px solid #333'
                                        }}>
                                            🧠 {ev.thought}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    )
}

export default App;