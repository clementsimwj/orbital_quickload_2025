from pydantic import BaseModel
from .models import MachineStatusEnum

class User(BaseModel):
    telegram_id: int
    telegram_handle: str
    session: str | None = None

    class Config:
        orm_mode = True

class MachineOut(BaseModel):
    machine_id: int
    machine_name: str
    status: MachineStatusEnum

    class Config:
        orm_mode = True
