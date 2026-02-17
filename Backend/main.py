import asyncio
import random
import datetime

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api import router, event_log, handle_interaction, agent_manager
from models import InteractionRequest

RANDOM_WORLD_EVENTS = [
    "Погас свет.",
    "Система шумит.",
    "Сбой сенсоров.",
]

async def autonomous_life_cycle():
    while True:
        await asyncio.sleep(random.randint(20, 40))

        users = {}
        for a in agents.values():
            users.setdefault(a["owner_email"], []).append(a)

        users = {k: v for k, v in users.items() if len(v) >= 2}
        if not users:
            continue

        email, lst = random.choice(list(users.items()))
        actor, target = random.sample(lst, 2)

        if random.random() < 0.3:
            event = random.choice(RANDOM_WORLD_EVENTS)
            event_log.append({
                "time": datetime.datetime.now().strftime("%H:%M:%S"),
                "type": "world",
                "actor": "environment",
                "text": event,
                "mood": 0
            })
            handle_interaction(actor["id"], InteractionRequest(event=event, initiator_id="environment"), email)
        else:
            r = handle_interaction(actor["id"], InteractionRequest(event=f"Ты видишь {target['name']}", initiator_id=target["id"]), email)
            if r.message:
                await asyncio.sleep(2)
                handle_interaction(target["id"], InteractionRequest(event=r.message, initiator_id=actor["id"]), email)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(autonomous_life_cycle())
    yield
    task.cancel()

app = FastAPI(title="Cyber Leap — AI Agents Core", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
