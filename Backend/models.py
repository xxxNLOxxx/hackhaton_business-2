from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ✅ Очередь для диалогов, инициированных пользователем
DIALOGUE_PRIORITY_QUEUE: List = []

# Переменная состояния для автономного режима
AUTONOMOUS_MODE_ENABLED = True


class InteractionRequest(BaseModel):
    event: str
    initiator_id: Optional[str] = "user"
    is_observer_event: bool = False
    is_manual_override: bool = False  # ✅ Флаг для ручного управления


class CreateAgentRequest(BaseModel):
    id: str
    name: str
    bio: str
    mood: float = 0.0
    color: str = "#3b82f6"


class AgentResponse(BaseModel):
    thought: str
    internal_monologue: str
    goal: str
    message: str
    new_mood: float
    action: str
    rel_change: float
    style_suffix: str


class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password: str
    role: str = "user"
