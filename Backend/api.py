import datetime
from fastapi import APIRouter, HTTPException
from models import InteractionRequest, AgentResponse
from engine_gigachat import get_ai_decision

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
        "current_goal": "Поддерживать стабильность систем"
    },
    "alice": {
        "id": "alice",
        "name": "Алиса",
        "bio": "Жизнерадостный дрон-оптимист. Верит, что даже у Бориса есть сердце (или центральный процессор).",
        "mood": 0.9,
        "color": "#f5a623", 
        "relationships": {"boris": 0.5, "user": 0},
        "history": [],
        "current_goal": "Поднять всем настроение"
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
    
    # Получаем решение от LLM (Рефлексия -> Цель -> Действие) [cite: 22, 23]
    raw_data = get_ai_decision(agent, request.event)
    data = AgentResponse(**raw_data)

    # 1. Обновляем настроение (плавный переход для стабильности) [cite: 19, 20]
    # Смешиваем текущее настроение с тем, что предложила LLM
    new_mood_val = (agent['mood'] + data.new_mood) / 2
    agent['mood'] = round(max(-1.0, min(1.0, new_mood_val)), 2)
    
    # 2. Обновляем цель [cite: 22]
    agent['current_goal'] = data.goal

    # 3. Обновляем отношения (если инициатор известен) [cite: 26]
    if request.initiator_id in agent['relationships']:
        current_rel = agent['relationships'][request.initiator_id]
        updated_rel = current_rel + data.rel_change
        agent['relationships'][request.initiator_id] = round(max(-1.0, min(1.0, updated_rel)), 2)

    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    source_name = agent['name']
    target_obj = agents.get(request.initiator_id)
    target_name = target_obj['name'] if target_obj else "Пользователь"

    # Формируем запись для памяти агента [cite: 15]
    memory_entry = f"[{timestamp}] Взаимодействие с {target_name}: {data.message} (Цель: {data.goal})"
    agent['history'].append(memory_entry)

    # Добавляем в глобальный лог событий [cite: 28]
    event_log.append({
        "time": timestamp,
        "source": f"{source_name} ➔ {target_name}",
        "text": data.message,
        "action": data.action,
        "mood": agent['mood'],
        "thought": data.thought # Фронтенд может выводить это при клике
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