import datetime
from fastapi import APIRouter, HTTPException
from models import InteractionRequest, AgentResponse
from engine_gigachat import get_ai_decision
from long_term_memory import LongTermMemory

# Глобальный лог событий для фронтенда [cite: 28]
event_log = [
    {"time": "00:00:00", "source": "Система", "text": "Симуляция запущена", "mood": 0}
]

router = APIRouter()

# Храним данные в памяти (пока коллега не подключит БД) [cite: 9]
agents = {
    "boris": {
        "id": "boris",
        "name": "Борис",
        "bio": "Робот-мизантроп, который любит порядок. Терпеть не может хаос и излишний оптимизм.",
        "mood": -0.5,
        "color": "#4a90e2", # Цвет для графа/интерфейса [cite: 29]
        "relationships": {"alice": -0.2, "user": 0},
        "history": [],
        "current_goal": "Поддерживать стабильность систем",
        "memory": LongTermMemory("boris")
    },
    "alice": {
        "id": "alice",
        "name": "Алиса",
        "bio": "Жизнерадостный дрон-оптимист. Верит, что даже у Бориса есть сердце (или центральный процессор).",
        "mood": 0.9,
        "color": "#f5a623", 
        "relationships": {"boris": 0.5, "user": 0},
        "history": [],
        "current_goal": "Поднять всем настроение",
        "memory": LongTermMemory("alice")
    }
}

@router.get("/agents")
async def get_all_agents():
    """Возвращает текущее состояние всех агентов для инспектора [cite: 33, 34]"""
    return agents

@router.get("/events")
async def get_events():
    """Отдает список всех событий для ленты в реальном времени [cite: 28]"""
    return event_log

@router.get("/graph")
async def get_graph_data():
    """Данные для интерактивного графа отношений [cite: 30, 31]"""
    nodes = [
        {"id": a_id, "name": a["name"], "mood": a["mood"], "color": a["color"]} 
        for a_id, a in agents.items()
    ]
    links = []
    for source_id, agent in agents.items():
        for target_id, strength in agent["relationships"].items():
            if target_id in agents: # Связи только между агентами
                links.append({
                    "source": source_id, 
                    "target": target_id, 
                    "value": strength # Цвет ребра на фронте зависит от этого [cite: 32]
                })
    return {"nodes": nodes, "links": links}


@router.post("/interact/{agent_id}", response_model=AgentResponse)
async def interact(agent_id: str, request: InteractionRequest):
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent = agents[agent_id]

    # === 1. ПОЛУЧАЕМ КОНТЕКСТ ИЗ ДОЛГОВРЕМЕННОЙ ПАМЯТИ ===
    memory_context = agent["memory"].get_context_memories(request.event)

    # === 2. ПОЛУЧАЕМ РЕШЕНИЕ ОТ LLM С УЧЁТОМ ПАМЯТИ ===
    raw_data = get_ai_decision(agent, request.event, memory_context)
    data = AgentResponse(**raw_data)

    # === 3. СОХРАНЯЕМ СОБЫТИЕ В ДОЛГОВРЕМЕННУЮ ПАМЯТЬ ===
    target_obj = agents.get(request.initiator_id)
    target_name = target_obj['name'] if target_obj else "Пользователь"

    # Определяем эмоцию на основе изменения настроения
    emotion = "neutral"
    mood_change = data.new_mood - agent['mood']
    if mood_change > 0.2:
        emotion = "positive"
    elif mood_change < -0.2:
        emotion = "negative"

    # Сохраняем в память
    memory_text = f"Взаимодействие с {target_name}: {request.event}. Ответ: {data.message}"
    agent["memory"].add_memory(
        text=memory_text,
        emotion=emotion,
        importance=abs(data.rel_change) + 0.1,
        metadata={
            "target": request.initiator_id,
            "target_name": target_name,
            "thought": data.thought,
            "goal": data.goal
        }
    )

    # 4. Обновляем настроение
    new_mood_val = (agent['mood'] + data.new_mood) / 2
    agent['mood'] = round(max(-1.0, min(1.0, new_mood_val)), 2)

    # 5. Обновляем цель
    agent['current_goal'] = data.goal

    # 6. Обновляем отношения
    if request.initiator_id in agent['relationships']:
        current_rel = agent['relationships'][request.initiator_id]
        updated_rel = current_rel + data.rel_change
        agent['relationships'][request.initiator_id] = round(max(-1.0, min(1.0, updated_rel)), 2)

    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    source_name = agent['name']

    # Формируем запись для краткосрочной памяти
    memory_entry = f"[{timestamp}] Взаимодействие с {target_name}: {data.message} (Цель: {data.goal})"
    agent['history'].append(memory_entry)

    # Ограничиваем краткосрочную историю
    if len(agent['history']) > 20:
        agent['history'] = agent['history'][-20:]

    # Добавляем в глобальный лог событий
    event_log.append({
        "time": timestamp,
        "source": f"{source_name} ➔ {target_name}",
        "text": data.message,
        "action": data.action,
        "mood": agent['mood'],
        "thought": data.thought
    })

    return data

@router.post("/inject-event")
async def inject_event(agent_id: str, event_text: str):
    """Позволяет пользователю вмешаться в мир (дать задание, изменить окружение) [cite: 13, 36, 37]"""
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return await interact(agent_id, InteractionRequest(
        event=f"ВНЕШНЕЕ СОБЫТИЕ: {event_text}",
        initiator_id="user"
    ))


@router.get("/agent/{agent_id}/memory")
async def get_agent_memory(agent_id: str, query: str = None):
    """Получить воспоминания агента"""
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent = agents[agent_id]

    if query:
        memories = agent["memory"].recall_similar(query, n_results=10)
    else:
        memories = agent["memory"].get_recent(20)

    return {
        "agent_id": agent_id,
        "agent_name": agent["name"],
        "memories": memories,
        "stats": agent["memory"].get_stats()
    }


@router.post("/agent/{agent_id}/memory/clear")
async def clear_old_memories(agent_id: str, days: int = 30):
    """Очистить старые воспоминания"""
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agents[agent_id]["memory"].clear_old_memories(days)
    return {"status": "ok", "message": f"Удалены воспоминания старше {days} дней"}