import datetime
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Dict
from agent_manager import AgentManager
import models # ✅ Импортируем модуль models
from engine_gigachat import get_ai_decision
from user_manager import UserManager
from long_term_memory import LongTermMemory

router = APIRouter()
user_manager = UserManager()
agent_manager = AgentManager(storage_path="./agents.json")
event_log: list[Dict] = []
memories: Dict[str, LongTermMemory] = {}

# ------------------ HELPERS ------------------

def clamp(v: float) -> float:
    return round(max(-1.0, min(1.0, v)), 2)

def sync_agent_relationships(owner_email: str):
    user_agents = agent_manager.get_agents_by_owner(owner_email)
    for a in user_agents:
        for b in user_agents:
            if a["id"] != b["id"]:
                a["relationships"].setdefault(b["id"], 0.0)

def ensure_same_owner(agent_id: str, email: str) -> Dict:
    agent = agent_manager.get_agent(agent_id)
    if not agent: raise HTTPException(404, "Agent not found")
    if agent["owner_email"] != email: raise HTTPException(403, "Forbidden")
    return agent

def handle_interaction(agent_id: str, req: models.InteractionRequest, email: str) -> models.AgentResponse:
    agent = ensure_same_owner(agent_id, email)

    data_dict = get_ai_decision(agent, req.event, req.is_observer_event)
    data = models.AgentResponse(**data_dict)

    agent["mood"] = clamp(agent["mood"] + data.new_mood)
    agent["current_goal"] = data.goal

    if req.initiator_id != "user":
        initiator_agent = agent_manager.get_agent(req.initiator_id)
        if initiator_agent and initiator_agent["owner_email"] == email:
            agent["relationships"][req.initiator_id] = clamp(
                agent["relationships"].get(req.initiator_id, 0.0) + data.rel_change
            )

    agent["history"].append(req.event)
    agent["history"] = agent["history"][-20:]

    if data.message:
        event_log.append({
            "time": datetime.datetime.now().strftime("%H:%M:%S"), "type": "agent",
            "actor": agent["id"], "text": data.message, "mood": agent["mood"],
            "owner_email": agent["owner_email"]
        })
        event_log[:] = event_log[-200:]

    if agent_id not in memories:
        memories[agent_id] = LongTermMemory(agent_id)

    memories[agent_id].add_memory(
        text=f"Событие: {req.event} | Ответ: {data.message}",
        emotion="neutral", importance=0.5
    )

    agent_manager.update_agent(agent_id, **agent)
    return data

# ------------------ API ------------------

@router.get("/autonomous-mode")
def get_autonomous_mode_status():
    return {"enabled": models.AUTONOMOUS_MODE_ENABLED}

@router.post("/autonomous-mode/toggle")
def toggle_autonomous_mode():
    models.AUTONOMOUS_MODE_ENABLED = not models.AUTONOMOUS_MODE_ENABLED
    return {"enabled": models.AUTONOMOUS_MODE_ENABLED}

@router.post("/interact/{agent_id}", response_model=models.AgentResponse)
async def interact(agent_id: str, req: models.InteractionRequest, email: str = Header(...)):
    return handle_interaction(agent_id, req, email)

class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: AuthRequest):
    user = user_manager.register_user(req.email, req.password)
    for base in ["mentor", "critic"]:
        agent_id = f"{user.email}_{base}"
        agent_manager.add_agent({
            "id": agent_id, "name": base.capitalize(), "bio": "Системный агент",
            "mood": 0.0, "color": "#888888", "relationships": {},
            "history": [], "current_goal": "Инициализация", "owner_email": user.email
        })
    sync_agent_relationships(user.email)
    return {"email": user.email}

@router.post("/login")
def login(req: AuthRequest):
    user = user_manager.login_user(req.email, req.password)
    if not user: raise HTTPException(401, "Invalid credentials")
    sync_agent_relationships(user.email)
    return {"email": user.email}

@router.post("/me/agents")
def create_agent(req: models.CreateAgentRequest, email: str = Header(...)):
    agent_id = f"{email}_{req.id}"
    if agent_manager.get_agent(agent_id): raise HTTPException(400, "Agent exists")
    agent_manager.add_agent({
        "id": agent_id, "name": req.name, "bio": req.bio, "mood": clamp(req.mood),
        "color": req.color, "relationships": {}, "history": [],
        "current_goal": "Инициализация", "owner_email": email
    })
    sync_agent_relationships(email)
    memories[agent_id] = LongTermMemory(agent_id)
    return agent_manager.get_agent(agent_id)

@router.get("/me/agents")
def get_my_agents(email: str = Header(...)):
    return agent_manager.get_agents_by_owner(email)

@router.get("/me/events")
def get_events(email: str = Header(...)):
    return [e for e in event_log if e.get("owner_email") == email][-100:]

@router.get("/me/graph")
def get_graph(email: str = Header(...)):
    user_agents = agent_manager.get_agents_by_owner(email)
    nodes = [{"id": a["id"], "name": a["name"], "color": a["color"]} for a in user_agents]
    links = []
    for a in user_agents:
        for b_id, rel in a["relationships"].items():
            if any(b["id"] == b_id for b in user_agents):
                links.append({"source": a["id"], "target": b_id, "value": rel})
    return {"nodes": nodes, "links": links}
