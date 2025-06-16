from pydantic import BaseModel

class User(BaseModel):
    telegram_id: int
    telegram_handle: str
    session: str | None = None

    class Config:
        orm_mode = True