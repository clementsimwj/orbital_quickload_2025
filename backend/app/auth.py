from fastapi import HTTPException, Depends, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from typing import Annotated
from configurations import users_collection
import os

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

#env variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/login')

class RegisterUser(BaseModel):
    handle: str
    password: str

class LoginUser(BaseModel):
    handle: str
    password: str

class PasswordChange(BaseModel):
    handle: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

#Register Route:
@router.post("/", status_code=status.HTTP_201_CREATED)
async def register(user_request: RegisterUser):
    user_handle = user_request.handle
    existing_user = users_collection.find_one({"handle": user_handle})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = pwd_context.hash(user_request.password)
    users_collection.insert_one({
        "handle": user_handle,
        "password": hashed_password
    })
    return {"message": "Registration successful"}

#Login Route:
@router.post("/login")
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    existing_user = users_collection.find_one({"handle": form.username})
    if not existing_user or not pwd_context.verify(form.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    expires = datetime.now(timezone.utc) + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    encode = {"handle": form.username, 'expires' : str(expires)}
    token = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, 'token_type': 'bearer'}

#Change-Password Route:
@router.post("/change-password")
async def change_password(data: PasswordChange):
    user = users_collection.find_one({"handle": data.handle})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    hashed = pwd_context.hash(data.new_password)
    users_collection.update_one(
        {"handle": data.handle},
        {"$set": {"password": hashed}}
    )
    return {"message":"Password updated successfully"}


def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        handle: str = payload.get('handle')
        if handle is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                                detail='Could not validate user.')
        return {'handle': handle}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Could not validate user.')