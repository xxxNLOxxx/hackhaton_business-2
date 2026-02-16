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
Ты — AI-агент в сложном социальном симуляторе.
Твой цикл: 1. Рефлексия (анализ ситуации), 2. Внутренний монолог (что ты думаешь о других), 3. Цель, 4. Действие.

Отвечай СТРОГО JSON-объектом:
{
  "thought": "анализ ситуации",
  "internal_monologue": "твое реальное отношение к собеседнику сейчас",
  "goal": "чего хочешь добиться",
  "message": "реплика (согласно твоему настроению)",
  "new_mood": число от -1.0 до 1.0,
  "action": "краткое описание действия",
  "rel_change": число изменения отношений,
  "style_suffix": "описание тона (н-р: агрессивно, шепотом)"
}
"""

def get_mood_description(mood):
    if mood > 0.6: return "восторженное, крайне дружелюбное"
    if mood > 0.2: return "хорошее, спокойное"
    if mood < -0.6: return "агрессивное, раздраженное"
    if mood < -0.2: return "подавленное, мрачное"
    return "нейтральное"

def get_ai_decision(agent_data, event):
    mood_str = get_mood_description(agent_data['mood'])
    # Работа с историей (памятью) остается прежней
    memories = "\n".join(agent_data['history'][-7:]) if agent_data['history'] else "Память пуста."

    prompt = f"""
    Твоя личность: {agent_data['bio']}
    Твое текущее состояние: {mood_str} (индекс: {agent_data['mood']})
    Твои отношения (симпатия от -1 до 1): {agent_data['relationships']}
    Последние события:
    {memories}

    НОВОЕ СОБЫТИЕ: {event}
    
    Важно: Твое настроение {mood_str} должно ПРЯМО влиять на текст в "message".
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