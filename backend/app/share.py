from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select, text
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta, timezone
import asyncio

from typing import Annotated, List
from configurations import get_db
from database import schemas, models
from auth import get_current_user

from util import send_telegram_message, machine_complete_updater


router = APIRouter(
    prefix="/share",
    tags=["share"],
)

user_dependency = Annotated[dict, Depends(get_current_user)]

#getting list of all residences
@router.get("/residences", )
async def get_residences(user: user_dependency, db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    query = text("""
        SELECT residence_id, residence_name
        FROM residences
    """)
    result = await db.execute(query)
    residences = [dict(m) for m in result.mappings().all()]
    for i in range(len(residences)):
        residences[i]["label"] = residences[i].pop("residence_name")
        residences[i]["value"] = residences[i].pop("residence_id")
    return residences

#/gets all the shared loads
@router.get("/shared_loads")
async def get_machines_by_residence(user: user_dependency,
                                    db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    query = text("""
                 SELECT 
                    shares.share_id,
                    users.telegram_handle, 
                    residences.residence_name, 
                    machines.machine_name,
                    machines.machine_id,
                    shares.capacity,
                    shares.laundry_notes,
                    shares_users.user_id
                FROM shares 
                 INNER JOIN users
                  ON shares.user_creator = users.telegram_id
                 INNER JOIN machines
                  ON shares.machine_id = machines.machine_id
                 INNER JOIN residences
                  ON machines.residence_id = residences.residence_id
                 LEFT JOIN shares_users
                  ON shares_users.share_id = shares.share_id
                WHERE shares.started = False
                """)
    result = await db.execute(query)
    all_loads = [dict(m) for m in result.mappings().all()]


    loads = {}
    for load in all_loads:
        if load["user_id"]:
            load["user_id"] = [load["user_id"]]
        else:
            load["user_id"] = []
        if load["share_id"] not in loads:
            loads[load["share_id"]] = load
        else:
            loads[load["share_id"]]["user_id"] += load["user_id"]


    loads = list(loads.values())

    for i in range(len(loads)):
        loads[i]["residence"] = loads[i].pop("residence_name")
        loads[i]["user"] = loads[i].pop("telegram_handle")
        loads[i]["machine"] = loads[i].pop("machine_name")
        loads[i]["notes"] = loads[i].pop("laundry_notes")
        loads[i]["participants"] = loads[i].pop("user_id")
    return {"loads": loads,
            "user_handle": user["handle"],
            "user_id": user["user_id"]}
            

#/{residence_id} to return all the machines that corresponds to the residence
@router.get("/residence/{residence_id}")
async def get_machines_based_on_residence(residence_id: int,
                                    user: user_dependency,
                                    db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    query = text("""SELECT machine_id, machine_name 
                FROM machines 
                WHERE residence_id = :residence_id
                ORDER BY machine_name""")
    result = await db.execute(query, {"residence_id": residence_id})
    machines = [dict(m) for m in result.mappings().all()]
    for i in range(len(machines)):
        machines[i]["label"] = machines[i].pop("machine_name")
        machines[i]["value"] = machines[i].pop("machine_id")
    print(machines)
    return {
        "machines": machines
    }


#Creates a Load
@router.post("/create_load")
async def create_load(body: schemas.CreateLoad,
                        user: user_dependency,
                        db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    
    query = text("""
        INSERT INTO shares (user_creator, machine_id, laundry_notes, capacity)
        VALUES (:user_id, :machine_id, :notes, :capacity)
    """)
    params = {
        "user_id": user["user_id"],
        "machine_id": body.machine,
        "notes": body.notes,
        "capacity": body.capacity
    }
    await db.execute(query, params)
    await db.commit()

    return {"message" : "Load has been created successfully"}


#Joins a Load
@router.post("/join_load/{share_id}")
async def join_load(share_id: int,
                        user: user_dependency,
                        db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    ## we will start with a check if capacity has been reached already or not

    ## possible errors where the user themselves try joining, or a user who is already in the
    ## shared load tries joining will not occur as they do not have access to the join button
    query = text("""
        SELECT COUNT(user_id)
        FROM shares_users
        WHERE shares_users.share_id = :share_id
    """)

    query2 = text("""
        SELECT capacity
        FROM shares
        WHERE shares.share_id = :share_id
    """)
    result = await db.execute(query, {"share_id": share_id})
    result2 = await db.execute(query2, {"share_id": share_id})
    participant_number = result.scalars().first()
    ## we get capacity from database instead of passing in from frontend 
    ## in case frontend does not have latest data
    capacity = result2.scalars().first() 
    
    if participant_number + 1 >= capacity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail='Capacity for this load has been reached')
    
    ## the actual joining load part
    query3 = text("""
        INSERT INTO shares_users (share_id, user_id)
        VALUES (:share_id, :user_id)
    """)

    await db.execute(query3, {"share_id": share_id, "user_id": user["user_id"]})


    query4 = text("""
        SELECT shares.user_creator, machines.machine_name
        FROM shares
        INNER JOIN machines
         on shares.machine_id = machines.machine_id
        WHERE shares.share_id = :share_id
                  """)
    row = await db.execute(query4, {"share_id": share_id, "user_id": user["user_id"]})
    load_data = row.mappings().first()
    load_creator_id = load_data["user_creator"]
    load_machine_name = load_data["machine_name"]

    await send_telegram_message(load_creator_id, f"✅ @{user["handle"]} has joined your load on machine {load_machine_name}")

    await db.commit()
    return {"message" : "Load has been joined successfully"}


#Quits a Load
@router.post("/quit_load/{share_id}")
async def quit_load(share_id: int,
                        user: user_dependency,
                        db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    
    query = text("""
        DELETE FROM shares_users 
        WHERE share_id = :share_id AND user_id = :user_id
    """)

    await db.execute(query, {"share_id": share_id, "user_id": user["user_id"]})

    query2 = text("""
        SELECT shares.user_creator, machines.machine_name
        FROM shares
        INNER JOIN machines
         on shares.machine_id = machines.machine_id
        WHERE shares.share_id = :share_id
                  """)
    row = await db.execute(query2, {"share_id": share_id, "user_id": user["user_id"]})
    load_data = row.mappings().first()
    load_creator_id = load_data["user_creator"]
    load_machine_name = load_data["machine_name"]

    await send_telegram_message(load_creator_id, f"❌ @{user["handle"]} has quit your load on machine {load_machine_name}")


    await db.commit()

    return {"message" : "Load has been quit successfully"}


#Starts a Shared Load
@router.post("/start_load/{machine_id}")
async def start_machine(machine_id: int,
                        body: schemas.TimerStartShared,
                        user: user_dependency,
                        db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    
    time_start = datetime.now(timezone(timedelta(hours=8)))
    time_end = time_start + timedelta(minutes=body.duration)
    query = text("""
        INSERT INTO notifications (time_start, time_end, machine_id, telegram_id, share_id)
        VALUES (:time_start, :time_end, :machine_id, :telegram_id, :share_id)
    """)
    params = {
        "time_start": time_start.replace(tzinfo=None),
        "time_end": time_end.replace(tzinfo=None),
        "machine_id": machine_id,
        "telegram_id": user["user_id"],
        "share_id": body.share_id
    }
    query2 = text("""UPDATE machines
                     SET status = 'in use'
                     WHERE machine_id = :machine_id""")
    query3 = text("""
        UPDATE shares
        SET started = True
        WHERE share_id = :share_id
    """)
    
    await db.execute(query, params)
    await db.execute(query2, {"machine_id" : machine_id})
    await db.execute(query3, {"share_id" : body.share_id})
    await db.commit()

    #Background task
    asyncio.create_task(machine_complete_updater(machine_id, body.duration, db))
    return {"message" : "Timer has been set successfully"}


