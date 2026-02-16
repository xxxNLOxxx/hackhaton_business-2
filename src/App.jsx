import { useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function App() {
  // 1. Сначала объявляем агентов
  const [agents] = useState([
    { 
      id: 1, name: 'Кибер-Иван', mood: 'Радость', color: 'bg-yellow-400',
      traits: 'Оптимист, любит кофе', memory: 'Вчера нашел старый системный блок',
      plans: 'Написать стихи о двоичном коде'
    },
    { 
      id: 2, name: 'Нейро-Маша', mood: 'Злость', color: 'bg-red-500',
      traits: 'Перфекционист, не выносит баги', memory: 'Иван снова забыл закрыть скобку',
      plans: 'Прочитать лекцию о чистоте кода'
    },
    { 
      id: 3, name: 'Бот-Петр', mood: 'Спокойствие', color: 'bg-blue-400',
      traits: 'Философ, много думает', memory: 'Размышлял о смысле бытия процессоров',
      plans: 'Просто существовать в режиме ожидания'
    },
  ]);

  // 2. Теперь данные для графа (они видят agents)
  const graphData = {
    nodes: agents.map(a => ({ 
      id: a.id, 
      name: a.name, 
      color: a.color === 'bg-yellow-400' ? '#facc15' : a.color === 'bg-red-500' ? '#ef4444' : '#60a5fa' 
    })),
    links: [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 1 }
    ]
  };

  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-cyan-400 uppercase">Кибер Рывок 2026</h1>
        <p className="text-slate-400">Симулятор жизни AI-агентов</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Дашборд */}
          <section>
            <h2 className="text-2xl mb-4 font-semibold">Дашборд «Жизнь агентов»</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div key={agent.id} onClick={() => setSelectedAgent(agent)} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${agent.color} flex items-center justify-center text-xl font-bold text-slate-900`}>{agent.name[0]}</div>
                    <div>
                      <h3 className="text-xl font-bold">{agent.name}</h3>
                      <p className="text-sm text-slate-400">Настроение: <span className="text-white">{agent.mood}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Граф */}
          <section className="bg-slate-800 rounded-2xl p-4 border border-slate-700 h-[400px] overflow-hidden shadow-2xl">
            <h2 className="text-2xl mb-4 font-semibold text-center">Граф отношений</h2>
            <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700">
              <ForceGraph2D
                graphData={graphData}
                height={320}
                nodeColor={node => node.color}
                linkColor={() => '#475569'}
                linkDirectionalParticles={2}
              />
            </div>
          </section>
        </div>

        {/* Лента событий */}
        <aside className="bg-slate-800 rounded-2xl p-6 border border-slate-700 h-fit">
          <h2 className="text-2xl mb-4 font-semibold">Лента событий</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <div className="text-sm border-l-2 border-cyan-500 pl-3 py-2 bg-cyan-500/5">
              <span className="text-cyan-400 font-mono">10:00</span> — Иван нашел системник.
            </div>
          </div>
        </aside>
      </div>

      {/* Инспектор */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md w-full relative">
            <button onClick={() => setSelectedAgent(null)} className="absolute top-4 right-4 text-slate-400 text-2xl">✕</button>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full ${selectedAgent.color} flex items-center justify-center text-2xl font-bold text-slate-900`}>{selectedAgent.name[0]}</div>
              <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
            </div>
            <div className="space-y-4">
              <p><strong className="text-cyan-400">Характер:</strong> {selectedAgent.traits}</p>
              <p><strong className="text-purple-400">Память:</strong> {selectedAgent.memory}</p>
              <button onClick={() => setSelectedAgent(null)} className="w-full bg-cyan-600 py-3 rounded-xl mt-4 font-bold">Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;