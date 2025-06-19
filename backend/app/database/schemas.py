from enum import Enum
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    telegram_id: int
    telegram_handle: str
    session: str | None = None

    class Config:
        orm_mode = True

class MachineTypeEnum(str, Enum):
    washer = "washing_machine"
    dryer = "dryer"

class MachineStatusEnum(str, Enum):
    in_use = "in use"
    complete = "complete"
    available = "available"

class MachineOut(BaseModel):
    machine_id: int
    machine_type: MachineTypeEnum
    status: Optional[MachineStatusEnum]
    machine_name: str

    class Config:
        orm_mode = True
