from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, AsyncGenerator
import auth
from database import models
from sqlalchemy import text
from configurations import engine, SessionLocal
from sqlalchemy.orm import Session
from auth import get_current_user

app = FastAPI()
models.Base.metadata.create_all(bind=engine)
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

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
@app.get("/users")
async def get_users(db: db_dependency):
    result = db.query(models.Users).all()
    return result
