import asyncio
import random
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api import router, handle_interaction, agent_manager
from models import InteractionRequest, AUTONOMOUS_MODE_ENABLED, DIALOGUE_PRIORITY_QUEUE

async def run_dialogue_scene(email: str, agent1_id: str, agent2_id: str):
    """Логика проведения одного диалога между двумя агентами."""
    agent1 = agent_manager.get_agent(agent1_id)
    agent2 = agent_manager.get_agent(agent2_id)
    if not agent1 or not agent2:
        return

    agent_list = agent_manager.get_agents_by_owner(email)
    observers = [a for a in agent_list if a['id'] not in (agent1_id, agent2_id)]

    # 1. Агент 1 начинает
    response1 = handle_interaction(agent1_id, InteractionRequest(event=f"Ты видишь {agent2['name']}. Начни диалог.", initiator_id=agent2_id), email)
    if not response1.message:
        return

    for observer in observers:
        handle_interaction(observer['id'], InteractionRequest(event=f"Ты слышишь, как {agent1['name']} говорит {agent2['name']}: \"{response1.message}\"", initiator_id=agent1_id, is_observer_event=True), email)

    await asyncio.sleep(3)

    # 2. Агент 2 отвечает
    response2 = handle_interaction(agent2_id, InteractionRequest(event=f"{agent1['name']} говорит тебе: {response1.message}", initiator_id=agent1_id), email)
    if not response2.message:
        return

    for observer in observers:
        handle_interaction(observer['id'], InteractionRequest(event=f"Ты слышишь, как {agent2['name']} отвечает {agent1['name']}: \"{response2.message}\"", initiator_id=agent2_id, is_observer_event=True), email)

    await asyncio.sleep(3)

    # 3. Агент 1 реагирует
    handle_interaction(agent1_id, InteractionRequest(event=f"{agent2['name']} отвечает тебе: {response2.message}", initiator_id=agent2_id), email)

async def autonomous_life_cycle():
    while True:
        await asyncio.sleep(5)
        if not AUTONOMOUS_MODE_ENABLED:
            continue

        actor1_id, actor2_id, email = None, None, None

        # ✅ Сначала проверяем приоритетную очередь
        if DIALOGUE_PRIORITY_QUEUE:
            email, actor1_id, actor2_id = DIALOGUE_PRIORITY_QUEUE.pop(0)
        else:
            # Иначе — выбираем случайных
            users = {a["owner_email"]: [agent['id'] for agent in agent_manager.get_agents_by_owner(a["owner_email"])] for a in agent_manager.agents.values()}
            users = {k: v for k, v in users.items() if len(v) >= 2}
            if not users:
                continue
            email, agent_ids = random.choice(list(users.items()))
            actor1_id, actor2_id = random.sample(agent_ids, 2)

        if actor1_id and actor2_id:
            await run_dialogue_scene(email, actor1_id, actor2_id)

        await asyncio.sleep(random.randint(15, 25))


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
