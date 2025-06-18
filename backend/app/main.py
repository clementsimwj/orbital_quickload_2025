from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
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

@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    return {"User": user}
#Returns 
#{ "User" : {"user_id": user_id, "user_handle": user_handle}}


#returns all users in the users table
@app.get("/users", response_model=list[schemas.User])
async def get_users(db: AsyncSession = Depends(get_db)):
    query = text("SELECT telegram_id, telegram_handle, session FROM users")
    result = await db.execute(query)
    users = result.mappings().all()
    return users
