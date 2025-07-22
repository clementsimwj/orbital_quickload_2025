##continue working on this, so i can just import these functions to the other python files
## maybe make the card/form a component

import asyncio
import httpx
import os

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from configurations import async_session

TELEGRAM_BOT_TOKEN = os.getenv("BOT_TOKEN")

async def machine_complete_updater(machine_id: int, delay_minutes: int, db: AsyncSession):
    await asyncio.sleep(delay_minutes * 60)
    async with async_session() as db:
        # mark machine as complete
        query = text("UPDATE machines SET status = 'complete' WHERE machine_id = :machine_id")
        await db.execute(query, {"machine_id": machine_id})
        await db.commit()

        # get telegram id
        result = await db.execute(
            text("SELECT telegram_id FROM notifications WHERE machine_id = :machine_id AND done = false"),
            {"machine_id": machine_id}
        )
        row = result.fetchone()
        if row:
            chat_id = row.telegram_id
            print(chat_id)
            await send_telegram_message(chat_id, f"✅ Your laundry on machine {machine_id} is complete!")

async def send_telegram_message(chat_id: str, message: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message
    }
    async with httpx.AsyncClient() as client:
        await client.post(url, data=payload)