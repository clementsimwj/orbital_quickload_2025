from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select, text
from sqlalchemy.orm import joinedload

from typing import Annotated, List
from configurations import get_db
from database import schemas, models
from auth import get_current_user

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
                    users.telegram_handle, 
                    residences.residence_name, 
                    machines.machine_name,
                    shares.capacity,
                    shares.laundry_notes
                FROM shares 
                 INNER JOIN users
                  ON shares.user_creator = users.telegram_id
                 INNER JOIN machines
                  ON shares.machine_id = machines.machine_id
                 INNER JOIN residences
                  ON machines.residence_id = residences.residence_id
                """)
    result = await db.execute(query)
    loads = [dict(m) for m in result.mappings().all()]

    print(loads)
    for i in range(len(loads)):
        loads[i]["residence"] = loads[i].pop("residence_name")
        loads[i]["user"] = loads[i].pop("telegram_handle")
        loads[i]["machine"] = loads[i].pop("machine_name")
        loads[i]["notes"] = loads[i].pop("laundry_notes")
    return loads

#/{residence_id} to return all the machines that corresponds to the residence
@router.get("/{residence_id}")
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
        "user_handle": user["handle"],
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

