from sqlalchemy import DateTime, Enum, Boolean, Column, Float, ForeignKey, Integer, Numeric, String, BigInteger
from configurations import Base
from sqlalchemy.orm import declarative_base, relationship
import enum

class User(Base):
    __tablename__ = 'users'

    telegram_id = Column(BigInteger, primary_key=True, index=True)
    telegram_handle = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    session = Column(String(255), nullable=False)

    items = relationship("Item", back_populates="user")
    shares = relationship("Share", back_populates = "giver")
    shares_users = relationship("ShareUser", back_populates = "receiver")

class Residence(Base):
    __tablename__ = 'residences'
    residence_id = Column(Integer, primary_key=True, index=True)
    residence_name = Column(String(255), nullable=False)

class MachineTypeEnum(str, enum.Enum):
    washer = "washing_machine"
    dryer = "dryer"

class MachineStatusEnum(str, enum.Enum):
    available = "available"
    complete = "complete"
    in_use = "in use"
    none = None

class Machine(Base):
    __tablename__ = "machines"

    machine_id = Column(Integer, primary_key=True, index=True)
    machine_type = Column(Enum(MachineTypeEnum), nullable=False)
    status = Column(Enum(MachineStatusEnum), nullable=True)
    machine_name = Column(String(255), nullable=False)
    residence_id = Column(Integer, ForeignKey("residences.residence_id"))

    residence = relationship("Residence", backref="machines")
    shares = relationship("Share", back_populates = "machine")

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(BigInteger, primary_key=True, index=True)
    time_start = Column(DateTime, nullable=False)
    time_end = Column(DateTime, nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.machine_id"), nullable=False)
    telegram_id = Column(BigInteger, ForeignKey("users.telegram_id"), nullable=False)
    done = Column(Boolean, nullable=False, default=False)

    machine = relationship("Machine", backref="notifications")
    user = relationship("User", backref="notifications")

class Item(Base):
    __tablename__ = "items"

    item_id = Column(BigInteger, primary_key=True, index=True)
    item_name = Column(String, index=True)
    item_price = Column(Numeric(10, 2), nullable=False)
    item_desc = Column(String, nullable=True)
    item_seller = Column(BigInteger, ForeignKey("users.telegram_id"), nullable=False)

    user = relationship("User", back_populates="items")

class Share(Base):
    __tablename__ = "shares"

    share_id = Column(BigInteger, primary_key = True, index = True)
    user_creator = Column(BigInteger, ForeignKey("users.telegram_id"), nullable = False)
    laundry_notes = Column(String, nullable = False)
    machine_id = Column(BigInteger, ForeignKey("machines.machine_id"), nullable = False)
    capacity = Column(Integer, nullable = False)

    giver = relationship("User", back_populates = "shares")
    machine = relationship("Machine", back_populates = "shares")
    shares_users = relationship("ShareUser", back_populates = "share")

class ShareUser(Base):
    __tablename__ = "shares_users"

    share_user_id = Column(BigInteger, primary_key = True, index = True)
    share_id = Column(BigInteger, ForeignKey("shares.share_id"), nullable = False)
    user_id = Column(BigInteger, ForeignKey("users.telegram_id"), nullable = False)

    share = relationship("Share", back_populates = "shares_users")
    receiver = relationship("User", back_populates = "shares_users")
