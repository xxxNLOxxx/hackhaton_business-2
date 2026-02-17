from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import uuid4
from pydantic import BaseModel
from typing import Optional

class InteractionRequest(BaseModel):
    event: str
    initiator_id: Optional[str] = "user"


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
    new_mood: float      # ДЕЛЬТА
    action: str
    rel_change: float
    style_suffix: str


class User(BaseModel):
    id: str = None
    email: EmailStr
    password: str
    role: str = "user"

    def __init__(self, **data):
        super().__init__(**data)
        if not self.id:
            self.id = str(uuid4())
class UpdateUserRequest(BaseModel):
    role: Optional[str] = None
    password: Optional[str] = None


class UpdateAgentRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    mood: Optional[float] = None
    color: Optional[str] = None
    current_goal: Optional[str] = None