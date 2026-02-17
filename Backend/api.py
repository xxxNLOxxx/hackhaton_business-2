import datetime
from fastapi import APIRouter, HTTPException, Query
from models import InteractionRequest, AgentResponse, CreateAgentRequest, User
from engine_gigachat import get_ai_decision
from uuid import uuid4
from user_manager import UserManager
from pydantic import BaseModel

# Глобальный лог событий для фронтенда [cite: 28]
event_log = [
    {"time": "00:00:00", "source": "Система", "text": "Симуляция запущена", "mood": 0}
]

router = APIRouter()
user_manager = UserManager()

# Храним данные в памяти (пока коллега не подключит БД) [cite: 9]
agents = {
    "boris": {
        "id": "boris",
        "name": "Борис",
        "bio": "Робот-мизантроп, который любит порядок. Терпеть не может хаос и излишний оптимизм.",
        "mood": -0.5,
        "color": "#4a90e2",
        "relationships": {"alice": -0.2, "user": 0},
        "history": [],
        "current_goal": "Поддерживать стабильность систем",
        "owner_email": None
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
        "owner_email": None
    }
}

# ------------------ CRUD для агентов ------------------

@router.get("/agents")
async def get_all_agents():
    """Возвращает текущее состояние всех агентов для инспектора"""
    return agents

@router.post("/agents")
async def create_agent(req: CreateAgentRequest, email: str = Query(...)):
    """Создание агента с указанием владельца"""
    if req.id in agents:
        raise HTTPException(status_code=400, detail="Agent already exists")

    agents[req.id] = {
        "id": req.id,
        "name": req.name,
        "bio": req.bio,
        "mood": round(max(-1.0, min(1.0, req.mood)), 2),
        "color": req.color,
        "relationships": {},
        "history": [],
        "current_goal": "Инициализация",
        "owner_email": email
    }

    # Связываем только с агентами одного пользователя
    for a_id, a in agents.items():
        if a_id != req.id and a["owner_email"] == email:
            a["relationships"][req.id] = 0
            agents[req.id]["relationships"][a_id] = 0

    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    event_log.append({
        "time": timestamp,
        "source": "Система",
        "text": f"В симуляцию добавлен агент {req.name}",
        "mood": 0
    })

    return agents[req.id]

# ------------------ События ------------------

@router.get("/events")
async def get_events():
    return event_log

@router.get("/graph")
async def get_graph_data():
    nodes = [
        {"id": a_id, "name": a["name"], "mood": a["mood"], "color": a["color"]} 
        for a_id, a in agents.items()
    ]
    links = []
    for source_id, agent in agents.items():
        for target_id, strength in agent["relationships"].items():
            if target_id in agents:
                links.append({
                    "source": source_id,
                    "target": target_id,
                    "value": strength
                })
    return {"nodes": nodes, "links": links}

# ------------------ Взаимодействие ------------------

@router.post("/interact/{agent_id}", response_model=AgentResponse)
async def interact(agent_id: str, request: InteractionRequest):
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = agents[agent_id]
    raw_data = get_ai_decision(agent, request.event)
    data = AgentResponse(**raw_data)

    # Обновляем настроение и цель
    agent['mood'] = round(max(-1.0, min(1.0, (agent['mood'] + data.new_mood)/2)), 2)
    agent['current_goal'] = data.goal

    if request.initiator_id in agent['relationships']:
        current_rel = agent['relationships'][request.initiator_id]
        agent['relationships'][request.initiator_id] = round(max(-1.0, min(1.0, current_rel + data.rel_change)), 2)

    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    target_obj = agents.get(request.initiator_id)
    target_name = target_obj['name'] if target_obj else "Пользователь"

    memory_entry = f"[{timestamp}] Взаимодействие с {target_name}: {data.message} (Цель: {data.goal})"
    agent['history'].append(memory_entry)

    event_log.append({
        "time": timestamp,
        "agent_id": agent_id,
        "agent_name": agent['name'],
        "initiator": target_name,
        "reasoning": {
            "thought": data.thought,
            "internal_monologue": data.internal_monologue,
            "goal": data.goal,
            "action": data.action
        },
        "message": data.message,
        "mood": agent['mood']
    })

    return data

@router.post("/inject-event")
async def inject_event(agent_id: str, event_text: str):
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return await interact(agent_id, InteractionRequest(
        event=f"ВНЕШНЕЕ СОБЫТИЕ: {event_text}",
        initiator_id="user"
    ))

@router.get("/agents/{agent_id}/logic")
async def get_agent_logic(agent_id: str):
    if agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    return [
        e for e in event_log
        if e.get("agent_id") == agent_id and "reasoning" in e
    ][-10:]

# ------------------ Пользователи ------------------

class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: AuthRequest):
    try:
        user = user_manager.register_user(req.email, req.password)
        return {"id": user.id, "email": user.email}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(req: AuthRequest):
    user = user_manager.login_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    return {"id": user.id, "email": user.email}

@router.post("/me/agents")
def add_agent(req: CreateAgentRequest, email: str = Query(...)):
    user = user_manager.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    user.add_agent(req)

    if req.id in agents:
        raise HTTPException(status_code=400, detail="Agent already exists globally")

    agents[req.id] = {
        "id": req.id,
        "name": req.name,
        "bio": req.bio,
        "mood": round(max(-1.0, min(1.0, req.mood)), 2),
        "color": req.color,
        "relationships": {},
        "history": [],
        "current_goal": "Инициализация",
        "owner_email": email
    }

    for a_id, a in agents.items():
        if a_id != req.id and a["owner_email"] == email:
            a["relationships"][req.id] = 0
            agents[req.id]["relationships"][a_id] = 0

    return agents[req.id]

@router.get("/me/agents")
def get_my_agents(email: str = Query(...)):
    user = user_manager.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return [a for a in agents.values() if a["owner_email"] == email]
