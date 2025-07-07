import asyncio
import httpx
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, List
import auth

from store import router as store_router
from database import schemas
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from configurations import get_db, create_tables, async_session
from auth import get_current_user
import os
import requests
from dotenv import load_dotenv

load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("BOT_TOKEN")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield
    
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    # Replace with specific domain in production
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(store_router)
user_dependency = Annotated[dict, Depends(get_current_user)]

#homepage
@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    return {"User": user}
#Returns 
#{ "User" : {"user_id": user_id, "user_handle": user_handle}}

#/{residence_id} to return all the machines that corresponds to the residence
@app.get("/{residence_id}", response_model=schemas.MachinesByResidenceOut)
async def get_machines_by_residence(residence_id: int,
                                    user: user_dependency,
                                    db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    query = text("""SELECT machine_id, machine_type, status, machine_name 
                FROM machines 
                WHERE residence_id = :residence_id
                ORDER BY machine_name""")
    result = await db.execute(query, {"residence_id": residence_id})
    machines = [dict(m) for m in result.mappings().all()]

    for machine in machines:
        if machine['status'] == "complete":
            notif_query = text("""SELECT telegram_id from notifications WHERE machine_id = :machine_id and done = false""")
            notif_result = await db.execute(notif_query, {"machine_id": machine['machine_id']})
            notif = notif_result.scalars().first()
            print(notif)
            machine['user_id'] = notif if notif else None
        elif machine['status'] == "in use":
            notif_query = text("""
                SELECT telegram_id, time_end FROM notifications
                WHERE machine_id = :machine_id AND done = false
                ORDER BY time_end DESC LIMIT 1
            """)
            notif_result = await db.execute(notif_query, {"machine_id": machine['machine_id']})
            notif = notif_result.mappings().first()
            if notif:
                time_end = notif['time_end']
                now = datetime.now()  # naive if your DB stores naive timestamps

                remaining_seconds = (time_end - now).total_seconds()
                if remaining_seconds < 0:
                    remaining_seconds = 0  # clamp to zero if overdue

                machine['time_remaining'] = int(remaining_seconds)
                machine['user_id'] = notif['telegram_id']
            else:
                machine['time_remaining'] = None
                machine['user_id'] = None
        else:
            machine['user_id'] = None
    print(machines)
    return {
        "user_id": user["user_id"],
        "machines": machines
    }
#returns a list [] of machines in the schema declared in schemas.MachineOut
#class MachineOut(BaseModel):
#    machine_id: int
#    machine_type: MachineTypeEnum
#    status: Optional[MachineStatusEnum]
#    machine_name: str
#    user_id : int or None

#Indicates the machine to use
@app.post("/{machine_id}")
async def start_machine(machine_id: int,
                        body: schemas.TimerStart,
                        user: user_dependency,
                        db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    
    time_start = datetime.now(timezone(timedelta(hours=8)))
    time_end = time_start + timedelta(minutes=body.duration)
    query = text("""
        INSERT INTO notifications (time_start, time_end, machine_id, telegram_id)
        VALUES (:time_start, :time_end, :machine_id, :telegram_id)
    """)
    params = {
        "time_start": time_start.replace(tzinfo=None),
        "time_end": time_end.replace(tzinfo=None),
        "machine_id": machine_id,
        "telegram_id": user["user_id"]
    }
    query2 = text("""UPDATE machines
                     SET status = 'in use'
                     WHERE machine_id = :machine_id""")
    await db.execute(query, params)
    await db.execute(query2, {"machine_id" : machine_id})
    await db.commit()

    #Background task
    asyncio.create_task(machine_complete_updater(machine_id, body.duration, db))
    return {"message" : "Timer has been set successfully"}

#Collect the laundry from any specific machine
@app.post("/collect/{machine_id}")
async def collect_machine(machine_id: int,
                        user: user_dependency,
                        db: AsyncSession = Depends(get_db)):
    query = text("SELECT * FROM machines WHERE machine_id = :machine_id")
    result = await db.execute(query, {"machine_id": machine_id})
    machine = result.fetchone()

    #Validate Machine and User
    if not machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not Found")
    if machine.status != 'complete':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Machine status is not complete")
    notif_query = text(
        "SELECT * FROM notifications WHERE telegram_id = :user_id AND machine_id = :machine_id AND done = false"
    )
    notif_result = await db.execute(notif_query, {"user_id" : user["user_id"], "machine_id" : machine_id})
    notification = notif_result.fetchone()
    print(notification)
    if not notification:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this machine")
    
    # Update machine status to available
    update_query = text(
        "UPDATE machines SET status = 'available' WHERE machine_id = :machine_id"
    )
    await db.execute(update_query, {"machine_id": machine_id})
    update_notification_query = text("""
        UPDATE notifications SET done = true WHERE notification_id = :notif_id
    """)
    await db.execute(update_notification_query, {"notif_id": notification.notification_id})
    await db.commit()

    return {"message": "Machine status updated to available"}


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