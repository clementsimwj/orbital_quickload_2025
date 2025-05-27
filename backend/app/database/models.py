from pydantic import BaseModel, Field
from datetime import datetime, timedelta


class User(BaseModel):
    tele_handle: str
    hashed_password: str