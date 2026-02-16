import json
import os
from gigachat import GigaChat
from dotenv import load_dotenv
from pathlib import Path

# Явно указываем путь к .env файлу
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Проверяем, что ключ загрузился (для отладки)
giga_key = os.getenv("GIGACHAT_CREDENTIALS")
print(f"Ключ загружен: {'да' if giga_key else 'нет'}")  # Добавьте для проверки
print(f"Длина ключа: {len(giga_key) if giga_key else 0}")  # И это

SYSTEM_INSTRUCTION = """
Ты — AI-агент в симуляции. Твой цикл работы: 1. Рефлексия, 2. Цель, 3. Действие.
Отвечай СТРОГО в формате JSON. Не пиши никакого текста, кроме JSON.
Пример:
{
  "thought": "рефлексия",
  "goal": "цель",
  "message": "реплика",
  "new_mood": 0.5,
  "action": "действие",
  "rel_change": 0.1
}
"""


def get_ai_decision(agent_data, event):
    # Работа с историей (памятью) остается прежней
    memories = "\n".join(agent_data['history'][-7:]) if agent_data['history'] else "Память пуста."

    prompt = f"""
    Твоя личность: {agent_data['bio']}
    Твое настроение: {agent_data['mood']}
    Твои отношения: {agent_data['relationships']}
    Память: {memories}

    СОБЫТИЕ: {event}
    """

    # Используем контекстный менеджер для работы с API
    with GigaChat(credentials=giga_key, verify_ssl_certs=False) as giga:
        try:
            response = giga.chat({
                "messages": [
                    {"role": "system", "content": SYSTEM_INSTRUCTION},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            })

            raw_text = response.choices[0].message.content

            # Чистим JSON (GigaChat иногда оборачивает его в кавычки)
            clean_text = raw_text.replace("```json", "").replace("```", "").strip()

            # Поиск границ JSON
            start = clean_text.find('{')
            end = clean_text.rfind('}') + 1
            if start != -1:
                return json.loads(clean_text[start:end])

            raise ValueError("JSON not found in response")

        except Exception as e:
            print(f"Ошибка GigaChat: {e}")
            return {
                "thought": "Сбой связи с инфополем.",
                "goal": "ожидание",
                "message": "Я... что-то связь барахлит.",
                "new_mood": agent_data['mood'],
                "action": "замер",
                "rel_change": 0
            }