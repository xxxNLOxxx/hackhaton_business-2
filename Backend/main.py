import datetime
import random
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import router, event_log, agents, interact, user_manager
from models import InteractionRequest

# ---------------------- ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ ----------------------
# Создаем нескольких пользователей
try:
    user1 = user_manager.register_user("alice@example.com", "password1")
except ValueError:
    user1 = user_manager.get_user_by_email("alice@example.com")

try:
    user2 = user_manager.register_user("bob@example.com", "password2")
except ValueError:
    user2 = user_manager.get_user_by_email("bob@example.com")

try:
    user3 = user_manager.register_user("carol@example.com", "password3")
except ValueError:
    user3 = user_manager.get_user_by_email("carol@example.com")

# ---------------------- АГЕНТЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ----------------------
def create_agent_if_not_exists(agent_id, name, bio, mood, color, owner_email):
    if agent_id not in agents:
        agents[agent_id] = {
            "id": agent_id,
            "name": name,
            "bio": bio,
            "mood": mood,
            "color": color,
            "relationships": {},
            "history": [],
            "current_goal": "Инициализация",
            "owner_email": owner_email
        }

# Агентов для Alice
create_agent_if_not_exists("a1", "Алиса1", "Оптимист", 0.5, "#f5a623", user1.email)
create_agent_if_not_exists("a2", "Алиса2", "Реалист", 0.0, "#4a90e2", user1.email)

# Агентов для Bob
create_agent_if_not_exists("b1", "Боб1", "Скептик", -0.3, "#50e3c2", user2.email)
create_agent_if_not_exists("b2", "Боб2", "Философ", 0.2, "#9013fe", user2.email)

# Агентов для Carol
create_agent_if_not_exists("c1", "Кэрол1", "Веселая", 0.7, "#ff69b4", user3.email)
create_agent_if_not_exists("c2", "Кэрол2", "Серьезная", -0.2, "#8b4513", user3.email)

# ---------------------- СЛУЧАЙНЫЕ СОБЫТИЯ ----------------------
RANDOM_WORLD_EVENTS = [
    "В секторе внезапно выключился свет на несколько секунд.",
    "Раздался громкий неопознанный звук из вентиляции.",
    "Система оповещения выдала ошибку: 'Обнаружена критическая доза оптимизма'.",
    "На полу обнаружена старая аудиокассета с надписью 'Для Бориса'.",
    "Произошел скачок напряжения, у всех на мгновение заискрили глаза.",
    "В воздухе появился запах озона и свежего кофе."
]

# ---------------------- АВТОНОМНЫЙ ЦИКЛ ЖИЗНИ ----------------------
async def autonomous_life_cycle():
    while True:
        await asyncio.sleep(random.randint(20, 40))
        
        if len(agents) < 2:
            continue

        # Группируем агентов по владельцам
        users_with_agents = {}
        for a in agents.values():
            users_with_agents.setdefault(a["owner_email"], []).append(a)

        # Пропускаем, если нет ни одного пользователя с 2+ агентами
        eligible_users = {k: v for k, v in users_with_agents.items() if len(v) > 1}
        if not eligible_users:
            continue

        # Берём случайного пользователя
        email, user_agents = random.choice(list(eligible_users.items()))
        actor, target = random.sample(user_agents, 2)

        # 1. Случайное внешнее событие
        if random.random() < 0.3:
            world_event = random.choice(RANDOM_WORLD_EVENTS)
            event_log.append({
                "time": datetime.datetime.now().strftime("%H:%M:%S"),
                "source": "Окружение",
                "text": world_event,
                "action": "ambient_event",
                "mood": 0
            })
            await interact(actor["id"], InteractionRequest(
                event=f"Ты заметил следующее: {world_event}. Как это повлияет на твои планы?",
                initiator_id="system"
            ))
            continue

        # 2. Взаимодействие двух агентов
        init_prompt = f"Ты находишься в одной комнате с {target['name']}. Твоя цель: {actor['current_goal']}. Что скажешь или сделаешь?"
        try:
            actor_data = await interact(actor["id"], InteractionRequest(
                event=init_prompt,
                initiator_id=target["id"]
            ))
            if actor_data.message:
                await asyncio.sleep(3)
                reaction_prompt = f"{actor['name']} обращается к тебе: '{actor_data.message}'"
                await interact(target["id"], InteractionRequest(
                    event=reaction_prompt,
                    initiator_id=actor["id"]
                ))
        except Exception as e:
            print(f"Ошибка в цикле жизни: {e}")

# ---------------------- FASTAPI ----------------------
app = FastAPI(title="Cyber Leap AI Agents Core")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутер с логикой агентов
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    """Запуск симуляции при старте сервера"""
    print("--- СИМУЛЯЦИЯ ЗАПУЩЕНА ---")
    asyncio.create_task(autonomous_life_cycle())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
