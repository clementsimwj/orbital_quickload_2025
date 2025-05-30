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
    user_id: str
    handle: str
    password: str

class LoginUser(BaseModel):
    handle: str
    password: str

class UpdateHandle(BaseModel):
    user_id: str
    new_handle: str

class PasswordChange(BaseModel):
    user_id: str
    handle: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

#Register Route:
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterUser):
    user_id = request.user_id
    user_handle = request.handle
    existing_user = users_collection.find_one({"user_id": user_id})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = pwd_context.hash(request.password)
    users_collection.insert_one({
        "user_id": user_id,
        "handle": user_handle,
        "password": hashed_password,
        "session": None
    })
    return {"message": "Registration successful"}

#Login Route:
@router.post("/login")
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    existing_user = users_collection.find_one({"handle": form.username})
    if not existing_user or not pwd_context.verify(form.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    #Create Encoded Token:
    user_id = existing_user["user_id"]
    expiration = datetime.now(timezone.utc) + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    exp = int(expiration.timestamp())
    encode = {"user_id" : user_id, 'expires' : exp}
    token = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, 'token_type': 'bearer'}

#Change-Password Route:
@router.post("/change-password")
async def change_password(data: PasswordChange):
    user = users_collection.find_one({"user_id": data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    hashed = pwd_context.hash(data.new_password)
    users_collection.update_one(
        {"user_id": data.user_id},
        {"$set": {"password": hashed}}
    )
    users_collection.update_one(
        {"user_id": data.user_id},
        {"$set": {"handle": data.handle}}
    )
    return {"message":"Password updated successfully"}

#Update Telegram Handle:
@router.post("/update")
async def update_handle(data: UpdateHandle):
    user_id = data.user_id
    new_handle = data.new_handle
    existing_user = users_collection.find_one({"user_id" : user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User does not exist")
    users_collection.update_one(
        {"user_id": user_id},              
        {"$set": {"handle": new_handle}}
    )
    return {"message" : "Updated Telegram Handle Successfully"}


def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                                detail='Could not validate user.')
        return {'user_id': user_id}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Could not validate user.')