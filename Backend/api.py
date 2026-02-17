import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict

from models import InteractionRequest, AgentResponse, CreateAgentRequest
from engine_gigachat import get_ai_decision
from user_manager import UserManager
from long_term_memory import LongTermMemory

router = APIRouter()
user_manager = UserManager()

agents: Dict[str, Dict] = {}
event_log: list[Dict] = []
memories: Dict[str, LongTermMemory] = {}

# ------------------ HELPERS ------------------

def clamp(v: float) -> float:
    return round(max(-1.0, min(1.0, v)), 2)


def sync_agent_relationships(owner_email: str):
    user_agents = [a for a in agents.values() if a["owner_email"] == owner_email]
    for a in user_agents:
        for b in user_agents:
            if a["id"] != b["id"]:
                a["relationships"].setdefault(b["id"], 0.0)


def ensure_same_owner(agent_id: str, email: str) -> Dict:
    agent = agents.get(agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    if agent["owner_email"] != email:
        raise HTTPException(403, "Forbidden")
    return agent


def handle_interaction(agent_id: str, req: InteractionRequest, email: str) -> AgentResponse:
    agent = ensure_same_owner(agent_id, email)

    data = AgentResponse(**get_ai_decision(agent, req.event))

    # обновляем настроение и цель
    agent["mood"] = clamp(agent["mood"] + data.new_mood)
    agent["current_goal"] = data.goal

    # безопасное обновление отношений
    if req.initiator_id in agents:
        initiator_agent = agents[req.initiator_id]
        if initiator_agent["owner_email"] == email:
            agent["relationships"][req.initiator_id] = clamp(
                agent["relationships"].get(req.initiator_id, 0.0) + data.rel_change
            )

    # добавляем событие в историю
    agent["history"].append(req.event)
    agent["history"] = agent["history"][-20:]

    # добавляем событие в лог
    log_entry = {
        "time": datetime.datetime.now().strftime("%H:%M:%S"),
        "type": "agent" if req.initiator_id in agents else "system",
        "actor": agent["id"],
        "text": data.message,
        "mood": agent["mood"]
    }
    event_log.append(log_entry)
    event_log[:] = event_log[-200:]

    # записываем в долговременную память
    if agent_id not in memories:
        memories[agent_id] = LongTermMemory(agent_id)
    memories[agent_id].add_memory(
        text=f"Событие: {req.event} | Ответ: {data.message}",
        emotion="neutral",  # можно улучшить с использованием data.new_mood
        importance=0.5
    )

    return data

# ------------------ API ------------------

@router.post("/interact/{agent_id}", response_model=AgentResponse)
async def interact(agent_id: str, req: InteractionRequest, email: str = Query(...)):
    return handle_interaction(agent_id, req, email)


class AuthRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(req: AuthRequest):
    try:
        user = user_manager.register_user(req.email, req.password)
    except ValueError as e:
        raise HTTPException(400, str(e))

    for base in ["mentor", "critic"]:
        agent_id = f"{user.email}_{base}"
        agents[agent_id] = {
            "id": agent_id,
            "name": base.capitalize(),
            "bio": "Системный агент",
            "mood": 0.0,
            "color": "#888888",
            "relationships": {},
            "history": [],
            "current_goal": "Инициализация",
            "owner_email": user.email
        }

    sync_agent_relationships(user.email)
    return {"email": user.email}


@router.post("/login")
def login(req: AuthRequest):
    user = user_manager.login_user(req.email, req.password)
    if not user:
        raise HTTPException(401, "Invalid credentials")
    return {"email": user.email}


@router.post("/me/agents")
def create_agent(req: CreateAgentRequest, email: str = Query(...)):
    if not user_manager.get_user_by_email(email):
        raise HTTPException(401, "Unauthorized")

    agent_id = f"{email}_{req.id}"
    if agent_id in agents:
        raise HTTPException(400, "Agent exists")

    agents[agent_id] = {
        "id": agent_id,
        "name": req.name,
        "bio": req.bio,
        "mood": clamp(req.mood),
        "color": req.color,
        "relationships": {},
        "history": [],
        "current_goal": "Инициализация",
        "owner_email": email
    }

    sync_agent_relationships(email)
    memories[agent_id] = LongTermMemory(agent_id)
    return agents[agent_id]


@router.get("/me/agents")
def get_my_agents(email: str = Query(...)):
    return [a for a in agents.values() if a["owner_email"] == email]
