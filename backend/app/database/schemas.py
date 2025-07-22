from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class User(BaseModel):
    telegram_id: int
    telegram_handle: str
    session: str | None = None

    class Config:
        from_attributes = True

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
    user_id : Optional[int]
    time_remaining: Optional[int] = None

    class Config:
        from_attributes = True

class TimerStart(BaseModel):
    duration: int #in minutes

class TimerStartShared(BaseModel):
    duration: int #in minutes
    share_id: int


class MachinesByResidenceOut(BaseModel):
    user_id : int 
    machines: List[MachineOut]


class ItemBase(BaseModel):
    item_name: str
    item_price: float
    item_desc: str | None = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    item_id: int
    item_seller: int
    
    class Config:
        from_attributes = True

class CreateLoad(BaseModel):
    machine: int
    capacity: int
    notes: str