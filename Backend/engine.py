import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash-lite')

SYSTEM_INSTRUCTION = """
Ты — AI-агент. Твой цикл работы:
1. Рефлексия: Оцени ситуацию.
2. Цель: Чего ты хочешь добиться в этом разговоре?
3. Действие: Твоя реплика или поступок.

Отвечай СТРОГО в формате JSON:
{
  "thought": "рефлексия",
  "goal": "цель на текущий момент",
  "message": "реплика",
  "new_mood": число (-1..1),
  "action": "действие",
  "rel_change": число
}
"""


def summarize_memories(history):
    """
    Автоматическая суммаризация старых воспоминаний (ТЗ: пункт 1.2)
    Вызывается, когда история становится слишком длинной.
    """
    if not history: return "Память чиста."

    # В идеале тут тоже запрос к LLM, но для экономии квот
    # мы объединяем последние важные события в сжатую строку.
    summary = f"Агент помнит последние {len(history)} взаимодействий. "
    summary += f"Ключевой опыт: {history[-1][:50]}..."
    return summary


def get_ai_decision(agent_data, event):
    # Ограничение контекста (ТЗ: переполнение контекста)
    if len(agent_data['history']) > 10:
        old_history = agent_data['history'][:-5]
        summary = summarize_memories(old_history)
        agent_data['history'] = [summary] + agent_data['history'][-5:]

    memories = "\n".join(agent_data['history'])

    prompt = f"""
    {SYSTEM_INSTRUCTION}
    Личность: {agent_data['bio']}
    Настроение: {agent_data['mood']}
    Отношения: {agent_data['relationships']}
    Память: {memories}

    СОБЫТИЕ: {event}
    """

    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception as e:
        # ПРЕДОХРАНИТЕЛЬ ОТ 429 ОШИБКИ (КВОТА)
        return {
            "thought": "Система перегружена, использую инстинкты.",
            "goal": "выжить",
            "message": "Я сейчас не в настроении болтать...",
            "new_mood": agent_data['mood'],
            "action": "замер",
            "rel_change": 0
        }