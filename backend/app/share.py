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


