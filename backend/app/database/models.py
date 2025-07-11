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
    given_shares = relationship(
        "Share",
        foreign_keys="Share.user_share",
        back_populates="giver"
    )
    received_shares = relationship(
        "Share",
        foreign_keys="Share.user_receive",
        back_populates="receiver"
    )

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

    share_id = Column(BigInteger, primary_key=True, index=True)
    time_start = Column(DateTime, nullable=False)
    time_end = Column(DateTime, nullable=False)
    user_share = Column(BigInteger, ForeignKey("users.telegram_id"), nullable=False)
    user_receive = Column(BigInteger, ForeignKey("users.telegram_id"), nullable=True)
    machine_id = Column(BigInteger, ForeignKey("machines.machine_id"), nullable=True)

    giver = relationship(
        "User",
        foreign_keys=[user_share],
        back_populates="given_shares"
    )
    receiver = relationship(
        "User",
        foreign_keys=[user_receive],
        back_populates="received_shares"
    )
    machine = relationship("Machine", backref="shares")
