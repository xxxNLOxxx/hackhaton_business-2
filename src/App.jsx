import { useState } from 'react'

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

  // 2. Состояние для выбранного агента (Инспектор)
  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <> {/* <--- Это ФРАГМЕНТ, он объединяет всё в один блок */}
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-cyan-400">КИБЕР РЫВОК 2026</h1>
          <p className="text-slate-400">Симулятор жизни AI-агентов</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ЛЕВАЯ КОЛОНКА: Список агентов (Дашборд) */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl mb-4 font-semibold">Дашборд «Жизнь агентов»</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div 
                  key={agent.id} 
                  onClick={() => setSelectedAgent(agent)} 
                  className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${agent.color} flex items-center justify-center text-xl font-bold text-slate-900`}>
                      {agent.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{agent.name}</h3>
                      <p className="text-sm text-slate-400">Настроение: <span className="text-white">{agent.mood}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Лента событий */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-2xl mb-4 font-semibold">Лента событий</h2>
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2">
              <div className="text-sm border-l-2 border-cyan-500 pl-3 py-1">
                <span className="text-cyan-400 font-mono">10:00</span> — Кибер-Иван начал спорить с Нейро-Машей.
              </div>
              <div className="text-sm border-l-2 border-slate-600 pl-3 py-1">
                <span className="text-slate-500 font-mono">10:05</span> — Бот-Петр уснул.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ИНСПЕКТОР АГЕНТА (Всплывающее окно) */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setSelectedAgent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
            >✕</button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full ${selectedAgent.color} flex items-center justify-center text-2xl font-bold text-slate-900`}>
                {selectedAgent.name[0]}
              </div>
              <h2 className="text-3xl font-bold">{selectedAgent.name}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-cyan-400 text-sm font-bold uppercase mb-1">Характер</h4>
                <p className="text-slate-200">{selectedAgent.traits}</p>
              </div>
              <div>
                <h4 className="text-purple-400 text-sm font-bold uppercase mb-1">Ключевое воспоминание</h4>
                <p className="text-slate-200 italic">«{selectedAgent.memory}»</p>
              </div>
              <div>
                <h4 className="text-green-400 text-sm font-bold uppercase mb-1">Текущие планы</h4>
                <p className="text-slate-200">{selectedAgent.plans}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedAgent(null)}
              className="mt-8 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Закрыть профиль
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App