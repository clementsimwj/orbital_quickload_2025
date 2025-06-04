from datetime import datetime, timedelta
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from configurations import Base

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)