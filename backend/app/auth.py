from fastapi import HTTPException, Depends, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database.models import User
from configurations import get_db
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
    user_id: int
    handle: str
    password: str

class LoginUser(BaseModel):
    handle: str
    password: str

class UpdateHandle(BaseModel):
    user_id: int
    new_handle: str

class PasswordChange(BaseModel):
    user_id: int
    handle: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

#Register Route:
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterUser, db: AsyncSession = Depends(get_db)):
    existing_user = await db.get(User, request.user_id)
    print(existing_user)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already Exists")
    hashed_password = pwd_context.hash(request.password)
    new_user = User(
        telegram_id = request.user_id,
        telegram_handle = request.handle,
        password = hashed_password,
        session = None
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "Registration successful"}

#Login Route:
@router.post("/login")
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)):
    query = text("SELECT * FROM users where telegram_handle = :username")
    params = {"username": form.username}
    result = await db.execute(query, params)
    existing_user = result.one_or_none()

    print(existing_user)
    if not existing_user or not pwd_context.verify(form.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid Credentials. Make sure you update any changes to your telegram handle!")
    #Create Encoded Token:
    user_id = existing_user.telegram_id
    expiration = datetime.now(timezone.utc) + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    exp = int(expiration.timestamp())
    encode = {"user_id" : user_id, 'expires' : exp}
    token = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, 'token_type': 'bearer'}

#Change-Password Route:
@router.post("/change-password")
async def change_password(data: PasswordChange, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password = pwd_context.hash(data.new_password)
    user.telegram_handle = data.handle
    await db.commit()
    return {"message":"Password updated successfully"}

#Update Telegram Handle:
@router.post("/update")
async def update_handle(data: UpdateHandle, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    user.telegram_handle = data.new_handle
    await db.commit()
    return {"message" : "Updated Telegram Handle Successfully"}

#Get the user_id and user_handle
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)], db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                                detail='Could not validate user.')
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
        return {"user_id": user.telegram_id, "handle": user.telegram_handle}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Could not validate user.')