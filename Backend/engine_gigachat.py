import json
import os
from pathlib import Path
from typing import Dict, Any

from gigachat import GigaChat
from dotenv import load_dotenv

# ---------------------- ENV ----------------------
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

GIGACHAT_CREDENTIALS = os.getenv("GIGACHAT_CREDENTIALS")
if not GIGACHAT_CREDENTIALS:
    raise RuntimeError("GIGACHAT_CREDENTIALS не найден в .env")

# ---------------------- SYSTEM PROMPT ----------------------
SYSTEM_INSTRUCTION = """
Ты — автономный AI-агент в социальной симуляции.
Ты ОБЯЗАН отвечать СТРОГО валидным JSON без markdown и пояснений.
Формат:
{
  "thought": "...",
  "internal_monologue": "...",
  "goal": "...",
  "message": "...",
  "new_mood": число от -1.0 до 1.0,
  "action": "...",
  "rel_change": число от -1.0 до 1.0,
  "style_suffix": "..."
}
"""

# ---------------------- HELPERS ----------------------
def clamp(value: float, min_v=-1.0, max_v=1.0) -> float:
    return round(max(min_v, min(max_v, value)), 2)


def extract_json(text: str) -> Dict[str, Any]:
    try:
        cleaned = text.replace("```json", "").replace("```", "").strip()
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start == -1 or end == -1:
            raise ValueError("JSON не найден")
        return json.loads(cleaned[start:end])
    except Exception:
        return {}


def fallback_response() -> Dict[str, Any]:
    return {
        "thought": "Ошибка обработки",
        "internal_monologue": "Лучше ничего не предпринимать",
        "goal": "Стабильность",
        "message": "Мне нужно время, чтобы разобраться.",
        "new_mood": 0.0,
        "action": "ожидание",
        "rel_change": 0.0,
        "style_suffix": "нейтрально"
    }

# ---------------------- MAIN ----------------------
def get_ai_decision(agent_data: Dict[str, Any], event: str) -> Dict[str, Any]:
    relationships = ", ".join(f"{k}:{v}" for k, v in agent_data["relationships"].items()) or "нет"
    memories = "\n".join(agent_data["history"][-7:]) or "память пуста"

    prompt = f"""
Личность:
{agent_data['bio']}

Настроение:
{agent_data['mood']}

Отношения:
{relationships}

Воспоминания:
{memories}

СОБЫТИЕ:
{event}
"""

    try:
        with GigaChat(credentials=GIGACHAT_CREDENTIALS, verify_ssl_certs=False) as giga:
            response = giga.chat({
                "messages": [
                    {"role": "system", "content": SYSTEM_INSTRUCTION},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            })
            content = getattr(response.choices[0].message, "content", "")
            data = extract_json(content)

            return {
                "thought": data.get("thought", ""),
                "internal_monologue": data.get("internal_monologue", ""),
                "goal": data.get("goal", "наблюдение"),
                "message": data.get("message", ""),
                "new_mood": clamp(float(data.get("new_mood", 0.0))),
                "action": data.get("action", "ожидание"),
                "rel_change": clamp(float(data.get("rel_change", 0.0))),
                "style_suffix": data.get("style_suffix", "нейтрально")
            }

    except Exception as e:
        print("[GIGACHAT ERROR]", e)
        return fallback_response()
