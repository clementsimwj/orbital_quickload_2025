from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from configurations import users_collection

#env variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")


app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterUser(BaseModel):
    handle: str
    password: str

class LoginUser(BaseModel):
    handle: str
    password: str

class PasswordChange(BaseModel):
    handle: str
    new_password: str

#Register Route:
@app.post("/register")
def register(user: RegisterUser):
    existing_user = users_collection.find_one({"handle": user.handle})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({
        "handle": user.handle,
        "password": hashed_password
    })
    return {"message": "Registration successful"}

#Login Route:
@app.post("/login")
def login(user: LoginUser):
    existing_user = users_collection.find_one({"handle": user.handle})
    if not user or not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    token = jwt.encode({"handle":user.handle}, SECRET_KEY, algorithm=ALGORITHM)
    return {"token":token}

#Change-Password Route:
@app.post("/change-password")
def change_password(data: PasswordChange):
    user = users_collection.find_one({"handle": data.handle})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    hashed = pwd_context.hash(data.new_password)
    users_collection.update_one(
        {"handle": data.handle},
        {"$set": {"password": hashed}}
    )
    return {"message":"Password updated successfully"}









