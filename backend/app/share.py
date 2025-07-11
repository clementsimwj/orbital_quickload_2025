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


