from datetime import datetime, timedelta
from sqlalchemy import DateTime, Enum, Boolean, Column, ForeignKey, Integer, String, BigInteger
from configurations import Base
from sqlalchemy.orm import declarative_base, relationship
import enum

class User(Base):
    __tablename__ = 'users'

    telegram_id = Column(BigInteger, primary_key=True, index=True)
    telegram_handle = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    session = Column(String(255), nullable=False)

class Residence(Base):
    __tablename__ = 'residences'
    residence_id = Column(Integer, primary_key=True, index=True)
    residence_name = Column(String(255), nullable=False)

class MachineTypeEnum(str, enum.Enum):
    washer = "washing_machine"
    dryer = "dryer"

class Machine(Base):
    __tablename__ = "machines"

    machine_id = Column(Integer, primary_key=True, index=True)
    machine_type = Column(Enum(MachineTypeEnum), nullable=False)
    status = Column(Boolean, nullable=False)
    machine_name = Column(String(255), nullable=False)
    residence_id = Column(Integer, ForeignKey("residences.residence_id"))

    residence = relationship("Residence", backref="machines")

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(BigInteger, primary_key=True, index=True)
    time_start = Column(DateTime, nullable=False)
    time_end = Column(DateTime, nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.machine_id"), nullable=False)
    telegram_id = Column(BigInteger, ForeignKey("users.telegram_id"), nullable=False)

    machine = relationship("Machine", backref="notifications")
    user = relationship("User", backref="notifications")