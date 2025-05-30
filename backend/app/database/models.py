from pydantic import BaseModel, Field
from datetime import datetime, timedelta


class User(BaseModel):
    user_id: str
    handle: str
    password: str
    session: str