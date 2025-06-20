from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, List
import auth
from database import schemas
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from configurations import get_db, create_tables
from auth import get_current_user

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
user_dependency = Annotated[dict, Depends(get_current_user)]

#To get all users (experiment only don't actually use this route)
@app.get("/users", response_model=list[schemas.User])
async def get_users(db: AsyncSession = Depends(get_db)):
    query = text("SELECT telegram_id, telegram_handle, session FROM users")
    result = await db.execute(query)
    users = result.mappings().all()
    return users


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
@app.get("/{residence_id}", response_model=List[schemas.MachineOut])
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
    print(result)
    machines = result.mappings().all()
    return machines
#returns a list [] of machines in the schema declared in schemas.MachineOut
#class MachineOut(BaseModel):
#    machine_id: int
#    machine_type: MachineTypeEnum
#    status: Optional[MachineStatusEnum]
#    machine_name: str

