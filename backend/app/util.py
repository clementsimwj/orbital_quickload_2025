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

        # get telegram id for main user
        result = await db.execute(
            text("""SELECT notifications.telegram_id, notifications.share_id, machines.machine_name 
                 FROM notifications
                 INNER JOIN machines
                  on notifications.machine_id = machines.machine_id
                 WHERE notifications.machine_id = :machine_id AND notifications.done = false"""),
            {"machine_id": machine_id}
        )
        row = result.mappings().first()
        share_id = None
        if row:
            chat_id_arr = [row.telegram_id]
            share_id = row.share_id
            machine_name = row.machine_name

        # if it is a shared load
        if share_id:
            query = text("""
                SELECT user_id
                FROM shares_users
                WHERE share_id = :share_id
            """)
            result2 = await db.execute(query, {"share_id": share_id})
            row2 = result2.mappings().all()
            if row2:
                for row in row2:
                    chat_id_arr.append(row.user_id)
        await db.commit()
        for id in chat_id_arr: 
            await send_telegram_message(id, f"✅ Your laundry on {machine_name} is complete!")

async def send_telegram_message(chat_id: str, message: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message
    }
    async with httpx.AsyncClient() as client:
        await client.post(url, data=payload)