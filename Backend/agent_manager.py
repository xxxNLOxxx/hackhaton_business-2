# agent_manager.py
import json
from pathlib import Path
from typing import Dict, List, Optional

class AgentManager:
    """
    Менеджер агентов с сохранением в JSON-файл
    """
    def __init__(self, storage_path="./agents.json"):
        self.storage_path = Path(storage_path)
        self.agents: Dict[str, Dict] = {}
        self._load_agents()

    def _save_agents(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(self.agents, f, ensure_ascii=False, indent=2)

    def _load_agents(self):
        if self.storage_path.exists():
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.agents = json.load(f)
            except Exception as e:
                print("⚠️ Ошибка загрузки агентов:", e)
                self.agents = {}

    def get_agent(self, agent_id: str) -> Optional[Dict]:
        return self.agents.get(agent_id)

    def add_agent(self, agent_data: Dict):
        self.agents[agent_data["id"]] = agent_data
        self._save_agents()

    def update_agent(self, agent_id: str, **kwargs):
        if agent_id in self.agents:
            self.agents[agent_id].update(kwargs)
            self._save_agents()

    def get_agents_by_owner(self, owner_email: str) -> List[Dict]:
        return [a for a in self.agents.values() if a["owner_email"] == owner_email]
