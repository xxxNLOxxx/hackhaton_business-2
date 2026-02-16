import datetime
import random
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router, event_log, agents, interact
from models import InteractionRequest

# Список случайных событий для оживления мира (ТЗ: "Изменение окружения")
RANDOM_WORLD_EVENTS = [
    "В секторе внезапно выключился свет на несколько секунд.",
    "Раздался громкий неопознанный звук из вентиляции.",
    "Система оповещения выдала ошибку: 'Обнаружена критическая доза оптимизма'.",
    "На полу обнаружена старая аудиокассета с надписью 'Для Бориса'.",
    "Произошел скачок напряжения, у всех на мгновение заискрили глаза.",
    "В воздухе появился запах озона и свежего кофе."
]

async def autonomous_life_cycle():
    """Фоновый процесс, имитирующий самостоятельную жизнь агентов"""
    while True:
        # Увеличиваем интервал, чтобы LLM успевала отвечать без перегрузки
        await asyncio.sleep(random.randint(20, 40))

        if len(agents) < 2:
            continue

        # --- ВЕРОЯТНОСТЬ 1: Случайное внешнее событие (30% шанс) ---
        if random.random() < 0.3:
            world_event = random.choice(RANDOM_WORLD_EVENTS)
            target_id = random.choice(list(agents.keys()))
            
            # Добавляем в лог для фронтенда
            event_log.append({
                "time": datetime.datetime.now().strftime("%H:%M:%S"),
                "source": "Окружение",
                "text": world_event,
                "action": "ambient_event",
                "mood": 0
            })
            
            # Заставляем агента среагировать на событие
            await interact(target_id, InteractionRequest(
                event=f"Ты заметил следующее: {world_event}. Как это повлияет на твои планы?",
                initiator_id="system"
            ))
            continue # После мирового события ждем следующего цикла

        # --- ВЕРОЯТНОСТЬ 2: Взаимодействие агентов ---
        ids = list(agents.keys())
        actor_id, target_id = random.sample(ids, 2)

        actor = agents[actor_id]
        target = agents[target_id]

        # 1. АКТОР решает инициировать диалог
        # В промпт добавляем контекст текущей цели
        init_prompt = (
            f"Ты находишься в одной комнате с {target['name']}. "
            f"Твоя текущая цель: {actor['current_goal']}. "
            f"Что ты скажешь или сделаешь?"
        )

        try:
            actor_data = await interact(actor_id, InteractionRequest(
                event=init_prompt,
                initiator_id=target_id
            ))

            # Если актор что-то сказал, цель передается цели (target)
            if actor_data.message and len(actor_data.message) > 2:
                # Небольшая пауза для реалистичности "раздумий"
                await asyncio.sleep(3)

                reaction_prompt = f"{actor['name']} обращается к тебе: '{actor_data.message}'"
                
                await interact(target_id, InteractionRequest(
                    event=reaction_prompt,
                    initiator_id=actor_id
                ))
        except Exception as e:
            print(f"Ошибка в цикле жизни: {e}")

app = FastAPI(title="Cyber Leap AI Agents Core")

# Настройка CORS для работы с фронтендом (React/Vue/D3.js)
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
    # Запуск на порту 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)