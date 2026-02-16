from pydantic import BaseModel
from typing import List, Dict, Optional

class InteractionRequest(BaseModel):
    event: str
    initiator_id: Optional[str] = "user"

class AgentResponse(BaseModel):
    thought: str
    goal: str
    message: str
    new_mood: float
    action: str
    rel_change: float