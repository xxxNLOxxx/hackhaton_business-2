import { useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function App() {
  // 1. Состояние агентов
  const [agents] = useState([
    { 
      id: 1, name: 'Кибер-Иван', mood: 'Радость', color: 'bg-yellow-400',
      traits: 'Оптимист, любит кофе', 
      memory: 'Вчера нашел старый системный блок',
      plans: 'Написать стихи о двоичном коде'
    },
    { 
      id: 2, name: 'Нейро-Маша', mood: 'Злость', color: 'bg-red-500',
      traits: 'Перфекционист, не выносит баги', 
      memory: 'Иван снова забыл закрыть скобку в коде',
      plans: 'Прочитать лекцию о чистоте кода'
    },
    { 
      id: 3, name: 'Бот-Петр', mood: 'Спокойствие', color: 'bg-blue-400',
      traits: 'Философ, много думает', 
      memory: 'Размышлял о смысле бытия процессоров',
      plans: 'Просто существовать в режиме ожидания'
    },
  ]);

  // 2. Данные для графа отношений
  const graphData = {
    nodes: agents.map(a => ({ 
      id: a.id, 
      name: a.name, 
      color: a.color === 'bg-yellow-400' ? '#facc15' : a.color === 'bg-red-500' ? '#ef4444' : '#60a5fa' 
    })),
    links: [
      { source: 1, target: 2, label: 'Спор' },
      { source: 2, target: 3, label: 'Дружба' },
      { source: 3, target: 1, label: 'Нейтрально' }
    ]
  };

  // 3. Состояния для интерфейса
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      {/* ШАПКА */}
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-cyan-400 uppercase tracking-tighter">Кибер Рывок 2026</h1>
          <p className="text-slate-400 font-medium">Frontend: Система визуализации AI-агентов</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-xs font-mono text-cyan-500">
          BUILD: v1.0.4-STABLE
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА: ДАШБОРД И ГРАФ */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Дашборд агентов */}
          <section>
            <h2 className="text-2xl mb-4 font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
              Дашборд «Жизнь агентов»
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div 
                  key={agent.id} 
                  onClick={() => setSelectedAgent(agent)} 
                  className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500 hover:scale-[1.02] transition-all cursor-pointer shadow-xl group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${agent.color} flex items-center justify-center text-2xl font-black text-slate-900 shadow-lg group-hover:rotate-12 transition-transform`}>
                      {agent.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">{agent.name}</h3>
                      <p className="text-sm text-slate-400 font-medium">Настроение: <span className="text-white underline decoration-cyan-500">{agent.mood}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Интерактивный Граф */}
          <section className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden h-[450px]">
            <h2 className="text-2xl mb-6 font-bold text-center">Граф отношений</h2>
            <div className="rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-700/50 h-full">
              <ForceGraph2D
                graphData={graphData}
                height={350}
                nodeLabel="name"
                nodeColor={node => node.color}
                nodeRelSize={8}
                linkColor={() => '#475569'}
                linkWidth={2}
                linkDirectionalParticles={3}
                linkDirectionalParticleSpeed={0.005 * speed}
                backgroundColor="rgba(15, 23, 42, 0)"
              />
            </div>
          </section>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ЛЕНТА СОБЫТИЙ */}
        <aside className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl self-start flex flex-col h-full min-h-[600px]">
          <h2 className="text-2xl mb-6 font-bold flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
            Лента событий
          </h2>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <div className="text-sm border-l-4 border-cyan-500 pl-4 py-3 bg-cyan-500/5 rounded-r-xl">
              <span className="text-cyan-400 font-mono font-bold">10:00</span>
              <p className="mt-1 text-slate-200">Кибер-Иван начал спорить с Нейро-Машей о преимуществах Python над JS.</p>
            </div>
            <div className="text-sm border-l-4 border-slate-600 pl-4 py-3 bg-slate-700/30 rounded-r-xl">
              <span className="text-slate-500 font-mono font-bold">10:05</span>
              <p className="mt-1 text-slate-400 font-medium">Бот-Петр вошел в режим глубокой медитации (sleep mode).</p>
            </div>
          </div>
        </aside>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ: TIMELINE CONTROL */}
      <footer className="mt-8 bg-slate-800 border-t-4 border-cyan-500 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all active:scale-90 ${isPaused ? 'bg-green-600 hover:bg-green-500 animate-pulse' : 'bg-red-600 hover:bg-red-500'}`}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
            <div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
              <div className={`font-mono text-xl font-bold ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
                {isPaused ? 'SIMULATION_PAUSED' : 'SYSTEM_RUNNING'}
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl">
            <div className="flex justify-between mb-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Speed</label>
              <span className="text-cyan-400 font-mono font-bold">x{speed}</span>
            </div>
            <input 
              type="range" min="0.5" max="5" step="0.1" 
              value={speed} 
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
             Генерировать событие
          </button>
        </div>
      </footer>

      {/* ИНСПЕКТОР АГЕНТА (MODAL) */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-slate-800 border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedAgent(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white text-3xl transition-colors"
            >✕</button>
            
            <div className="flex items-center gap-6 mb-10">
              <div className={`w-24 h-24 rounded-full ${selectedAgent.color} flex items-center justify-center text-4xl font-black text-slate-900 shadow-2xl shadow-cyan-500/20`}>
                {selectedAgent.name[0]}
              </div>
              <h2 className="text-4xl font-black tracking-tight">{selectedAgent.name}</h2>
            </div>

            <div className="space-y-6 text-lg">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50">
                <h4 className="text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Traits / Характер</h4>
                <p className="text-slate-200 leading-relaxed font-medium">{selectedAgent.traits}</p>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50">
                <h4 className="text-purple-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Core Memory / Память</h4>
                <p className="text-slate-300 italic leading-relaxed font-medium">«{selectedAgent.memory}»</p>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50">
                <h4 className="text-green-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Current Goals / Планы</h4>
                <p className="text-slate-200 leading-relaxed font-medium">{selectedAgent.plans}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedAgent(null)}
              className="mt-10 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-5 rounded-[1.25rem] transition-all shadow-lg active:scale-95"
            >
              ВЕРНУТЬСЯ В СИСТЕМУ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;