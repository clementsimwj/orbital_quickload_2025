from pydantic import BaseModel, Field
from datetime import datetime, timedelta


class User(BaseModel):
    handle: str
    password: str