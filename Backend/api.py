import datetime

from fastapi import APIRouter, HTTPException
from models import InteractionRequest, AgentResponse
from engine import get_ai_decision

event_log = [
    {"time": "00:00:00", "source": "Система", "text": "Симуляция запущена"}
]

router = APIRouter()

# Храним данные в памяти
agents = {
    "boris": {
        "id": "boris",
        "name": "Борис",
        "bio": "Робот-мизантроп, который любит порядок.",
        "mood": -0.5,
        "relationships": {"alice": 0, "user": 0},
        "history": []
    },
    "alice": {
        "id": "alice",
        "name": "Алиса",
        "bio": "Жизнерадостный дрон-оптимист.",
        "mood": 0.9,
        "relationships": {"boris": 0, "user": 0},
        "history": []
    }
}


@router.get("/agents")
async def get_all_agents():
    return agents

@router.get("/events")
async def get_events():
    """Отдает список всех событий для фронтенда"""
    return event_log


@router.post("/interact/{agent_id}", response_model=AgentResponse)
async def interact(agent_id: str, request: InteractionRequest):
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    # Агенты
    agent = agents[agent_id]
    # Json ответ от MML
    raw_data = get_ai_decision(agent, request.event)
    # Serialize
    data = AgentResponse(**raw_data)

    # Обновляем состояние агента
    agent['mood'] = max(-1.0, min(1.0, data.new_mood))
    agent['current_goal'] = data.goal

    timestamp = datetime.datetime.now().strftime("%H:%M:%S")

    source_name = agent['name']
    target_name = agents[request.initiator_id]['name'] if request.initiator_id in agents else "Пользователь"

    display_source = f"{source_name} ➔ {target_name}"

    # Добавляем в историю (память)
    agent['history'].append(f"[{timestamp}] {request.event} | Ответ: {data.message}")

    # Добавляем в глобальный лог событий (то, что видит фронтенд)
    event_log.append({
        "time": timestamp,
        "source": display_source,  # Теперь тут видно направление
        "text": data.message,
        "action": data.action
    })

    # Отношения
    if request.initiator_id in agent['relationships']:
        agent['relationships'][request.initiator_id] = round(
            agent['relationships'][request.initiator_id] + data.rel_change, 2
        )

    return data