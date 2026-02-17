from pydantic import BaseModel
from typing import List, Dict, Optional
from pydantic import BaseModel, EmailStr
from typing import List
from uuid import uuid4
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
    new_mood: float
    action: str
    rel_change: float
    style_suffix: str
   
class User(BaseModel):
    id: str = None
    email: EmailStr
    password: str  # для простоты хранить в явном виде (в бою — хэшировать!)
    agents: List[CreateAgentRequest] = []

    def __init__(self, **data):
        super().__init__(**data)
        if not self.id:
            self.id = str(uuid4())

    def add_agent(self, agent):
        self.agents.append(agent)