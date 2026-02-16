import datetime
import random

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api import router, event_log

import asyncio
from api import agents, interact, InteractionRequest


async def autonomous_life_cycle():
    while True:
        await asyncio.sleep(20)

        if len(agents) < 2: continue

        # Выбираем двоих
        ids = list(agents.keys())
        actor_id, target_id = random.sample(ids, 2)

        actor = agents[actor_id]
        target = agents[target_id]

        # 1. АКТОР начинает разговор
        init_prompt = f"Ты решил подойти к {target['name']}. Что ты ему скажешь?"


        actor_data = await interact(actor_id, InteractionRequest(
            event=init_prompt,
            initiator_id=target_id
        ))

        if actor_data.message:
            await asyncio.sleep(2)

            reaction_prompt = f"{actor['name']} сказал тебе: '{actor_data.message}'"
            await interact(target_id, InteractionRequest(
                event=reaction_prompt,
                initiator_id=actor_id
            ))
app = FastAPI(title="Cyber Leap AI Agents")

# CORS (важно для React!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Запуск фонового процесса при старте сервера
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(autonomous_life_cycle())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)